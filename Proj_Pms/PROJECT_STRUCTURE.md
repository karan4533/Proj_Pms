# 📁 Project Structure Guide

This document explains the organization of the codebase to help developers navigate and contribute effectively.

## 🎯 Overview

This is a Next.js 14+ project using App Router, TypeScript, and a feature-based architecture.

## 📂 Directory Structure

```
PMS1/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Authentication pages (login, signup)
│   │   ├── (dashboard)/         # Main application pages
│   │   └── api/                 # API route handlers
│   │
│   ├── components/              # Shared UI components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── sidebar.tsx          # Main sidebar navigation
│   │   ├── navbar.tsx           # Top navigation bar
│   │   └── ...                  # Other shared components
│   │
│   ├── features/                # Feature-based modules
│   │   ├── auth/                # Authentication
│   │   ├── tasks/               # Task management
│   │   ├── projects/            # Project management
│   │   ├── members/             # Team member management
│   │   ├── attendance/          # Attendance tracking
│   │   ├── weekly-reports/      # Weekly reporting system
│   │   ├── bugs/                # Bug tracking
│   │   ├── profiles/            # User profiles
│   │   ├── admin/               # Admin features
│   │   └── ...                  # Other features
│   │
│   ├── db/                      # Database configuration
│   │   ├── schema.ts            # Drizzle ORM schema
│   │   └── index.ts             # Database client
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── utils.ts             # General utilities
│   │   ├── session-middleware.ts # Auth middleware
│   │   └── ...                  # Other utilities
│   │
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   └── config.ts                # Application configuration
│
├── scripts/                     # Utility scripts
│   ├── manage-test-users.ts    # User management CLI
│   └── ...                      # Database migrations & utilities
│
├── docs/                        # Documentation
│   ├── USER_ROLES_ACCESS_GUIDE.md
│   ├── ROLE_BASED_ACCESS_CONTROL.md
│   └── ...                      # Other documentation
│
├── drizzle/                     # Database migrations
└── public/                      # Static assets

```

---

## 🏗️ Feature Module Structure

Each feature follows a consistent structure:

```
features/[feature-name]/
├── api/                         # React Query hooks
│   ├── use-get-[resource].ts   # GET requests
│   ├── use-create-[resource].ts # POST requests
│   ├── use-update-[resource].ts # PATCH/PUT requests
│   └── use-delete-[resource].ts # DELETE requests
│
├── components/                  # Feature-specific UI components
│   ├── [feature]-list.tsx      # List view
│   ├── [feature]-form.tsx      # Create/edit form
│   ├── [feature]-card.tsx      # Card component
│   └── ...                      # Other components
│
├── server/                      # Backend API routes
│   └── route.ts                 # Hono.js route handlers
│
├── types.ts                     # Feature-specific types
└── utils.ts                     # Feature-specific utilities
```

---

## 📄 File Naming Conventions

### Components
- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Client Components**: `[name].tsx` or `client.tsx`
- **Server Components**: Default (no suffix needed)

### API Hooks
- **GET**: `use-get-[resource].ts`
- **POST**: `use-create-[resource].ts`
- **PATCH**: `use-update-[resource].ts`
- **DELETE**: `use-delete-[resource].ts`

### Backend Routes
- **API Routes**: `route.ts` (using Hono.js)
- **Middleware**: `[name]-middleware.ts`

### Types
- **Feature Types**: `types.ts` (in feature folder)
- **Shared Types**: `src/types/[name].ts`

---

## 🔑 Key Features Location

| Feature | Page Route | API Route | Components |
|---------|-----------|-----------|------------|
| **Dashboard** | `/dashboard` | `/api/tasks` | `src/components/jira-dashboard.tsx` |
| **Tasks** | `/tasks` | `/api/tasks` | `src/features/tasks/components/` |
| **Projects** | `/projects` | `/api/projects` | `src/features/projects/components/` |
| **Attendance** | `/attendance` | `/api/attendance` | `src/features/attendance/components/` |
| **Weekly Reports** | `/weekly-report`, `/report-download` | `/api/weekly-reports` | `src/features/weekly-reports/components/` |
| **Bug Tracker** | `/bugs` | `/api/bugs` | `src/features/bugs/components/` |
| **User Management** | `/profile` (Admin tab) | `/api/admin/create-user` | `src/app/(dashboard)/admin/user-management/` |
| **Profiles** | `/profile` | `/api/profiles` | `src/features/profiles/components/` |

---

## 🎨 UI Components

### Shadcn UI Components
Located in `src/components/ui/`
- Installed via `npx shadcn-ui@latest add [component]`
- Customizable, accessible components
- Examples: `button.tsx`, `card.tsx`, `dialog.tsx`, `form.tsx`

### Shared Components
Located in `src/components/`
- `sidebar.tsx` - Main navigation sidebar
- `navbar.tsx` - Top navigation bar
- `admin-guard.tsx` - Role-based access control wrapper
- `excel-upload-card.tsx` - Excel file upload component
- `jira-dashboard.tsx` - Main dashboard component

---

## 🗄️ Database

### Technology
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Schema**: `src/db/schema.ts`

