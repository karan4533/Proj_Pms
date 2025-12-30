# 🔒 PRODUCTION AUTH FIX - DEPLOYMENT GUIDE

## ✅ Issues Fixed

This update resolves the following production authentication issues:

1. **Logout hanging** - Timeout added, proper cookie deletion
2. **Auto-login after logout** - Cookie domain/SameSite consistency  
3. **Session persistence** - Middleware clears expired cookies
4. **HTTPS redirect loops** - Proper secure flag handling
5. **Cross-origin issues** - CORS properly configured
6. **Stale sessions** - Automatic cleanup on 401

---

## 🚀 Required Environment Variables

Add to **Vercel Environment Variables** (Settings → Environment Variables):

```bash
# CRITICAL: Must match your production domain exactly
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Database (existing)
DATABASE_URL=your_postgresql_connection_string

# Email (existing)
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

### ⚠️ Important Notes:

- `NEXT_PUBLIC_APP_URL` **must NOT have trailing slash**
- Must use **HTTPS** in production (vercel.app domains are HTTPS by default)
- If using custom domain, update to: `https://yourdomain.com`

---

## 📋 Deployment Checklist

### 1. Update Environment Variables in Vercel
```bash
# Go to: https://vercel.com/[your-team]/[your-project]/settings/environment-variables
# Set:
NEXT_PUBLIC_APP_URL=https://your-actual-domain.vercel.app
```

### 2. Verify Cookie Configuration
The following cookie settings are now enforced:

| Setting | Development | Production |
|---------|-------------|------------|
| `httpOnly` | ✅ true | ✅ true |
| `secure` | ❌ false | ✅ true |
| `sameSite` | lax | lax |
| `domain` | (none) | auto-detected from URL |
| `path` | / | / |

### 3. Test Logout Flow

After deployment, test these scenarios:

```javascript
// ✅ Should work: Normal logout
1. Login → Dashboard → Logout → Should redirect to /sign-in
2. Verify cookie deleted in DevTools (Application → Cookies)
3. Try to access /dashboard → Should redirect to /sign-in

// ✅ Should work: Session expiration
1. Login → Wait for session expiry (or manually delete from DB)
2. Refresh page → Should auto-logout and redirect

// ✅ Should work: Manual cookie deletion
1. Login → Delete cookie in DevTools
2. Refresh → Should redirect to /sign-in

// ✅ Should work: Concurrent sessions
1. Login on Browser A
2. Login on Browser B (same account)
3. Logout on Browser A
4. Browser B should still work (separate session)
```

### 4. Verify Middleware Protection

New middleware at `src/middleware.ts` protects routes:

- **Protected routes**: `/dashboard`, `/projects`, `/tasks`, etc.
- **Auth routes**: `/sign-in`, `/sign-up`

Test:
```
1. Logout completely
2. Try to access /dashboard directly → Redirects to /sign-in
3. Login, then try to access /sign-in → Redirects to /dashboard
```

---

## 🔧 Files Changed

### Server-Side (API Routes)
1. **`src/features/auth/server/route.ts`** 
   - ✅ Cookie domain auto-detection
   - ✅ Consistent SameSite (lax)
   - ✅ Matching set/delete configurations

2. **`src/lib/session-middleware.ts`**
   - ✅ Auto-cleanup expired cookies
   - ✅ 401 responses clear cookies

3. **`src/app/api/[[...route]]/route.ts`**
   - ✅ CORS configuration for production
   - ✅ Credentials support

### Client-Side
4. **`src/features/auth/api/use-logout.ts`**
   - ✅ Production URL handling
   - ✅ Cache control headers
   - ✅ Proper credentials mode

### Middleware
5. **`src/middleware.ts`** (NEW)
   - ✅ Edge-level cookie cleanup
   - ✅ Route protection
   - ✅ Auth redirect handling

---

## 🐛 Debugging Production Issues

### If logout still hangs:

```bash
# Check Vercel Function Logs
vercel logs --follow

# Look for:
[Logout] Starting logout process
[Logout] Session token present: true
[Logout] Session deleted successfully
[Logout] Logout successful
```

### If auto-login persists:

1. **Check cookie deletion**:
   ```javascript
   // Browser DevTools → Application → Cookies
   // After logout, 'jcn-jira-clone-session' should be GONE
   ```

2. **Verify domain matches**:
   ```bash
   # In Vercel deployment logs, check:
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   
   # Should NOT be:
   # - http:// (insecure)
   # - localhost
   # - Different domain
   ```

3. **Check SameSite warnings**:
   ```
   Browser Console → Look for warnings like:
   "Cookie 'jcn-jira-clone-session' has been rejected because 
    it is in a cross-site context and its 'SameSite' is 'Strict' or 'None'."
   ```

### Common Production Pitfalls:

| Issue | Cause | Fix |
|-------|-------|-----|
| Cookie not deleted | SameSite mismatch | ✅ Fixed: Now uses 'lax' consistently |
| 401 but still logged in | Cookie not cleared on auth fail | ✅ Fixed: Middleware clears expired cookies |
| Logout timeout | Network issues, hanging requests | ✅ Fixed: 2-second timeout + fallback |
| HTTPS redirect loop | Secure flag mismatch | ✅ Fixed: Auto-detects production |
| Cross-origin blocked | Missing CORS | ✅ Fixed: CORS configured |

---

## 🔒 Security Notes

### What Changed:
- ✅ **httpOnly** remains enabled (prevents XSS)
- ✅ **secure** flag auto-enabled in production (HTTPS only)
- ✅ **SameSite=lax** (balanced security + functionality)
- ✅ **Domain explicit** in production (prevents subdomain issues)

### Why SameSite='lax' instead of 'strict'?

- **'strict'** blocks cookies on ALL cross-site navigation (including direct links)
- **'lax'** allows cookies on safe top-level navigation (GET requests)
- **Production reality**: Most apps need 'lax' to function properly

This is secure because:
1. httpOnly prevents JavaScript access
2. secure flag enforces HTTPS
3. lax still blocks cross-site POST/AJAX
4. Domain scoping prevents subdomain attacks

---

## ✅ Success Criteria

After deployment, these should ALL be true:

- [ ] Logout redirects to /sign-in within 3 seconds
- [ ] Cookie 'jcn-jira-clone-session' is deleted after logout
- [ ] Cannot access /dashboard after logout without re-login
- [ ] Login works normally
- [ ] Session persists across page refreshes (when logged in)
- [ ] No console errors related to cookies or CORS
- [ ] No "Set-Cookie" warnings in browser console
- [ ] Concurrent sessions work independently

---

## 🚨 Rollback Plan

If issues persist after deployment:

1. **Revert middleware.ts**: 
   ```bash
   git rm src/middleware.ts
   git commit -m "Revert: Remove middleware"
   git push
   ```

2. **Revert to simple cookie config**:
   ```typescript
   // In route.ts, temporarily simplify:
   setCookie(c, AUTH_COOKIE, sessionToken, {
     path: "/",
     httpOnly: true,
     secure: true,
     sameSite: "lax",
     maxAge: 60 * 60 * 24 * 30,
   });
   ```

3. **Contact support** with:
   - Vercel function logs
   - Browser console errors
   - Network tab screenshot (Cookie headers)

---

## 📚 Additional Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [SameSite Cookie Explained](https://web.dev/articles/samesite-cookies-explained)

---

**Last Updated**: December 30, 2025  
**Version**: 2.0 - Production Auth Fix
