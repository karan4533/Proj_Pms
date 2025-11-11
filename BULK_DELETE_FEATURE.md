# 🗑️ Bulk Delete Projects Feature

## ✅ Implementation Complete

I've added a **Bulk Delete Projects** feature to your homepage, positioned right next to the CSV upload card. This feature is **ADMIN-only** access.

---

## 🎯 Features

### 1. **Admin-Only Access** 🔒
- Only users with **ADMIN role** can see and use this feature
- Other roles (PROJECT_MANAGER, TEAM_LEAD, EMPLOYEE, MANAGEMENT) cannot access it
- Protected by RBAC at both frontend and backend levels

### 2. **Select Multiple Projects** ☑️
- Checkbox to select individual projects
- "Select All" checkbox to select all projects at once
- Visual feedback showing how many projects are selected
- Project thumbnails displayed for easy identification

### 3. **Confirmation Dialog** ⚠️
- Confirmation popup before deletion
- Shows number of projects to be deleted
- Warns that all associated tasks will also be deleted
- Cannot be undone warning

### 4. **Cascade Delete** 🔗
- Deletes projects and all their associated tasks automatically
- Uses database foreign key cascades
- Efficient bulk operation (single database query)

---

## 📍 Location

**Homepage**: `/workspaces/[workspaceId]`

The bulk delete card appears on the right side of the CSV upload card (side-by-side layout on larger screens).

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────┐
│                     Analytics                           │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│  CSV Upload Card         │  │  Bulk Delete Projects    │
│  (Everyone)              │  │  (ADMIN only) 🔒         │
│                          │  │                          │
│  [Select Project ▼]      │  │  ☑ Select All Projects   │
│  [Upload CSV]            │  │  ───────────────────────  │
│                          │  │  ☐ Project 1             │
│                          │  │  ☐ Project 2             │
│                          │  │  ☐ Project 3             │
│                          │  │                          │
│                          │  │  [Delete N Projects]     │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 🔧 Files Created/Modified

### **New Files**:

1. **`src/components/bulk-delete-projects-card.tsx`** ✅
   - React component for the bulk delete UI
   - Checkboxes for selecting projects
   - Confirmation dialog
   - Loading states

2. **`src/features/projects/api/use-bulk-delete-projects.ts`** ✅
   - React Query hook for bulk delete
   - Success/error toast notifications
   - Cache invalidation after deletion

### **Modified Files**:

3. **`src/features/projects/server/route.ts`** ✅
   - Added `POST /bulk-delete` endpoint
   - RBAC protection (ADMIN only)
   - Validates all projects belong to workspace
   - Cascade delete implementation

4. **`src/app/(dashboard)/workspaces/[workspaceId]/client.tsx`** ✅
   - Added BulkDeleteProjectsCard component
   - Grid layout for side-by-side cards
   - ADMIN role check

---

## 🛡️ Security & RBAC

### **Frontend Protection**:
```typescript
// Only render for ADMIN
const isAdmin = permissions.role === "ADMIN";

{isAdmin && (
  <BulkDeleteProjectsCard projects={projects.documents} />
)}
```

### **Backend Protection**:
```typescript
// Verify ADMIN role
if (member.role !== MemberRole.ADMIN) {
  return c.json({ 
    error: "Forbidden: Only admins can delete projects" 
  }, 403);
}
```

---

## 📊 API Endpoint

### **POST** `/api/projects/bulk-delete`

**Request Body**:
```json
{
  "projectIds": ["proj_1", "proj_2", "proj_3"],
  "workspaceId": "workspace_123"
}
```

**Response (Success)**:
```json
{
  "data": {
    "deletedCount": 3,
    "projectIds": ["proj_1", "proj_2", "proj_3"]
  }
}
```

**Response (Error - Not Admin)**:
```json
{
  "error": "Forbidden: Only admins can delete projects"
}
```

**Response (Error - Projects Not Found)**:
```json
{
  "error": "Some projects not found or don't belong to this workspace"
}
```

---

## 🎬 User Flow

### **As ADMIN**:

1. Navigate to homepage
2. See "Bulk Delete Projects" card on the right
3. Select projects using checkboxes
   - Individual selection
   - Or "Select All"
4. Click "Delete N Project(s)" button
5. Confirmation dialog appears
   - Shows how many projects will be deleted
   - Warns about cascade delete of tasks
6. Click "Yes, delete permanently"
7. Projects and tasks are deleted
8. Success toast notification
9. UI updates automatically

### **As Non-ADMIN**:
- Bulk delete card is **hidden** (not rendered at all)
- Cannot access the feature
- If they somehow make an API call, they get 403 Forbidden error

---

## ✨ Features Breakdown

### **1. Select All Checkbox**
```typescript
// Toggle all projects
const handleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedProjects(projects.map(p => p.id));
  } else {
    setSelectedProjects([]);
  }
};
```

### **2. Visual Feedback**
- Selected projects highlighted in red
- Count badge shows number selected
- Disabled state while deleting

### **3. Confirmation Dialog**
- Prevents accidental deletion
- Clear warning message
- Cannot be bypassed

### **4. Loading States**
```typescript
{isPending ? (
  <>
    <Loader2 className="size-4 mr-2 animate-spin" />
    Deleting...
  </>
) : (
  "Delete N Projects"
)}
```

### **5. Automatic UI Update**
- React Query invalidates cache after deletion
- Projects list refreshes
- Task list refreshes
- Analytics update

---

## 🧪 Testing

### **Test as ADMIN**:
```bash
# Login as admin@workspace.com (password: 123456)
# Navigate to homepage
# You should see the Bulk Delete Projects card
# Select projects and delete
```

### **Test as Non-ADMIN**:
```bash
# Login as other roles (employee, manager, etc.)
# Navigate to homepage
# Bulk Delete card should NOT appear
```

### **Test Cascade Delete**:
1. Create a project with tasks
2. Delete the project using bulk delete
3. Verify tasks are also deleted

---

## 📈 Performance

- **Bulk operation**: Single database query for all projects
- **Cascade delete**: Database handles task deletion automatically
- **No N+1 queries**: Efficient batch operations
- **Cache invalidation**: React Query updates UI instantly

---

## 🚀 Future Enhancements (Optional)

### **1. Soft Delete** (Recycle Bin)
- Move to "deleted_projects" table instead of permanent delete
- Allow recovery within 30 days
- Permanent delete after 30 days

### **2. Delete Confirmation Email**
- Send email to admin after bulk delete
- List of deleted projects
- Audit trail

### **3. Bulk Delete History**
- Log all bulk deletions
- Show who deleted what and when
- Export deletion report

### **4. Undo Feature**
- 5-second undo window after deletion
- Store deleted data temporarily
- Restore if undo clicked

---

## 📝 Summary

✅ **Bulk Delete Projects** feature added to homepage  
✅ **ADMIN-only** access (RBAC protected)  
✅ **Side-by-side** with CSV upload card  
✅ **Select multiple** projects with checkboxes  
✅ **Confirmation dialog** prevents accidents  
✅ **Cascade delete** removes all associated tasks  
✅ **API endpoint** with full RBAC protection  
✅ **Responsive design** works on all screen sizes  
✅ **Loading states** and visual feedback  
✅ **Auto-refresh** UI after deletion  

**Ready for production!** 🎉

---

**Created**: November 11, 2025  
**Feature**: Bulk Delete Projects (ADMIN only)  
**Location**: Homepage (next to CSV upload)
