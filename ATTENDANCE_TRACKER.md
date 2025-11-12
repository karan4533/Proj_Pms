# 📅 Attendance Tracker System

## ✅ Implemented Features

### 🎯 **Core Functionality**

1. **Start Shift**
   - Click "Start Shift" button to begin tracking time
   - Only one active shift per user per workspace
   - Shift start time recorded in database

2. **Live Timer Display**
   - Real-time timer showing elapsed time (HH:MM:SS format)
   - Timer runs continuously in the browser
   - Shows shift start time

3. **End Shift with Daily Tasks**
   - Click "End Shift" to open task entry dialog
   - Enter daily tasks in point-wise format (one per line)
   - Tasks are required before ending shift
   - Shift duration automatically calculated and stored

4. **Download Report**
   - Download button available during active shift
   - Generates text file with:
     - Date and start time
     - Current duration
     - List of daily tasks
   - Format: `shift-report-YYYY-MM-DD.txt`

5. **Admin Access to Records**
   - Only ADMINs can view attendance records
   - Table showing all employee attendance data:
     - Date, User ID, Start/End times
     - Duration, Status, Daily tasks
   - Download all records as CSV file

---

## 🗄️ **Database Schema**

### **Attendance Table**
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  shift_start_time TIMESTAMP NOT NULL,
  shift_end_time TIMESTAMP,
  total_duration INTEGER,  -- in minutes
  daily_tasks JSONB,  -- array of task strings
  status TEXT DEFAULT 'IN_PROGRESS',  -- IN_PROGRESS | COMPLETED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX attendance_user_idx ON attendance(user_id);
CREATE INDEX attendance_workspace_idx ON attendance(workspace_id);
CREATE INDEX attendance_date_idx ON attendance(shift_start_time);
CREATE INDEX attendance_status_idx ON attendance(status);
CREATE INDEX attendance_user_date_idx ON attendance(user_id, shift_start_time);
```

---

## 📁 **File Structure**

```
src/
├── db/
│   └── schema.ts                         ✅ Attendance table added
│
├── features/
│   └── attendance/
│       ├── api/
│       │   └── use-attendance.ts         ✅ React Query hooks
│       ├── components/
│       │   ├── attendance-tracker.tsx    ✅ Main tracker UI
│       │   └── attendance-records.tsx    ✅ Admin records view
│       └── server/
│           └── route.ts                  ✅ API endpoints
│
├── app/
│   ├── api/
│   │   └── [[...route]]/
│   │       └── route.ts                  ✅ Added attendance route
│   └── (dashboard)/
│       └── attendance/
│           └── [workspaceId]/
│               └── page.tsx              ✅ Attendance page
│
└── components/
    └── sidebar.tsx                       ✅ Added attendance link
```

---

## 🔌 **API Endpoints**

### **1. Start Shift**
```typescript
POST /api/attendance/start-shift
Body: { workspaceId: string }

Response: {
  data: {
    id: string,
    userId: string,
    workspaceId: string,
    shiftStartTime: Date,
    status: "IN_PROGRESS"
  }
}
```

### **2. End Shift**
```typescript
POST /api/attendance/end-shift
Body: {
  attendanceId: string,
  dailyTasks: string[]  // min 1 task required
}

Response: {
  data: {
    id: string,
    shiftEndTime: Date,
    totalDuration: number,  // minutes
    dailyTasks: string[],
    status: "COMPLETED"
  }
}
```

### **3. Get Active Shift**
```typescript
GET /api/attendance/active-shift/:workspaceId

Response: {
  data: AttendanceRecord | null
}
```

### **4. Get All Attendance Records (Admin Only)**
```typescript
GET /api/attendance/:workspaceId

Response: {
  data: AttendanceRecord[]
}

// Returns 403 if user is not ADMIN
```

---

## 🎨 **UI Components**

### **AttendanceTracker**
Location: `src/features/attendance/components/attendance-tracker.tsx`

**Features:**
- ✅ Start/End Shift buttons
- ✅ Real-time timer display (HH:MM:SS)
- ✅ Task entry textarea (visible during shift)
- ✅ Download report button
- ✅ End shift confirmation dialog
- ✅ Loading states and error handling

**Props:**
```typescript
interface AttendanceTrackerProps {
  workspaceId: string;
}
```

### **AttendanceRecords** (Admin Only)
Location: `src/features/attendance/components/attendance-records.tsx`

**Features:**
- ✅ Table with all attendance records
- ✅ Status badges (In Progress / Completed)
- ✅ Expandable task lists
- ✅ Download CSV export
- ✅ Formatted dates and durations

**Props:**
```typescript
interface AttendanceRecordsProps {
  workspaceId: string;
}
```

---

## 🔒 **Access Control**

### **Regular Users:**
- ✅ Can start/end their own shifts
- ✅ Can view their active shift
- ✅ Can download their own reports
- ❌ Cannot view other users' attendance

### **Admins:**
- ✅ All regular user permissions
- ✅ Can view ALL attendance records
- ✅ Can download CSV with all records
- ✅ See comprehensive attendance table

**Implementation:**
```typescript
// In attendance page
const member = await getMember({ workspaceId, userId: user.id });
const isAdmin = member.role === MemberRole.ADMIN;

