# Admin Attendance Quick Reference Guide

## Accessing Attendance Management

1. **Login** as admin user (e.g., varun@pms.com)
2. **Navigate** to "Attendance" from the sidebar
3. **View** three sections on the page

## Page Sections (Top to Bottom)

### 1. Attendance Tracker
- Your personal shift timer
- Start/End your own shifts
- Select project (optional)
- Add daily tasks when ending shift

### 2. My Attendance History
- Your personal attendance records
- Download your own CSV
- Edit your daily tasks
- View detailed shift information

### 3. All Employees Attendance Records (Admin Only)
- **Company-wide** attendance visibility
- Filter by employee
- Download all or filtered data
- View employee details

## Employee Filtering

### Filter Dropdown Options
```
Filter by employee:
┌────────────────────────────────────┐
│ ▾ All Employees (127 records)     │
├────────────────────────────────────┤
│   Varun (Admin) (45 records)      │
│   John Doe (23 records)            │
│   Jane Smith (15 records)          │
│   Robert Johnson (8 records)       │
│   ...                              │
└────────────────────────────────────┘
```

### How to Use
1. **Click** the filter dropdown
2. **See** each employee with their record count
3. **Select** an employee to filter
4. **Table updates** immediately
5. **Select "All Employees"** to clear filter

## Download Options

### Option 1: Download All Employees
- **Button**: "Download All"
- **When to use**: Need complete company attendance report
- **What you get**: ALL employees' records regardless of current filter
- **Filename**: `attendance-all-employees-2024-01-15.csv`
- **Always available**: Yes (if any records exist)

### Option 2: Download Filtered Employee
- **Button**: "Download Filtered (X)" - X shows count
- **When to use**: Need specific employee's attendance
- **What you get**: ONLY the selected employee's records
- **Filename**: `attendance-John-Doe-2024-01-15.csv`
- **Only available when**: Specific employee is selected (not "All Employees")

## CSV File Contents

Each download includes these columns:
1. **Date** - Shift date (e.g., "Jan 15, 2024")
2. **Employee Name** - Full name
3. **Email** - Employee email
4. **Start Time** - Shift start (e.g., "09:00 AM")
5. **End Time** - Shift end (e.g., "05:30 PM") or "In Progress"
6. **Duration** - Total time (e.g., "8h 30m")
7. **Status** - COMPLETED or IN_PROGRESS
8. **End Activity** - What employee accomplished
9. **Tasks** - List of daily tasks (semicolon-separated)

## Common Tasks

### View All Employees' Attendance
1. Scroll to "All Employees Attendance Records"
2. Table shows all completed shifts
3. Click "View X tasks" to see task details

### Check Specific Employee's Attendance
1. Click filter dropdown
2. Select employee (e.g., "John Doe (15 records)")
3. Table shows only John's records
4. Click "Download Filtered (15)" for John's CSV

### Generate Company-Wide Report
1. Ensure filter is set to "All Employees"
2. Click "Download All"
3. Open CSV file in Excel/Google Sheets
4. File contains all employees' data

### Export for Payroll Processing
1. Set date range if needed (future feature)
2. Click "Download All"
3. Import CSV into payroll system
4. Process duration column for hours worked

## Understanding the Data

### Duration Format
- **"8h 30m"** = 8 hours and 30 minutes
- **"12h 0m"** = Exactly 12 hours
- **"N/A"** = Shift still in progress or data missing

### Status Badges
- **Green "Completed"** - Shift properly ended
- **Gray "In Progress"** - Currently active shift

### Daily Tasks
- Click "View X tasks" button
- Dialog shows:
  - Employee details
  - Date and time information
  - Complete task list
  - End activity description

## Tips & Best Practices

### 1. Regular Monitoring
- Check attendance daily
- Look for missing shifts
- Verify shift durations are reasonable

### 2. Export Frequency
- **Daily**: For time-sensitive tracking
- **Weekly**: For team reports
- **Monthly**: For payroll and analytics

### 3. Employee Filtering
- Use for performance reviews
- Compare individual productivity
- Identify attendance patterns

### 4. Data Validation
- Verify shift times make sense
- Check for unusually long shifts
- Review daily tasks for completeness

### 5. CSV Usage
- Open in Excel/Google Sheets
- Create pivot tables for analysis
- Filter and sort as needed
- Import into other systems

## Troubleshooting

### Issue: "No records found"
**Solution**: No employees have completed shifts yet. Records only appear after shift is ended.

### Issue: Employee not in filter dropdown
**Solution**: Employee hasn't completed any shifts. Only employees with completed shifts appear.

### Issue: Download button disabled
**Solution**: No records match current filter. Select different employee or check "All Employees".

### Issue: "Unauthorized - Admin access required"
**Solution**: Your account doesn't have admin role. Contact system administrator.

### Issue: CSV file has strange characters
**Solution**: Open CSV with UTF-8 encoding. In Excel: Data → From Text/CSV → File Origin: UTF-8.

## Security & Permissions

### What Admins Can See
✅ All employees' attendance records
✅ Personal attendance history
✅ Company-wide download
✅ Individual employee download
✅ Detailed task information

### What Employees Can See
❌ Other employees' records
❌ Company-wide data
✅ Only their own attendance
✅ Personal CSV download

## Quick Actions Reference

| Action | Steps | Result |
|--------|-------|--------|
| View all attendance | Scroll to "All Employees Attendance Records" | See complete table |
| Filter by employee | Click filter → Select employee | Filtered table |
| Clear filter | Click filter → Select "All Employees" | Full table restored |
| Download all data | Click "Download All" | CSV with all records |
| Download filtered | Select employee → Click "Download Filtered (X)" | CSV with employee's records |
| View task details | Click "View X tasks" in table | Dialog with full information |
| Check record count | Look at filter dropdown | Count shown per employee |

## Need Help?

**Contact**: System Administrator
**Email**: admin@yourcompany.com
**Documentation**: `/docs/attendance-management-feature.md`

---

**Last Updated**: January 2025
**For**: Admin Users Only
**Version**: 1.0