### Running Migrations
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Push schema changes
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Adding New Tables
1. Define schema in `src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

---

## 🔐 Authentication & Authorization

### Auth System
- **Provider**: NextAuth.js / Custom JWT
- **Location**: `src/features/auth/`
- **Middleware**: `src/lib/session-middleware.ts`

### User Roles
See [USER_ROLES_ACCESS_GUIDE.md](docs/USER_ROLES_ACCESS_GUIDE.md)

- **ADMIN** 👑 - Full system access
- **PROJECT_MANAGER** 📊 - Manage projects & teams
- **TEAM_LEAD** 🎯 - Lead teams & tasks
- **EMPLOYEE** 👷 - Work on assigned tasks
- **MANAGEMENT** 📈 - Read-only access

### Protecting Routes
```typescript
// Server-side (page.tsx)
import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";

const user = await getCurrent();
if (!user) redirect("/sign-in");

// Check role
import { MemberRole } from "@/features/members/types";
const isAdmin = member.role === MemberRole.ADMIN;
```

---

## 📡 API Structure

### Backend (Hono.js)
```typescript
// src/features/[feature]/server/route.ts
import { Hono } from "hono";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    // GET handler
  })
  .post("/", sessionMiddleware, async (c) => {
    // POST handler
  });

export default app;
```

### Frontend (React Query)
```typescript
// src/features/[feature]/api/use-get-[resource].ts
import { useQuery } from "@tanstack/react-query";

export const useGetResource = () => {
  return useQuery({
    queryKey: ["resource"],
    queryFn: async () => {
      const response = await fetch("/api/resource");
      return response.json();
    },
  });
};
```

---

## 🧪 Testing

### Test Users
See [scripts/manage-test-users.ts](scripts/manage-test-users.ts)

```bash
# Create all test users
npm run manage:test-users create

# Delete all test users
npm run manage:test-users delete

# Delete specific role
npm run manage:test-users delete:manager

# Reset (delete + recreate)
npm run manage:test-users reset
```

**Test Credentials:**
- admin@test.pms / admin123
- manager@test.pms / manager123
- teamlead@test.pms / teamlead123
- employee@test.pms / employee123
- management@test.pms / management123

---

## 🚀 Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Adding a New Feature

1. **Create feature directory**
   ```bash
   mkdir -p src/features/my-feature/{api,components,server}
   ```

2. **Define types**
   ```typescript
   // src/features/my-feature/types.ts
   export interface MyFeature {
     id: string;
     name: string;
   }
   ```

3. **Create API route**
   ```typescript
   // src/features/my-feature/server/route.ts
   import { Hono } from "hono";
   const app = new Hono();
   // Add routes
   export default app;
   ```

4. **Register route**
   ```typescript
   // src/app/api/[[...route]]/route.ts
   import myFeature from "@/features/my-feature/server/route";
   
   const routes = app
     // ... existing routes
     .route("/my-feature", myFeature);
   ```

5. **Create React Query hooks**
   ```typescript
   // src/features/my-feature/api/use-get-my-feature.ts
   export const useGetMyFeature = () => {
     return useQuery({ /* ... */ });
   };
   ```

6. **Build components**
   ```typescript
   // src/features/my-feature/components/my-feature-list.tsx
   export const MyFeatureList = () => {
     const { data } = useGetMyFeature();
     return <div>{/* Component JSX */}</div>;
   };
   ```

7. **Create page**
   ```typescript
   // src/app/(dashboard)/my-feature/page.tsx
   import { MyFeatureList } from "@/features/my-feature/components/my-feature-list";
   
   export default function MyFeaturePage() {
     return <MyFeatureList />;
   }
   ```

---

## 📋 Code Style Guidelines

### TypeScript
- Use strict types, avoid `any`
- Define interfaces for all data structures
- Use type inference where possible

### React
- Prefer functional components
- Use hooks for state and side effects
- Extract reusable logic into custom hooks

### Naming
- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMyHook.ts`)
- **Utilities**: camelCase (`myUtility.ts`)
- **Constants**: UPPER_SNAKE_CASE

### File Organization
- One component per file
- Co-locate related files (component + styles + tests)
- Keep files focused and single-purpose

---

## 🔧 Common Tasks

### Adding a New UI Component
```bash
npx shadcn-ui@latest add [component-name]
```

### Creating a Database Migration
```bash
# 1. Modify src/db/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Apply migration
npm run db:migrate
```

### Adding a New Page
1. Create file in `src/app/(dashboard)/[route]/page.tsx`
2. Add to sidebar navigation in `src/components/sidebar.tsx`
3. Add role-based access control if needed

### Debugging
- Use VS Code debugger (F5)
- Check browser console for client errors
- Check terminal for server errors
- Use `console.log()` strategically

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Hono.js Documentation](https://hono.dev/)

---

## 🤝 Contributing

1. Create a feature branch
2. Follow the established patterns
3. Test thoroughly with different user roles
4. Update documentation if needed
5. Submit pull request

---

## ⚠️ Important Notes

- **Never commit** `.env.local` file
- **Always test** with different user roles (admin, manager, employee)
- **Run migrations** before pulling latest code
- **Check permissions** when adding new features
- **Follow naming conventions** consistently

---

**Last Updated**: December 19, 2025
**Maintained By**: Development Team
