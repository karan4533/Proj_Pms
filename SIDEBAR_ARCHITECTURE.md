# 📁 Multi-Section Sidebar Architecture

## ✅ Implemented: Collapsible Section Structure

Your sidebar now has **expandable/collapsible sections** for different modules:

```
Sidebar
├─ 📊 PM (Project Management)      ← Currently expanded (defaultOpen={true})
│   ├─ Workspace Switcher
│   ├─ Navigation (Home, My Tasks, Settings, etc.)
│   └─ Projects List (Benz, Spine, etc.)
│
├─ 🕐 ATTENDANCE                    ← Collapsed (placeholder)
│   └─ "Coming soon..."
│
└─ 💡 SOLUTIONS                     ← Collapsed (placeholder)
    └─ "Coming soon..."
```

---

## 🎯 How It Works

### **1. CollapsibleSection Component**
**File**: `src/components/collapsible-section.tsx`

**Features**:
- ✅ Click to expand/collapse
- ✅ Smooth animations
- ✅ Icon support
- ✅ Default open/closed state
- ✅ Hover effects

**Props**:
```typescript
{
  title: string;           // Section name (e.g., "PM", "Attendance")
  icon?: React.ReactNode;  // Optional icon
  defaultOpen?: boolean;   // Start expanded or collapsed (default: true)
  children: React.ReactNode; // Content inside section
}
```

---

## 🚀 Adding New Sections (Future Modules)

### **Example 1: Add ATTENDANCE Module**

When you're ready to build the Attendance module:

```typescript
// In src/components/sidebar.tsx

import { Clock } from "lucide-react";
import { AttendanceNavigation } from "@/features/attendance/components/attendance-navigation";

<CollapsibleSection 
  title="Attendance" 
  icon={<Clock className="size-4" />}
  defaultOpen={false}  // Start collapsed
>
  {/* Your attendance navigation */}
  <AttendanceNavigation />
  
  {/* Or custom content */}
  <div className="space-y-2 px-3">
    <Link href="/attendance/check-in" className="block p-2 hover:bg-muted rounded">
      Check In/Out
    </Link>
    <Link href="/attendance/my-attendance" className="block p-2 hover:bg-muted rounded">
      My Attendance
    </Link>
    <Link href="/attendance/team" className="block p-2 hover:bg-muted rounded">
      Team Attendance
    </Link>
  </div>
</CollapsibleSection>
```

---

### **Example 2: Add SOLUTIONS Module**

```typescript
// In src/components/sidebar.tsx

import { Lightbulb } from "lucide-react";

<CollapsibleSection 
  title="Solutions" 
  icon={<Lightbulb className="size-4" />}
  defaultOpen={false}
>
  <div className="space-y-2 px-3">
    <Link href="/solutions/knowledge-base" className="block p-2 hover:bg-muted rounded">
      📚 Knowledge Base
    </Link>
    <Link href="/solutions/faqs" className="block p-2 hover:bg-muted rounded">
      ❓ FAQs
    </Link>
    <Link href="/solutions/support" className="block p-2 hover:bg-muted rounded">
      🆘 Support
    </Link>
  </div>
</CollapsibleSection>
```

---

### **Example 3: Add HR Module**

```typescript
import { Users } from "lucide-react";

<CollapsibleSection 
  title="HR" 
  icon={<Users className="size-4" />}
  defaultOpen={false}
>
  <div className="space-y-2 px-3">
    <Link href="/hr/employees" className="block p-2 hover:bg-muted rounded">
      👥 Employees
    </Link>
    <Link href="/hr/leave" className="block p-2 hover:bg-muted rounded">
      🏖️ Leave Management
    </Link>
    <Link href="/hr/payroll" className="block p-2 hover:bg-muted rounded">
      💰 Payroll
    </Link>
  </div>
</CollapsibleSection>
```

---

## 📝 Complete Sidebar Structure (Future)

```typescript
export const Sidebar = () => {
  return (
    <aside className="h-full bg-muted/50 dark:bg-muted/30 p-4 w-full border-r border-border overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={50} height={39} />
        </Link>
        <p className="font-bold text-lg">GGS</p>
      </div>
      <DottedSeparator className="my-4" />
      
      {/* 1. PM (Project Management) */}
      <CollapsibleSection 
        title="PM" 
        icon={<FolderKanban className="size-4" />}
        defaultOpen={true}
      >
        <WorkspaceSwitcher />
        <DottedSeparator className="my-4" />
        <Navigation />
        <DottedSeparator className="my-4" />
        <Projects />
      </CollapsibleSection>

      {/* 2. ATTENDANCE */}
      <CollapsibleSection 
        title="Attendance" 
        icon={<Clock className="size-4" />}
        defaultOpen={false}
      >
        <AttendanceNavigation />
      </CollapsibleSection>

      {/* 3. SOLUTIONS */}
      <CollapsibleSection 
        title="Solutions" 
        icon={<Lightbulb className="size-4" />}
        defaultOpen={false}
      >
        <SolutionsNavigation />
      </CollapsibleSection>

      {/* 4. HR (Human Resources) */}
      <CollapsibleSection 
        title="HR" 
        icon={<Users className="size-4" />}
        defaultOpen={false}
      >
        <HRNavigation />
      </CollapsibleSection>

      {/* 5. FINANCE */}
      <CollapsibleSection 
        title="Finance" 
        icon={<DollarSign className="size-4" />}
        defaultOpen={false}
      >
        <FinanceNavigation />
      </CollapsibleSection>

      {/* 6. CRM */}
      <CollapsibleSection 
        title="CRM" 
        icon={<UserCircle className="size-4" />}
        defaultOpen={false}
      >
        <CRMNavigation />
      </CollapsibleSection>

    </aside>
  );
};
```

