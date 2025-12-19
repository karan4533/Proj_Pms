# Role-Based Access Control (RBAC) Guide

## Current Role Hierarchy

```
ADMIN (Highest Access)
├── Full system control
├── Manage workspaces, users, projects
└── Access to all features

PROJECT_MANAGER / TEAM_LEAD
├── Manage assigned projects
├── Create and assign tasks
├── View team reports
└── Limited administrative functions

EMPLOYEE (Basic Access)
├── View assigned tasks
├── Update own tasks
├── Submit weekly reports
└── Track own attendance

MANAGEMENT (Read-Only)
├── View all data
├── Access reports and analytics
└── No modification permissions
```

---

## Current Access Control Implementation

### 1. **Task Management**

**Location:** `src/features/tasks/components/jira-table-dynamic.tsx`

**Current Logic:**
```typescript
const isAdmin = !!(roleData && [
  MemberRole.ADMIN, 
  MemberRole.PROJECT_MANAGER
].includes(roleData.role as MemberRole));
```

**Access Levels:**
- ✅ **ADMIN + PROJECT_MANAGER**: 
  - Edit tasks inline
  - Add/remove columns
  - Manage custom fields
  - Bulk operations
  
- ❌ **EMPLOYEE**: 
  - View only
  - Cannot edit inline
  - Cannot manage columns

**Recommended Enhancement:**
```typescript
// More granular control
const canEditTasks = [
  MemberRole.ADMIN, 
  MemberRole.PROJECT_MANAGER, 
  MemberRole.TEAM_LEAD
].includes(role);

const canDeleteTasks = [
  MemberRole.ADMIN, 
  MemberRole.PROJECT_MANAGER
].includes(role);

const canEditOwnTasks = role === MemberRole.EMPLOYEE && task.assigneeId === userId;
```

---

### 2. **Attendance System**

**Access Levels:**

| Feature | ADMIN | MANAGER | EMPLOYEE |
|---------|-------|---------|----------|
| Start/End own shift | ✅ | ✅ | ✅ |
| View own attendance | ✅ | ✅ | ✅ |
| View team attendance | ✅ | ✅ | ❌ |
| View all attendance | ✅ | ❌ | ❌ |
| Manual adjustments | ✅ | ⚠️ Own team | ❌ |
| Export reports | ✅ | ✅ | ❌ |

**Implementation Needed:**
```typescript
// In attendance route
const canViewAllAttendance = role === MemberRole.ADMIN;
const canViewTeamAttendance = [
  MemberRole.ADMIN,
  MemberRole.PROJECT_MANAGER,
  MemberRole.TEAM_LEAD
].includes(role);
```

---

### 3. **Weekly Reports**

**Current Access:**

| Feature | ADMIN | MANAGER | EMPLOYEE |
|---------|-------|---------|----------|
| Submit reports | ❌ | ❌ | ✅ |
| View own reports | ✅ | ✅ | ✅ |
| View team reports | ✅ | ✅ | ❌ |
| View all reports | ✅ | ❌ | ❌ |
| Export reports | ✅ | ✅ | ❌ |

**Location:** `src/features/weekly-reports/`

**Implementation:**
```typescript
// Check if user can only submit (employee)
const isEmployee = memberRecords.some(m => 
  m.role === MemberRole.EMPLOYEE
);

// Check if user can view all reports (admin)
const isAdmin = memberRecords.some(m => 
  m.role === MemberRole.ADMIN
);
```

---

### 4. **Project Management**

**Recommended Access:**

| Feature | ADMIN | MANAGER | EMPLOYEE |
|---------|-------|---------|----------|
| Create projects | ✅ | ✅ | ❌ |
| Edit projects | ✅ | ✅ Own | ❌ |
| Delete projects | ✅ | ❌ | ❌ |
| Assign members | ✅ | ✅ Own | ❌ |
| View projects | ✅ | ✅ Assigned | ✅ Assigned |

**Implementation Example:**
```typescript
const canCreateProjects = [
  MemberRole.ADMIN,
  MemberRole.PROJECT_MANAGER
].includes(role);

const canEditProject = (projectId: string) => {
  if (role === MemberRole.ADMIN) return true;
  if (role === MemberRole.PROJECT_MANAGER) {
    return project.managerId === userId;
  }
  return false;
};
```

