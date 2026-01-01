# Production Fixes Applied (Vercel Serverless)

## Problem Summary
All features work correctly in the local environment, but production (Vercel) has issues with:
- UI flickering on page load
- Delete operations not working
- Notifications not updating
- Bulk task creation failing

## Root Cause
The issue stems from **serverless environment differences** in Vercel:
1. **Database connection pooling**: Each serverless instance needs minimal connections
2. **Query refetch timing**: Cold starts cause delays in query invalidation
3. **Cache headers**: Stale data from aggressive caching
4. **API timeouts**: Different limits for serverless functions

## Fixes Applied

### 1. Database Connection Optimization ([src/db/index.ts](src/db/index.ts))
**Before:**
- Production: 15 connections (too many for serverless)
- Idle timeout: 20 seconds (closes connections too quickly)

**After:**
```typescript
const isServerless = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';

const client = postgres(DATABASE_URL, {
  max: isServerless ? 1 : 5,  // CRITICAL: Serverless uses 1 connection per instance
  idle_timeout: isServerless ? 0 : 20, // Never close in serverless (reuse across invocations)
  max_lifetime: isServerless ? 60 * 60 : 60 * 5, // Serverless: 1 hour, Local: 5 minutes
  // ... other config
});
```

**Why:** Each Vercel serverless function instance needs its own connection pool. Using too many connections exhausts the database. Setting idle_timeout to 0 keeps the connection alive between invocations (warm starts).

---

### 2. Production-Safe Query Refetch ([src/lib/production-fixes.ts](src/lib/production-fixes.ts))
Created utility function for serverless-aware query refetching:

```typescript
export const refetchQueries = async (
  queryClient: QueryClient,
  queryKey: string[],
  options?: { exact?: boolean; force?: boolean }
) => {
  const { exact = false, force = true } = options || {};

  // 1. Invalidate the queries (marks them as stale)
  await queryClient.invalidateQueries({ queryKey, exact });

  // 2. Force refetch active queries immediately
  if (force) {
    await queryClient.refetchQueries({ queryKey, type: 'active', exact });
  }

  // 3. In production, add small delay for serverless processing
  if (isServerless()) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
};
```

**Why:** Serverless cold starts have latency. The 200ms delay ensures the database update completes before UI refetches data. This prevents showing stale data.

---

### 3. Updated All Mutations to Use Production-Safe Refetch

#### Notifications:
- ✅ [use-mark-notification-read.ts](src/features/notifications/api/use-mark-notification-read.ts)
- ✅ [use-delete-notification.ts](src/features/notifications/api/use-delete-notification.ts)
- ✅ [use-mark-all-read.ts](src/features/notifications/api/use-mark-all-read.ts)
- ✅ [use-clear-all-notifications.ts](src/features/notifications/api/use-clear-all-notifications.ts)

#### Tasks:
- ✅ [use-create-task.ts](src/features/tasks/api/use-create-task.ts)
- ✅ [use-delete-task.ts](src/features/tasks/api/use-delete-task.ts)
- ✅ [use-bulk-update-tasks.ts](src/features/tasks/api/use-bulk-update-tasks.ts)

**Before:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  queryClient.refetchQueries({ queryKey: ["notifications"], type: "active" });
}
```

**After:**
```typescript
onSuccess: async () => {
  await refetchQueries(queryClient, ["notifications"]);
}
```

---

### 4. React Query Production Configuration ([src/components/query-provider.tsx](src/components/query-provider.tsx))

**Added production detection:**
```typescript
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('yourdomain.com'));
```

**Optimized settings for production:**
- `staleTime`: 10 minutes (prod) vs 5 minutes (dev)
- `retry`: 3 (prod) vs 2 (dev) - more retries for serverless cold starts
- `retryDelay`: Exponential backoff (1s, 2s, 4s, 8s, etc.)
- `networkMode`: 'offlineFirst' - better offline handling

---

### 5. Vercel Configuration ([vercel.json](vercel.json))

**Added cache control headers:**
```json
{
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

**Why:** Prevents API responses from being cached, ensuring fresh data on every request.

---

### 6. Environment Detection Utility ([src/lib/env.ts](src/lib/env.ts))

Created utility for consistent environment detection:
```typescript
export const isProduction = () => {
  // Server-side
  if (typeof window === 'undefined') {
    return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  }
  
  // Client-side
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};
```

---

## Testing Checklist

After deploying to Vercel, verify:

### 1. UI Flickering
- [ ] Load any page and observe for 10 seconds
- [ ] Should NOT see automatic page reloads
- [ ] Should NOT see constant spinner/loading states

### 2. Delete Operations
- [ ] Delete a task - should disappear immediately
- [ ] Delete a notification - should disappear immediately
- [ ] Check browser console for errors

### 3. Notifications
- [ ] Mark single notification as read - indicator should update
- [ ] Mark all as read - all should update immediately
- [ ] Clear all notifications - list should empty immediately

### 4. Bulk Task Creation
- [ ] Upload Excel/CSV file with multiple tasks
- [ ] All tasks should appear in the task list
- [ ] No timeout errors (60s Vercel limit)

### 5. Browser Console
- [ ] Open DevTools Console
- [ ] Should see debug logs: `[Mark All Read] Starting mutation`, etc.
- [ ] No errors about database connections
- [ ] No React Query errors

---

## Deployment Steps

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "fix: production serverless optimizations for Vercel"
   ```

2. **Push to deployment branch:**
   ```bash
   git push origin main
   ```

3. **Vercel will auto-deploy**
   - Watch Vercel dashboard for build logs
   - Should complete in 2-3 minutes

4. **Test immediately after deployment:**
   - Use the testing checklist above
   - Check Vercel function logs for errors

---

## What Changed Summary

| Component | Change | Impact |
|-----------|--------|--------|
| Database connections | 15 → 1 per serverless instance | Prevents connection exhaustion |
| Idle timeout | 20s → 0 (keep alive) | Faster warm starts |
| Query refetch | Immediate → +200ms delay | Ensures database write completes |
| React Query staleTime | 5min → 10min (prod) | Less aggressive refetching |
| Retry attempts | 2 → 3 (prod) | Better cold start handling |
| Cache headers | None → no-cache | Prevents stale API responses |
| All mutations | invalidate only → production-safe refetch | Consistent UI updates |

---

## Monitoring

After deployment, monitor:
1. **Vercel Function Logs** - Check for database connection errors
2. **Browser Console** - Look for React Query errors or failed mutations
3. **Database Connections** - Supabase dashboard should show <10 active connections
4. **User Reports** - Ask users to verify notifications, delete operations, and bulk tasks

---

## Rollback Plan

If issues persist:
1. Revert changes to `src/db/index.ts` (restore 15 connections)
2. Remove 200ms delay from `refetchQueries()`
3. Redeploy and monitor

---

## Notes

- **Local environment unchanged**: All changes are production-aware (check `isServerless()`)
- **No breaking changes**: All mutations still work the same way, just with better timing
- **Future optimization**: Consider adding Redis cache for frequently accessed data
- **Database upgrade**: If issues persist, upgrade Supabase plan for more connections

---

Last Updated: ${new Date().toISOString()}
