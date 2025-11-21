# Admin Attendance Management Feature

## Overview
The Admin Attendance Management feature provides comprehensive attendance tracking and reporting capabilities for administrators to monitor all employees' work hours, daily tasks, and shift patterns across the organization.

## User Requirements Implemented

### Admin View - Attendance Page Structure
1. **Admin's Own Attendance** - Displayed first in "My Attendance History" section
2. **All Employees' Attendance** - Displayed below in "All Employees Attendance Records" section
3. **Download Capabilities**:
   - Bulk download (all employees' attendance data)
   - Filtered download (specific employee's attendance data)

## Features

### 1. Role-Based Access Control
- **Admin Access**: Full visibility of all employees' attendance records
- **Employee Access**: Can only view and manage their own attendance
- Uses global permission system (`useIsGlobalAdmin()`) - no workspace dependency

### 2. Attendance Tracking
- **Start Shift**: Employees can start their work shift with optional project selection
- **End Shift**: Employees record end activity and daily tasks accomplished
- **Auto-End at Midnight**: Shifts automatically end at midnight to prevent multi-day shifts
- **Real-time Timer**: Live countdown showing hours worked during active shift

### 3. Admin Dashboard Components

#### A. Attendance Tracker (Shared)
- Start/End shift functionality
- Real-time shift timer
- Project association
- Daily task entry

#### B. My Attendance History
- Admin sees their own completed attendance records
- Editable daily tasks
- CSV download of personal records
- Displayed FIRST on the attendance page

#### C. All Employees Attendance Records (Admin Only)
- Company-wide attendance visibility
- Employee filtering dropdown
- Dual download options
- Displayed BELOW admin's own records

### 4. Employee Filtering System

#### Filter Dropdown
- **"All Employees"** option - Shows all records with total count
- **Individual Employees** - Each employee listed with their record count
- Example: "John Doe (15 records)", "Jane Smith (23 records)"

#### Visual Feedback
- Filter updates table in real-time
- Record count displayed in filter options
- Empty state messages adjust based on filter selection

### 5. Download Functionality

#### Bulk Download
- **Button**: "Download All"
- **Filename**: `attendance-all-employees-YYYY-MM-DD.csv`
- **Data**: All employees' attendance records regardless of filter
- **Always Available**: When any records exist

#### Filtered Download
- **Button**: "Download Filtered (X)" - X shows filtered record count
- **Filename**: `attendance-[EmployeeName]-YYYY-MM-DD.csv`
- **Data**: Only the selected employee's records
- **Conditionally Shown**: Only when specific employee is selected (not "All Employees")

#### CSV Format
Includes the following columns:
1. Date (formatted: MMM DD, YYYY)
2. Employee Name
3. Email
4. Start Time (HH:MM AM/PM)
5. End Time (HH:MM AM/PM or "In Progress")
6. Duration (Xh Ym format)
7. Status (COMPLETED/IN_PROGRESS)
8. End Activity (description)
9. Tasks (JSON array formatted with semicolons)

## Technical Implementation

### Database Schema
```typescript
attendance table:
- id: uuid (primary key)
- userId: uuid (references users)
- workspaceId: uuid (nullable - workspace concept removed)
- projectId: uuid (nullable - references projects)
- shiftStartTime: timestamp (not null)
- shiftEndTime: timestamp (nullable)
- totalDuration: integer (minutes)
- endActivity: text
- dailyTasks: jsonb (array of strings)
- status: text (IN_PROGRESS | COMPLETED)
- createdAt: timestamp
- updatedAt: timestamp

Indexes:
- userIdx on userId
- workspaceIdx on workspaceId
- projectIdx on projectId
- dateIdx on shiftStartTime
- statusIdx on status
- userDateIdx (composite) on userId + shiftStartTime
```

### API Endpoints

#### GET /api/attendance/records (Admin Only)
**Authorization**: Checks if user has ADMIN role in any workspace
**Returns**: All completed attendance records across the company
**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Employee Name",
      "userEmail": "email@domain.com",
      "projectId": "uuid",
      "shiftStartTime": "2024-01-15T09:00:00Z",
      "shiftEndTime": "2024-01-15T17:30:00Z",
      "totalDuration": 510,
      "endActivity": "Completed sprint tasks",
      "dailyTasks": ["Task 1", "Task 2"],
      "status": "COMPLETED",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

#### GET /api/attendance/my-attendance
**Authorization**: Any authenticated user
**Returns**: Current user's own completed attendance records
**Used By**: Employee view and Admin's personal history

#### POST /api/attendance/start-shift
**Authorization**: Any authenticated user
**Payload**: `{ projectId?: string }`
**Action**: Creates new IN_PROGRESS attendance record

#### POST /api/attendance/end-shift
**Authorization**: Record owner only
**Payload**: 
```json
{
  "attendanceId": "uuid",
  "endActivity": "string (min 1 char)",
  "dailyTasks": ["string (min 1 item)"]
}
```
**Action**: Updates record to COMPLETED, calculates duration

### React Components

#### 1. AttendanceClient (`/attendance/client.tsx`)
**Purpose**: Main attendance page layout
**Features**:
- Uses `useIsGlobalAdmin()` for role checking
- Conditionally renders admin sections
- Layout: Tracker → My History → All Employees (admin only)

#### 2. AttendanceRecords Component
**File**: `src/features/attendance/components/attendance-records.tsx`
**Key Features**:
- Employee filtering with `useMemo` for performance
- Dual download system (bulk + filtered)
- Real-time filter updates
- Dynamic filename generation
- Empty states with contextual messaging

**State Management**:
```typescript
const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>("all");
const filteredRecords = useMemo(() => {
  if (selectedEmployeeFilter === "all") return records;
  return records.filter(r => r.userId === selectedEmployeeFilter);
}, [records, selectedEmployeeFilter]);
```

**Unique Employees Extraction**:
```typescript
const employees = useMemo(() => {
  const uniqueEmployees = new Map();
  records.forEach((record) => {
    if (!uniqueEmployees.has(record.userId)) {
      uniqueEmployees.set(record.userId, {
        id: record.userId,
        name: record.userName,
        email: record.userEmail,
      });
    }
  });
  return Array.from(uniqueEmployees.values());
}, [records]);
```

#### 3. MyAttendanceHistory Component
**File**: `src/features/attendance/components/my-attendance-history.tsx`
**Features**:
- Personal attendance records
- Editable daily tasks
- Personal CSV download
- Task detail dialog

#### 4. AttendanceTracker Component
**File**: `src/features/attendance/components/attendance-tracker.tsx`
**Updated**: Made `workspaceId` optional to support global attendance view
**Features**:
- Start/End shift dialogs
- Real-time timer with midnight warning
- Auto-end at midnight
- Project selection

### Custom Hooks

#### useIsGlobalAdmin()
**File**: `src/features/members/api/use-get-user-role.ts`
**Purpose**: Check if current user is admin without workspace context
**Returns**: `{ data: boolean, isLoading: boolean }`

#### useGetAttendanceRecords()
**File**: `src/features/attendance/api/use-attendance.ts`
**Purpose**: Fetch all employees' attendance (admin only)
**Query Key**: `["attendance-records"]`

#### useGetMyAttendance()
**Purpose**: Fetch current user's attendance records
**Query Key**: `["my-attendance"]`

## User Experience Flow

### Admin User (e.g., Varun)

1. **Navigate to Attendance Page** (`/attendance`)
2. **See Three Sections**:
   - Attendance Tracker (start/end shift)
   - My Attendance History (Varun's own records)
   - All Employees Attendance Records (company-wide)

3. **View All Employees**:
   - Table shows all completed shifts
   - Columns: Date, Employee Name, Email, Start Time, End Time, Duration, Status, Daily Tasks
   - Click "View X tasks" to see detailed task list in dialog

4. **Filter by Employee**:
   - Click filter dropdown
   - Select specific employee (e.g., "John Doe (15 records)")
   - Table updates to show only John's records
   - "Download Filtered" button appears

5. **Download Options**:
   - **Download All**: Gets all employees regardless of current filter
   - **Download Filtered (15)**: Gets only John Doe's 15 records
   - Files named: `attendance-all-employees-2024-01-15.csv` or `attendance-John-Doe-2024-01-15.csv`

### Employee User

1. **Navigate to Attendance Page**
2. **See Two Sections Only**:
   - Attendance Tracker
   - My Attendance History
3. **No Access to**:
   - Other employees' records
   - Company-wide attendance data
   - Admin filtering/download features

## Security & Permissions

### Backend Protection
- **Admin Check**: All `/records` endpoint calls verify user has ADMIN role in ANY workspace
- **403 Forbidden**: Non-admins attempting to access admin endpoints
- **User Isolation**: Employees can only query/edit their own records

### Frontend Protection
- **Conditional Rendering**: Admin sections hidden from non-admins
- **Global Admin Hook**: Uses `useIsGlobalAdmin()` - no workspace required
- **Loading States**: Admin check completes before rendering restricted content

### Data Validation
- **End Activity**: Minimum 1 character required
- **Daily Tasks**: Minimum 1 task required
- **Ownership Verification**: Users can only end their own shifts
- **Status Checks**: Cannot end already-completed shifts

## Performance Optimizations

### 1. Memoized Computations
```typescript
// Employee list only recalculated when records change
const employees = useMemo(() => { ... }, [records]);

// Filtered records only recalculated when records or filter changes
const filteredRecords = useMemo(() => { ... }, [records, selectedEmployeeFilter]);
```

### 2. Database Indexes
- `userDateIdx` (composite): Fast user-specific date range queries
- `statusIdx`: Quick filtering of COMPLETED vs IN_PROGRESS
- `userIdx`: Efficient user-based lookups

### 3. Query Optimization
- **INNER JOIN**: Single query to get user info with attendance
- **Status Filtering**: Only COMPLETED records returned (reduces payload)
- **Ordered Results**: `ORDER BY shiftStartTime DESC` - newest first

## File Structure
```
src/
├── app/
│   └── (dashboard)/
│       └── attendance/
│           └── client.tsx              # Main page with admin layout
├── features/
│   └── attendance/
│       ├── api/
│       │   └── use-attendance.ts       # React Query hooks
│       ├── components/
│       │   ├── attendance-tracker.tsx  # Shift start/end
│       │   ├── my-attendance-history.tsx  # Personal records
│       │   └── attendance-records.tsx  # Admin: All employees
│       └── server/
│           └── route.ts                # API endpoints
└── db/
    └── schema.ts                       # Database schema
```

## Testing Checklist

### Admin Tests
- [ ] Admin sees "All Employees Attendance Records" section
- [ ] Filter dropdown populates with all employees
- [ ] Filter shows correct record counts per employee
- [ ] Table updates when filter changes
- [ ] "Download All" downloads all records regardless of filter
- [ ] "Download Filtered" button appears only when employee selected
- [ ] "Download Filtered" downloads only selected employee's records
- [ ] CSV filenames are correctly formatted
- [ ] Employee names with spaces create valid filenames (hyphenated)
- [ ] Empty state messages adjust based on filter selection

### Employee Tests
- [ ] Employee does NOT see "All Employees Attendance Records"
- [ ] Employee can only see own records in "My Attendance History"
- [ ] Employee cannot access `/api/attendance/records` endpoint
- [ ] Employee receives 403 when attempting admin endpoints

### Data Integrity Tests
- [ ] All employees' records appear in admin view
- [ ] Record counts are accurate
- [ ] Date/time formatting is consistent
- [ ] Duration calculations are correct (hours and minutes)
- [ ] Daily tasks display properly in detail dialog
- [ ] CSV export contains all expected columns
- [ ] CSV handles special characters (commas in tasks)

## Deployment Notes

### Environment Requirements
- PostgreSQL database with Drizzle ORM
- Next.js 14+ with App Router
- React Query (TanStack Query)
- Hono for API routes

### Migration Status
- Attendance table created in migration `0007_awesome_lilith.sql`
- Indexes added for performance
- No additional migrations needed

### Configuration
No special configuration required. Feature uses existing:
- Authentication system
- Global role checking (`useIsGlobalAdmin`)
- Member roles (ADMIN, EMPLOYEE)

## Known Limitations

1. **Date Range Filtering**: Currently not implemented - shows all historical records
2. **Export Formats**: Only CSV supported (no Excel, PDF)
3. **Statistics Dashboard**: No aggregate metrics (total hours, average duration, etc.)
4. **Timezone Handling**: All times in server timezone (not user-specific)
5. **Pagination**: All records loaded at once (consider pagination for large datasets)

## Future Enhancements

### Suggested Features
1. **Date Range Filter**: Filter records by start/end date
2. **Export to Excel**: `.xlsx` format with formatting
3. **Statistics Dashboard**: Total hours, average duration, tardiness tracking
4. **Charts & Graphs**: Visual representations of attendance patterns
5. **Bulk Actions**: Approve/reject shifts, add notes
6. **Notifications**: Alert admins of missing shifts, late starts
7. **Mobile App**: Dedicated mobile attendance tracking
8. **Geofencing**: Location-based shift validation
9. **Break Tracking**: Separate break start/end times
10. **Overtime Calculation**: Automatic overtime detection

## Support & Maintenance

### Common Issues

**Issue**: Admin cannot see employee records
**Solution**: Verify user has ADMIN role in members table

**Issue**: CSV download fails
**Solution**: Check browser console for errors, ensure records exist

**Issue**: Filter dropdown empty
**Solution**: Verify employees have completed shifts (status = COMPLETED)

### Monitoring
- Watch for 403 errors in admin endpoints (permission issues)
- Monitor API response times for `/records` endpoint
- Check CSV file generation performance with large datasets

## Changelog

### Version 1.0 (Initial Release)
- Admin can view all employees' attendance
- Employee filtering with dropdown
- Bulk download (all employees)
- Filtered download (specific employee)
- CSV export with comprehensive data
- Global admin permission check
- Proper component hierarchy (admin's own first, then all employees)

---

**Last Updated**: January 2025
**Feature Owner**: Admin RBAC System
**Status**: Production Ready ✅