---

## 🎨 Customization Options

### **1. Change Default State**
```typescript
// Start expanded
<CollapsibleSection defaultOpen={true}>

// Start collapsed
<CollapsibleSection defaultOpen={false}>
```

### **2. Add Icons**
```typescript
import { 
  FolderKanban,  // PM
  Clock,         // Attendance
  Lightbulb,     // Solutions
  Users,         // HR
  DollarSign,    // Finance
  UserCircle,    // CRM
  ShoppingCart,  // E-commerce
  BarChart,      // Analytics
  Settings,      // Settings
  Bell,          // Notifications
} from "lucide-react";

<CollapsibleSection 
  icon={<YourIcon className="size-4" />}
/>
```

### **3. Custom Styling**
```typescript
// In collapsible-section.tsx, you can customize:
- Button hover colors: hover:bg-muted/80
- Text colors: text-muted-foreground
- Animation speed: duration-200
- Chevron rotation
```

---

## 🏗️ Folder Structure for Future Modules

```
src/
├── features/
│   ├── auth/           (Existing)
│   ├── projects/       (Existing)
│   ├── tasks/          (Existing)
│   ├── workspaces/     (Existing)
│   │
│   ├── attendance/     (Future)
│   │   ├── api/
│   │   ├── components/
│   │   │   └── attendance-navigation.tsx
│   │   ├── hooks/
│   │   └── types/
│   │
│   ├── solutions/      (Future)
│   │   ├── api/
│   │   ├── components/
│   │   │   └── solutions-navigation.tsx
│   │   └── types/
│   │
│   └── hr/             (Future)
│       ├── api/
│       ├── components/
│       │   └── hr-navigation.tsx
│       └── types/
│
├── app/
│   ├── (dashboard)/
│   │   ├── workspaces/   (Existing)
│   │   ├── attendance/   (Future)
│   │   ├── solutions/    (Future)
│   │   └── hr/           (Future)
```

---

## 🔄 State Management (Optional Future Enhancement)

For remembering which sections are open/closed:

```typescript
// Using localStorage
const [openSections, setOpenSections] = useState(() => {
  const saved = localStorage.getItem('sidebar-open-sections');
  return saved ? JSON.parse(saved) : { pm: true, attendance: false };
});

// Save when changed
useEffect(() => {
  localStorage.setItem('sidebar-open-sections', JSON.stringify(openSections));
}, [openSections]);
```

---

## 🎯 Benefits

✅ **Organized**: Each module has its own section  
✅ **Scalable**: Easy to add new modules  
✅ **User-Friendly**: Expand only what you need  
✅ **Clean UI**: Reduces clutter in sidebar  
✅ **Flexible**: Each section can have different content  
✅ **Animated**: Smooth transitions  
✅ **Responsive**: Works on all screen sizes  

---

## 📊 Current Implementation

**What's Live Now**:
- ✅ CollapsibleSection component created
- ✅ Sidebar updated with 3 sections (PM, Attendance, Solutions)
- ✅ PM section contains current navigation (expanded by default)
- ✅ Attendance and Solutions are placeholders (collapsed by default)

**What You'll Add Later**:
- ⏳ Attendance module navigation
- ⏳ Solutions module navigation  
- ⏳ Additional modules (HR, Finance, CRM, etc.)

---

## 💡 Quick Start Guide for New Module

1. **Create module feature folder**:
   ```bash
   mkdir -p src/features/attendance/components
   ```

2. **Create navigation component**:
   ```typescript
   // src/features/attendance/components/attendance-navigation.tsx
   export const AttendanceNavigation = () => {
     return (
       <div className="space-y-2 px-3">
         {/* Your links here */}
       </div>
     );
   };
   ```

3. **Add to sidebar**:
   ```typescript
   // src/components/sidebar.tsx
   import { AttendanceNavigation } from "@/features/attendance/components/attendance-navigation";
   
   <CollapsibleSection title="Attendance" icon={<Clock />}>
     <AttendanceNavigation />
   </CollapsibleSection>
   ```

4. **Create routes**:
   ```bash
   mkdir -p src/app/(dashboard)/attendance
   # Add page.tsx files
   ```

Done! 🎉

---

**Created**: November 11, 2025  
**Status**: ✅ Ready for future module expansion  
**Architecture**: Collapsible multi-section sidebar
