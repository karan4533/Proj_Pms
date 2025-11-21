# 🔍 Troubleshooting: Admin Attendance Not Showing

## Current Status
✅ **Database**: 6 completed attendance records exist for "Karthikeyan Saminathan"
✅ **Backend API**: `/api/attendance/records` endpoint working correctly
✅ **Admin User**: Varun has ADMIN role and proper permissions
❓ **Frontend**: Need to verify if data is displaying in browser

## Testing Steps

### 1. Clear Browser Cache & Restart Dev Server
```powershell
# Stop the dev server (Ctrl+C in terminal running npm run dev)
# Then restart:
npm run dev
```

### 2. Login as Admin
- **Email**: `varun@pms.com`
- **Password**: `admin123`

### 3. Navigate to Attendance Page
- Click "Attendance" in the sidebar
- URL should be: `http://localhost:3000/attendance`

### 4. Check Browser Console
Press `F12` to open DevTools, then check the **Console** tab for:

#### Expected Debug Logs:
```javascript
AttendanceRecords Debug: {
  recordsCount: 6,
  isLoading: false,
  hasError: false,
  records: [
    { id: "...", userName: "Karthikeyan Saminathan", ... },
    { id: "...", userName: "Karthikeyan Saminathan", ... }
  ]
}
```

#### If you see errors:
Look for messages like:
- `Failed to fetch attendance records`
- `403 Forbidden` - Admin permission denied
- `401 Unauthorized` - Not logged in
- Network errors

### 5. Check Network Tab
In DevTools, go to **Network** tab:
1. Refresh the page
2. Look for request to `/api/attendance/records`
3. Click on it to see:
   - **Status**: Should be `200 OK`
   - **Response**: Should contain `{"data": [...]}`
   - **Preview**: Should show 6 records

## Common Issues & Solutions

### Issue 1: "All Employees Attendance Records" section not visible
**Cause**: Not logged in as admin or `useIsGlobalAdmin()` returning false

**Solution**:
1. Verify you're logged in as `varun@pms.com`
2. Check console for `isAdmin` value
3. Try logging out and logging back in

### Issue 2: Section visible but shows "No records found"
**Cause**: Frontend not receiving data from API

**Solution**:
1. Check Network tab for `/api/attendance/records` request
2. Verify response contains data
3. Check console for `AttendanceRecords Debug` log
4. If `recordsCount: 0`, API might be returning empty array

### Issue 3: API returns 403 Forbidden
**Cause**: Varun doesn't have ADMIN role properly set

**Solution**:
Run the admin creation script again:
```powershell
npx tsx scripts/create-admin-varun.ts
```

### Issue 4: Records show but with "N/A" durations
**Cause**: Some records have `totalDuration: 0` or `null`

**Solution**: This is expected for very short shifts (< 1 minute). The display should still work - it just shows "N/A" or "0h 0m"

### Issue 5: Employee filter dropdown is empty
**Cause**: No employees appear if there are no records

**Solution**:
1. Verify records exist in database (run `npx tsx scripts/check-attendance-data.ts`)
2. Check if employee filter is extracting users correctly
3. Look for console errors

## Quick Diagnostic Commands

### Check Database Records
```powershell
npx tsx scripts/check-attendance-data.ts
```
Expected output: Should show 6+ completed records

### Check Admin Permissions
```powershell
npx tsx scripts/check-admin-attendance-view.ts
```
Expected output: Should show Varun is ADMIN and can access 6 records

### Check Current User in Browser
Open browser console and run:
```javascript
// Check if admin hook is working
fetch('/api/members/role')
  .then(r => r.json())
  .then(d => console.log('Current user role:', d));
```

Expected output:
```json
{
  "role": "ADMIN",
  "workspaceId": "..."
}
```

## Manual Testing Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Logged in as Varun (`varun@pms.com`)
- [ ] Can see Attendance link in sidebar
- [ ] Can navigate to `/attendance` page
- [ ] See 3 sections: Tracker, My History, All Employees
- [ ] "All Employees Attendance Records" section is visible
- [ ] Employee filter dropdown shows "Karthikeyan Saminathan"
- [ ] Table shows 6 records
- [ ] Can see employee name, dates, times
- [ ] "Download All" button is enabled
- [ ] Selecting employee in filter updates table
- [ ] "Download Filtered" button appears when employee selected

## Expected Visual Layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Attendance Tracker                                │
│  [Start Shift] [End Shift]                         │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│  My Attendance History (Varun's own records)       │
│  [Empty or Varun's shifts if he tracked any]       │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  All Employees Attendance Records   [Download All] │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Filter: [Karthikeyan Saminathan (6) ▾]            │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Date  │Employee│Email│Start│End│Duration│... │ │
│  ├───────────────────────────────────────────────┤ │
│  │Nov 20 │Karthik.│k@..│16:11│16:12│0h 0m │...│ │
│  │Nov 20 │Karthik.│k@..│16:11│16:11│0h 0m │...│ │
│  │Nov 20 │Karthik.│k@..│16:11│16:11│0h 0m │...│ │
│  │Nov 19 │Karthik.│k@..│13:16│00:00│10h 43m│...│ │
│  │Nov 18 │Karthik.│k@..│17:52│17:52│0h 0m │...│ │
│  │Nov 18 │Karthik.│k@..│12:38│13:51│1h 12m│...│ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## If Still Not Working

### Step 1: Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Step 2: Clear React Query Cache
In browser console, run:
```javascript
// Force refetch
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Check if Component is Rendering
In browser console:
```javascript
// Check if component exists in DOM
document.querySelector('[class*="attendance"]');
```

### Step 4: Verify API Endpoint Manually
```javascript
// Fetch records directly
fetch('/api/attendance/records', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('API Response:', data));
```

Expected response:
```json
{
  "data": [
    {
      "id": "f08c7c3f-ae6a-41aa-aa6d-4d1fa47bd3c7",
      "userId": "0ed5aa56-f10a-46d5-8197-6e470166bdc6",
      "userName": "Karthikeyan Saminathan",
      "userEmail": "karthikeyan.saminathan@pms.com",
      ...
    },
    ...
  ]
}
```

## Recent Changes Made

1. ✅ Added debug logging to `AttendanceRecords` component
2. ✅ Added error display for API failures
3. ✅ Component logs: `recordsCount`, `isLoading`, `hasError`, sample records
4. ✅ Error card shows specific error messages

## Next Steps

1. **Open the app in browser**
2. **Login as Varun**
3. **Navigate to Attendance page**
4. **Check browser console** for debug logs
5. **Look at Network tab** for API requests
6. **Report back** what you see in:
   - Console logs (copy the `AttendanceRecords Debug` output)
   - Network tab (status code and response for `/api/attendance/records`)
   - Any error messages displayed on screen

---

**Need More Help?**
Share the browser console output and I can diagnose the exact issue!