---

### 5. **User Profile Management**

**Current Implementation:** `src/features/profiles/`

**Recommended Access:**

| Feature | ADMIN | MANAGER | EMPLOYEE |
|---------|-------|---------|----------|
| Create profiles | ✅ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ |
| Edit any profile | ✅ | ❌ | ❌ |
| Delete profiles | ✅ | ❌ | ❌ |
| View profiles | ✅ All | ✅ Team | ✅ Own |

---

### 6. **Analytics & Reports**

**Recommended Access:**

| Report Type | ADMIN | MANAGER | EMPLOYEE |
|-------------|-------|---------|----------|
| Status Overview | ✅ All | ✅ Team | ✅ Own |
| Sprint Burndown | ✅ All | ✅ Team | ❌ |
| Velocity Report | ✅ All | ✅ Team | ❌ |
| Time Tracking | ✅ All | ✅ Team | ✅ Own |
| Completion Rate | ✅ All | ✅ Team | ✅ Own |
| Export to PDF/Excel | ✅ | ✅ | ❌ |

**Location:** `src/app/(dashboard)/report/`

---

## Implementation Checklist

### Phase 1: Backend Access Control ✅

**File:** `src/features/[feature]/server/route.ts`

```typescript
// Helper function to check permissions
const hasPermission = (
  role: MemberRole, 
  permission: string
): boolean => {
  const permissions = {
    [MemberRole.ADMIN]: ['*'], // All permissions
    [MemberRole.PROJECT_MANAGER]: [
      'tasks.create',
      'tasks.edit',
      'tasks.assign',
      'projects.manage',
      'reports.view_team',
    ],
    [MemberRole.TEAM_LEAD]: [
      'tasks.create',
      'tasks.edit',
      'tasks.assign',
      'reports.view_team',
    ],
    [MemberRole.EMPLOYEE]: [
      'tasks.view',
      'tasks.edit_own',
      'reports.submit',
      'attendance.own',
    ],
    [MemberRole.MANAGEMENT]: [
      'view_all',
      'reports.view_all',
    ]
  };
  
  const userPerms = permissions[role] || [];
  return userPerms.includes('*') || userPerms.includes(permission);
};

// Usage in routes
app.post('/api/tasks', async (c) => {
  const user = c.get('user');
  const member = await getMemberRole(user.id);
  
  if (!hasPermission(member.role, 'tasks.create')) {
    return c.json({ error: 'Insufficient permissions' }, 403);
  }
  
  // ... create task
});
```

### Phase 2: Frontend UI Control

**File:** `src/components/role-guard.tsx` (Create new)

```typescript
'use client';

import { useGetMemberRole } from '@/features/members/api/use-get-role';
import { MemberRole } from '@/features/members/types';
import { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: MemberRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard = ({ 
  allowedRoles, 
  children, 
  fallback = null 
}: RoleGuardProps) => {
  const { data: roleData } = useGetMemberRole();
  
  if (!roleData) return null;
  
  const hasAccess = allowedRoles.includes(roleData.role);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Usage
<RoleGuard allowedRoles={[MemberRole.ADMIN, MemberRole.PROJECT_MANAGER]}>
  <Button>Create Project</Button>
</RoleGuard>
```

### Phase 3: Navigation/Menu Control

**File:** `src/components/sidebar.tsx`

```typescript
const menuItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [MemberRole.ADMIN, MemberRole.PROJECT_MANAGER, MemberRole.EMPLOYEE],
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: Folder,
    roles: [MemberRole.ADMIN, MemberRole.PROJECT_MANAGER],
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    roles: [MemberRole.ADMIN, MemberRole.PROJECT_MANAGER, MemberRole.EMPLOYEE],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart,
    roles: [MemberRole.ADMIN, MemberRole.PROJECT_MANAGER, MemberRole.MANAGEMENT],
  },
  {
    label: 'Profiles',
    href: '/profiles',
    icon: Users,
    roles: [MemberRole.ADMIN],
  },
];

// Filter based on user role
const visibleMenuItems = menuItems.filter(item => 
  item.roles.includes(currentUserRole)
);
```

---

## Quick Reference: Permission Matrix

### Complete Feature Access Matrix

