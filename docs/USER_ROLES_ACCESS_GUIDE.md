# 🔐 User Roles & Module Access Guide

## Quick Reference: All Roles

| Role | Icon | Level | Description |
|------|------|-------|-------------|
| **ADMIN** | 👑 | Highest | Complete system control, all permissions |
| **PROJECT MANAGER** | 📊 | High | Manages projects, teams, and tasks |
| **TEAM LEAD** | 🎯 | Medium | Leads team, manages assigned tasks |
| **EMPLOYEE** | 👷 | Basic | Works on assigned tasks, limited access |
| **MANAGEMENT** | 📈 | View-Only | Read-only access to reports and analytics |

---

## 📋 Complete Module Access Matrix

### Core Modules

| Module | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|--------|----------|------------|--------------|-------------|---------------|
| **Dashboard** | ✅ All data | ✅ Team data | ✅ Team data | ✅ Own data | ✅ All data (view-only) |
| **Tasks (View)** | ✅ All tasks | ✅ Team tasks | ✅ Team tasks | ✅ Assigned tasks | ✅ All tasks |
| **Tasks (Create)** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Tasks (Edit Any)** | ✅ | ✅ | ✅ Own team | ❌ | ❌ |
| **Tasks (Edit Own)** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Tasks (Delete)** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Board View** | ✅ | ✅ | ✅ | ✅ View-only | ✅ View-only |
| **List View** | ✅ | ✅ | ✅ | ✅ | ✅ |

### Project Management

| Feature | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|---------|----------|------------|--------------|-------------|---------------|
| **Create Project** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Project** | ✅ All | ✅ Own | ❌ | ❌ | ❌ |
| **Delete Project** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Projects** | ✅ All | ✅ Assigned | ✅ Assigned | ✅ Assigned | ✅ All |
| **Assign Members** | ✅ | ✅ Own projects | ❌ | ❌ | ❌ |
| **Set Requirements** | ✅ | ✅ | ✅ | ❌ | ❌ |

### User & Profile Management

| Feature | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|---------|----------|------------|--------------|-------------|---------------|
| **Add Profile** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Own Profile** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit Any Profile** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Bulk Import** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Profiles** | ✅ All | ✅ Team | ✅ Team | ✅ Own | ✅ All |

### Attendance System

| Feature | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|---------|----------|------------|--------------|-------------|---------------|
| **Start/End Shift** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Own Attendance** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Team Attendance** | ✅ All teams | ✅ Own team | ✅ Own team | ❌ | ✅ All teams |
| **View All Attendance** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Manual Adjustments** | ✅ | ⚠️ Own team | ❌ | ❌ | ❌ |
| **Export Reports** | ✅ | ✅ | ✅ | ❌ | ✅ |

### Weekly Reports

| Feature | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|---------|----------|------------|--------------|-------------|---------------|
| **Submit Report** | ⚠️ Optional | ⚠️ Optional | ⚠️ Optional | ✅ Required | ❌ |
| **View Own Reports** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Team Reports** | ✅ All teams | ✅ Own team | ✅ Own team | ❌ | ✅ All teams |
| **View All Reports** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Download Reports** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Approve/Reject** | ✅ | ✅ Own team | ❌ | ❌ | ❌ |

### Reports & Analytics

| Report Type | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|-------------|----------|------------|--------------|-------------|---------------|
| **Status Overview** | ✅ All | ✅ Team | ✅ Team | ✅ Own | ✅ All |
| **Sprint Burndown** | ✅ All | ✅ Team | ✅ Team | ❌ | ✅ All |
| **Velocity Chart** | ✅ All | ✅ Team | ✅ Team | ❌ | ✅ All |
| **Cycle Time** | ✅ All | ✅ Team | ✅ Team | ❌ | ✅ All |
| **Cumulative Flow** | ✅ All | ✅ Team | ✅ Team | ❌ | ✅ All |
| **Time Tracking** | ✅ All | ✅ Team | ✅ Team | ✅ Own | ✅ All |
| **Export PDF/Excel** | ✅ | ✅ | ✅ | ❌ | ✅ |

### Bug Tracker

| Feature | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|---------|----------|------------|--------------|-------------|---------------|
| **Report Bug** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **View Bugs** | ✅ All | ✅ Team | ✅ Team | ✅ Assigned | ✅ All |
| **Edit Bug** | ✅ | ✅ | ✅ Own | ✅ Own reports | ❌ |
| **Delete Bug** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Assign Bug** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Change Status** | ✅ | ✅ | ✅ | ✅ Assigned | ❌ |
| **Add Comments** | ✅ | ✅ | ✅ | ✅ | ⚠️ View-only |

### Settings & Configuration

| Feature | 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management |
|---------|----------|------------|--------------|-------------|---------------|
| **Workspaces** | ✅ Create/Edit | ❌ | ❌ | ❌ | ❌ |
| **Custom Fields** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Custom Departments** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Custom Designations** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **List View Columns** | ✅ | ✅ | ✅ | ⚠️ View-only | ⚠️ View-only |
| **Notifications** | ✅ All | ✅ Team | ✅ Team | ✅ Own | ✅ All |

---

## 🎯 Quick Decision Guide

### "Can I do this?"

**Create new users?**
- ✅ ADMIN only

**Create projects?**
- ✅ ADMIN, PROJECT MANAGER

**Assign tasks?**
- ✅ ADMIN, PROJECT MANAGER, TEAM LEAD

**Edit any task?**
- ✅ ADMIN, PROJECT MANAGER
- ⚠️ TEAM LEAD (own team only)
- ⚠️ EMPLOYEE (own tasks only)

**View reports?**
- ✅ All roles (scope differs)
- ADMIN: All data
- MANAGER/TEAM LEAD: Team data
- EMPLOYEE: Own data
- MANAGEMENT: All data (read-only)

**Download/Export data?**
- ✅ ADMIN, PROJECT MANAGER, TEAM LEAD, MANAGEMENT
- ❌ EMPLOYEE

**Submit weekly reports?**
- ✅ EMPLOYEE (required)
- ⚠️ Others (optional)

---

## 📱 Page Access Summary

### Pages EVERYONE Can Access
- `/dashboard` - Dashboard (filtered by role)
- `/tasks` - Task List (filtered by role)
- `/board` - Board View (filtered by role)
- `/edit-profile` - Edit Own Profile
- `/attendance` - Own Attendance

### Admin/Manager Only Pages
- `/profile` - Add Profile (Admin only for tab 3)
- `/report-download` - Weekly Report Download
- `/workspaces` - Workspace Management (Admin only)

### Employee Pages
- `/weekly-report` - Submit Weekly Report

### Management Pages  
- All view/read pages (no edit capabilities)
- All report pages

---

## 🔒 Access Control Implementation

### Current Status
✅ Admin Guards in place for:
- User Management
- Profile Creation
- Workspace Management
- Weekly Report Downloads

⚠️ Needs Enhancement:
- Task editing permissions (currently binary)
- Project-level permissions
- Fine-grained report access

### Test Credentials
- **Admin**: admin@test.pms / admin123
- **Manager**: manager@test.pms / manager123
- **Team Lead**: teamlead@test.pms / teamlead123
- **Employee**: employee@test.pms / employee123
- **Management**: management@test.pms / management123

---

## Legend
- ✅ Full Access
- ⚠️ Limited/Conditional Access
- ❌ No Access
- 👑 Admin | 📊 Manager | 🎯 Team Lead | 👷 Employee | 📈 Management