{isAdmin && <AttendanceRecords workspaceId={workspaceId} />}
```

---

## 📊 **Data Flow**

### **Starting a Shift:**
```
User clicks "Start Shift"
  → useStartShift() hook
  → POST /api/attendance/start-shift
  → Check if user is workspace member
  → Check if active shift exists
  → Create new attendance record (status: IN_PROGRESS)
  → Return attendance data
  → UI shows timer and task entry
```

### **Ending a Shift:**
```
User clicks "End Shift"
  → Dialog opens for task entry
  → User enters tasks (one per line)
  → User confirms
  → useEndShift() hook
  → POST /api/attendance/end-shift
  → Calculate duration
  → Update record (status: COMPLETED, add tasks)
  → Clear active shift
  → UI resets to "Start Shift" button
```

### **Timer Updates:**
```
useEffect hook runs on mount
  → Get shift start time from activeShift
  → setInterval updates every 1 second
  → Calculate elapsed time (now - startTime)
  → Format as HH:MM:SS
  → Display in UI
```

---

## 📥 **Download Features**

### **Individual Report (Text File)**
```
Format: Plain text
Name: shift-report-YYYY-MM-DD.txt
Contents:
  - SHIFT REPORT header
  - Date and start time
  - Current/final duration
  - Numbered list of daily tasks
```

**Example:**
```
SHIFT REPORT
============
Date: 11/12/2025
Start Time: 9:00:00 AM
Duration: 08:30:45

DAILY TASKS:
1. Completed project documentation
2. Fixed bug in attendance tracker
3. Code review for PR #123
4. Team meeting - sprint planning
```

### **Admin CSV Export**
```
Format: CSV
Name: attendance-records-YYYY-MM-DD.csv
Columns:
  - Date, User ID, Start Time, End Time
  - Duration, Status, Tasks
```

**Example:**
```csv
"Date","User ID","Start Time","End Time","Duration","Status","Tasks"
"Nov 12, 2025","abc123...","09:00 AM","05:30 PM","8h 30m","COMPLETED","Task 1; Task 2"
```

---

## 🎯 **Usage Instructions**

### **For Employees:**

1. **Starting Your Day:**
   - Navigate to Attendance page via sidebar
   - Click "Start Shift" button
   - Timer begins automatically

2. **During Your Shift:**
   - Enter your daily tasks in the textarea (one per line)
   - Tasks can be updated anytime
   - Download report anytime to save progress

3. **Ending Your Day:**
   - Click "End Shift" button
   - Review/edit your task list in dialog
   - Click "End Shift" to confirm
   - Shift data saved to database

### **For Admins:**

1. **View All Records:**
   - Scroll down to "Attendance Records" section
   - See table with all employee attendance
   - Click "View X tasks" to expand task lists

2. **Export Data:**
   - Click "Download CSV" button
   - Open in Excel/Google Sheets for analysis
   - Use for reports, payroll, etc.

---

## 🛠️ **Technical Implementation**

### **React Query Hooks:**
```typescript
// Start shift
const startShift = useStartShift();
startShift.mutate({ workspaceId });

// End shift
const endShift = useEndShift();
endShift.mutate({ attendanceId, dailyTasks });

// Get active shift
const { data: activeShift } = useGetActiveShift(workspaceId);

// Get all records (admin)
const { data: records } = useGetAttendanceRecords(workspaceId);
```

### **Timer Logic:**
```typescript
useEffect(() => {
  if (!activeShift) return;
  
  const startTime = new Date(activeShift.shiftStartTime).getTime();
  
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    setElapsedTime(elapsed);
  }, 1000);
  
  return () => clearInterval(interval);
}, [activeShift]);
```

### **Duration Calculation:**
```typescript
const shiftEndTime = new Date();
const duration = Math.floor(
  (shiftEndTime.getTime() - startTime.getTime()) / (1000 * 60)
); // in minutes
```

---

## ✨ **Key Features**

✅ **Real-time Timer** - Updates every second  
✅ **Database Persistence** - All data stored in PostgreSQL  
✅ **RBAC** - Admin-only access to records  
✅ **Task Tracking** - Point-wise daily task entry  
✅ **Download Reports** - Text and CSV exports  
✅ **Validation** - Prevents duplicate shifts, requires tasks  
✅ **Responsive UI** - Works on all devices  
✅ **Loading States** - Smooth UX with spinners  
✅ **Error Handling** - Toast notifications for feedback  

---

## 🚀 **Migration Applied**

Migration file: `drizzle/0005_hard_moira_mactaggert.sql`

Tables created:
- ✅ `attendance` table with all columns
- ✅ 5 indexes for query performance
- ✅ Foreign key constraints with cascade delete

---

## 📝 **Future Enhancements** (Optional)

- 📅 Calendar view of attendance history
- 📊 Analytics dashboard (hours worked, trends)
- ⏰ Break time tracking
- 🔔 Notifications for shift reminders
- 📱 Mobile app for clock in/out
- 🎯 Integration with project tasks
- 📈 Performance metrics and reports
- 🔄 Shift swap/request system

---

**Created**: November 12, 2025  
**Status**: ✅ Fully Implemented and Ready to Use  
**Database**: ✅ Migrated  
**Access Control**: ✅ Admin-only records view