| Feature | ADMIN | PROJECT_MANAGER | TEAM_LEAD | EMPLOYEE | MANAGEMENT |
|---------|-------|-----------------|-----------|----------|------------|
| **Workspace** |
| Create workspace | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage members | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Projects** |
| Create project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit own project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ | ❌ |
| View projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tasks** |
| Create task | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit any task | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit own task | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete task | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Attendance** |
| Start/end shift | ✅ | ✅ | ✅ | ✅ | ❌ |
| View all attendance | ✅ | ❌ | ❌ | ❌ | ✅ |
| View team attendance | ✅ | ✅ | ✅ | ❌ | ✅ |
| Edit attendance | ✅ | ⚠️ Team | ❌ | ❌ | ❌ |
| **Reports** |
| Submit weekly | ❌ | ❌ | ❌ | ✅ | ❌ |
| View all reports | ✅ | ❌ | ❌ | ❌ | ✅ |
| View team reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| Export reports | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Analytics** |
| View all analytics | ✅ | ❌ | ❌ | ❌ | ✅ |
| View team analytics | ✅ | ✅ | ✅ | ❌ | ✅ |
| View own analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Profiles** |
| Create profile | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit any profile | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete profile | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Implementation Priority

### High Priority (Implement First) 🔴

1. **Task Assignment Control**
   - Only ADMIN/PM/TL can create tasks
   - Employees can only update their assigned tasks
   
2. **Report Viewing**
   - Employees see only their reports
   - Managers see team reports
   - Admin sees all reports

3. **Project Creation**
   - Only ADMIN/PM can create projects
   - Limit project editing to creators

### Medium Priority 🟡

4. **Attendance Management**
   - Managers can view/edit team attendance
   - Employees can only view own

5. **Analytics Access**
   - Filter analytics by role
   - MANAGEMENT role gets read-only access

### Low Priority 🟢

6. **Custom Permissions**
   - Fine-grained permission system
   - Role-based feature flags

---

## Code Examples

### Example 1: Protect Route

```typescript
// src/features/projects/server/route.ts
app.post('/api/projects', 
  zValidator('json', createProjectSchema),
  async (c) => {
    const user = c.get('user');
    const member = await db.query.members.findFirst({
      where: and(
        eq(members.userId, user.id),
        eq(members.workspaceId, workspaceId)
      )
    });
    
    // Check permission
    if (![MemberRole.ADMIN, MemberRole.PROJECT_MANAGER].includes(member.role)) {
      return c.json({ error: 'Only admins and project managers can create projects' }, 403);
    }
    
    // Create project...
  }
);
```

### Example 2: Conditional UI

```typescript
// src/app/(dashboard)/projects/page.tsx
export default function ProjectsPage() {
  const { data: roleData } = useGetMemberRole();
  
  const canCreateProject = roleData && [
    MemberRole.ADMIN,
    MemberRole.PROJECT_MANAGER
  ].includes(roleData.role);
  
  return (
    <div>
      {canCreateProject && (
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Project
        </Button>
      )}
    </div>
  );
}
```

### Example 3: Filter Data by Role

```typescript
// src/features/weekly-reports/server/route.ts
app.get('/api/weekly-reports', async (c) => {
  const user = c.get('user');
  const member = await getMemberRole(user.id);
  
  let query = db.select().from(weeklyReports);
  
  switch (member.role) {
    case MemberRole.ADMIN:
    case MemberRole.MANAGEMENT:
      // See all reports
      break;
      
    case MemberRole.PROJECT_MANAGER:
    case MemberRole.TEAM_LEAD:
      // See team reports
      const teamMembers = await getTeamMembers(user.id);
      query = query.where(
        inArray(weeklyReports.userId, teamMembers.map(m => m.userId))
      );
      break;
      
    case MemberRole.EMPLOYEE:
      // See only own reports
      query = query.where(eq(weeklyReports.userId, user.id));
      break;
  }
  
  return c.json({ data: await query });
});
```

---

## Next Steps

1. **Review current access needs** - Identify which features need role restrictions
2. **Implement backend guards** - Add permission checks to API routes
3. **Update frontend UI** - Hide/show features based on role
4. **Test each role** - Create test users for each role and verify access
5. **Document changes** - Update user guide with role capabilities

Let me know which specific areas you'd like me to implement first!
