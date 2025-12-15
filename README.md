<div align="center">

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/karan-moorthy/PMS1">
    <img src="public/logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">PMS1 - Enterprise Project Management System</h1>

  <p align="center">
    A modern, full-featured project management platform built with Next.js, TypeScript, and PostgreSQL
    <br />
    <a href="./docs/COMPREHENSIVE_SYSTEM_GUIDE.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#-screenshots">View Demo</a>
    ·
    <a href="https://github.com/karan-moorthy/PMS1/issues">Report Bug</a>
    ·
    <a href="https://github.com/karan-moorthy/PMS1/issues">Request Feature</a>
  </p>
</p>

<!-- BADGES -->
<p align="center">
  <a href="https://github.com/karan-moorthy/PMS1/stargazers">
    <img src="https://img.shields.io/github/stars/karan-moorthy/PMS1?style=for-the-badge" alt="Stars">
  </a>
  <a href="https://github.com/karan-moorthy/PMS1/network/members">
    <img src="https://img.shields.io/github/forks/karan-moorthy/PMS1?style=for-the-badge" alt="Forks">
  </a>
  <a href="https://github.com/karan-moorthy/PMS1/issues">
    <img src="https://img.shields.io/github/issues/karan-moorthy/PMS1?style=for-the-badge" alt="Issues">
  </a>
  <a href="https://github.com/karan-moorthy/PMS1/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/karan-moorthy/PMS1?style=for-the-badge" alt="License">
  </a>
</p>

<!-- TECH STACK BADGES -->
<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
</p>

</div>

---

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">📑 Table of Contents</h2></summary>
  <ol>
    <li><a href="#-overview">Overview</a></li>
    <li><a href="#-features">Features</a></li>
    <li><a href="#-tech-stack">Tech Stack</a></li>
    <li><a href="#-getting-started">Getting Started</a></li>
    <li><a href="#-documentation">Documentation</a></li>
    <li><a href="#-project-structure">Project Structure</a></li>
    <li><a href="#%EF%B8%8F-database-schema">Database Schema</a></li>
    <li><a href="#-key-features-breakdown">Key Features Breakdown</a></li>
    <li><a href="#-screenshots">Screenshots</a></li>
    <li><a href="#-configuration">Configuration</a></li>
    <li><a href="#-deployment">Deployment</a></li>
    <li><a href="#-contributing">Contributing</a></li>
<p align="right">(<a href="#top">back to top</a>)</p>

    <li><a href="#-license">License</a></li>
    <li><a href="#-roadmap">Roadmap</a></li>
    <li><a href="#-support">Support</a></li>
  </ol>
</details>

---

## 📋 Overview

**PMS1** is a comprehensive, enterprise-grade project management system designed to rival platforms like Jira and Monday.com. Built with modern web technologies, it provides organizations with powerful tools for task management, team collaboration, attendance tracking, and project oversight.

### 🎯 Key Highlights

- ✅ **Multi-workspace architecture** with role-based access control (RBAC)
- ✅ **Kanban boards** with drag-and-drop task management
- ✅ **Bug tracking system** with full lifecycle management
- ✅ **Attendance management** with automated shift tracking
- ✅ **Real-time notifications** and activity logging
- ✅ **Dynamic custom fields** (Jira-style flexible task attributes)
- ✅ **Bulk CSV import/export** for tasks and data
- ✅ **Weekly reports** and requirement tracking
- ✅ **Performance optimized** for 1,000+ concurrent users

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure authentication** with bcrypt password hashing
- **Role-based access control** (RBAC) with 5 permission levels:
  - `ADMIN` - Full system control
  - `PROJECT_MANAGER` - Project and task oversight
  - `TEAM_LEAD` - Team management capabilities
  - `EMPLOYEE` - Standard task access
  - `MANAGEMENT` - Read-only oversight
- **Session management** with automatic token refresh
- **Workspace invitations** with email-based onboarding

### 📊 Project & Task Management
- **Multi-project workspaces** with team isolation
- **Kanban boards** with customizable columns and drag-and-drop
- **Task hierarchy** with parent-child relationships
- **Dynamic custom fields** (JSONB-based flexible attributes)
- **Bulk operations** - CSV import/export with 1,000+ row support
- **Advanced filtering** by status, assignee, project, date ranges
- **Task priorities** (Low, Medium, High) with visual indicators
- **Due date tracking** with overdue notifications
- **Rich task descriptions** with markdown support

### 🐛 Bug Tracking
- **Comprehensive bug tracker** with severity levels
- **Bug lifecycle management** (Open → In Progress → Resolved → Closed)
- **Attachments support** for bug reports
- **Comments and discussions** on bug tickets
- **Bug resolution tracking** with fix dates and notes

### ⏰ Attendance Management
- **Clock in/out system** with shift tracking
- **Auto end-shift at 11:59 PM** via cron job automation
- **Daily task logging** during shifts
- **Attendance history** with date range filters
- **Admin attendance dashboard** with team overview
- **Export capabilities** for payroll integration

### 📈 Reporting & Analytics
- **Dashboard overview** with task statistics
- **Visual charts** (pie, bar) for status distribution
- **Recent activity timeline** (Jira-style audit logs)
- **Weekly report generation** with draft mode
- **Requirements tracking** with due dates
- **Performance metrics** and team analytics

### 🔔 Notifications & Activity Logs
- **Real-time notifications** for task updates
- **Activity logging system** tracking all changes
- **Recent activity feeds** per workspace
- **Email notifications** for invitations and assignments

### 🎨 User Experience
- **Dark/Light mode** with theme persistence
- **Responsive design** (mobile, tablet, desktop)
- **Intuitive UI** with shadcn/ui components
- **Fast load times** (<1 second initial page load)
- **Smooth animations** (60 FPS performance)
- **Accessibility compliant** (WCAG 2.1 AA)

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 14.2](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library with Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled accessible components
- **[TanStack Query 5](https://tanstack.com/query)** - Data fetching & caching
<p align="right">(<a href="#top">back to top</a>)</p>

- **[React Hook Form](https://react-hook-form.com/)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation

### Backend
- **[Hono](https://hono.dev/)** - Fast, lightweight web framework (RPC API)
- **[PostgreSQL 16](https://www.postgresql.org/)** - Relational database
- **[Drizzle ORM 0.44](https://orm.drizzle.team/)** - Type-safe ORM
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **Node.js Cron** - Scheduled task automation

### Development & Tools
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking
- **[ESLint](https://eslint.org/)** - Code linting
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Database migrations
- **[ExcelJS](https://github.com/exceljs/exceljs)** - Excel file generation
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[date-fns](https://date-fns.org/)** - Date utilities

### UI Libraries & Components
- **[Recharts](https://recharts.org/)** - Data visualization charts
- **[React Big Calendar](https://github.com/jquense/react-big-calendar)** - Calendar views
- **[React DnD](https://react-dnd.github.io/)** - Drag-and-drop functionality
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Vaul](https://vaul.emilkowal.ski/)** - Drawer component

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **PostgreSQL** 16.x or higher
- **npm** or **yarn** or **bun** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/karan-moorthy/PMS1.git
   cd PMS1
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/pms1_db"

   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # Application
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Set up the database**

   ```bash
   # Generate database schema
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # (Optional) Push schema directly
   npm run db:push
   ```

5. **Run the development server**

   ```bash
   npm run dev
<p align="right">(<a href="#top">back to top</a>)</p>

   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🔨 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database Operations
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run database migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run db:check         # Check database connection

# Data Management Scripts
npm run migrate:roles           # Migrate member roles
npm run migrate:roles:preview   # Preview role migration
npm run manage:roles            # Manage member roles
npm run create:role-users       # Create role-based users
npm run add:users-to-workspaces # Add users to workspaces
```

---

## 📖 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

- **[📘 Comprehensive System Guide](./docs/COMPREHENSIVE_SYSTEM_GUIDE.md)** - Complete feature documentation
<p align="right">(<a href="#top">back to top</a>)</p>

- **[🗄️ Database Structure](./docs/DATABASE_STRUCTURE.md)** - Database schema and relationships
- **[🔧 Custom Fields Guide](./docs/CUSTOM_FIELDS_GUIDE.md)** - Dynamic field system (Jira-style)
- **[⏱️ Auto End-Shift & Performance](./docs/AUTO_END_SHIFT_AND_PERFORMANCE.md)** - Cron jobs and optimization
- **[📋 Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[🚀 Quick Start - Custom Fields](./docs/QUICK_START_CUSTOM_FIELDS.md)** - Custom fields setup guide

---

## 🏗️ Project Structure

```
PMS1/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   │   ├── attendance/    # Attendance pages
│   │   │   ├── bugs/          # Bug tracker pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── projects/      # Project management
│   │   │   ├── tasks/         # Task management
│   │   │   ├── weekly-report/ # Weekly reports
│   │   │   └── workspaces/    # Workspace pages
│   │   └── api/               # API routes (Hono RPC)
│   ├── components/            # Shared React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── sidebar.tsx       # Navigation sidebar
│   │   ├── navbar.tsx        # Top navigation bar
│   │   └── jira-dashboard.tsx # Dashboard component
│   ├── db/                   # Database configuration
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   └── index.ts          # Database connection
│   ├── features/             # Feature modules
│   │   ├── activity/         # Activity logs
│   │   ├── attendance/       # Attendance system
│   │   ├── auth/             # Authentication
│   │   ├── bugs/             # Bug tracking
│   │   ├── invitations/      # Workspace invites
│   │   ├── members/          # Member management
│   │   ├── notifications/    # Notifications
│   │   ├── profiles/         # User profiles
│   │   ├── projects/         # Project management
│   │   ├── requirements/     # Requirements tracking
│   │   ├── tasks/            # Task management
│   │   ├── weekly-reports/   # Weekly reports
│   │   └── workspaces/       # Workspace management
│   ├── lib/                  # Utility libraries
│   │   ├── cron-service.ts   # Cron job service
│   │   ├── rpc.ts            # RPC client
│   │   └── utils.ts          # Helper functions
│   └── types/                # TypeScript type definitions
├── drizzle/                  # Database migrations
├── docs/                     # Documentation
├── public/                   # Static assets
├── scripts/                  # Database & utility scripts
<p align="right">(<a href="#top">back to top</a>)</p>

├── .env.local               # Environment variables (create this)
├── drizzle.config.ts        # Drizzle ORM configuration
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## 🗄️ Database Schema

The system uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations.

### Core Tables (19 total)

| Table | Description | Key Features |
|-------|-------------|-------------|
| `users` | User accounts | Authentication, profiles, employee details |
| `workspaces` | Multi-tenant workspaces | Team isolation, invite codes |
| `members` | User-workspace relationships | RBAC with 5 role levels |
| `projects` | Projects within workspaces | Project tracking, team assignments |
| `tasks` | Task management | Kanban, custom fields (JSONB), parent-child hierarchy |
| `bugs` | Bug tracking | Severity levels, lifecycle management |
| `attendance` | Attendance records | Clock in/out, shift tracking, auto-end |
| `activity_logs` | Audit trail | Tracks all system changes |
| `notifications` | User notifications | Real-time updates |
| `weekly_reports` | Weekly report submissions | Draft mode, approval workflow |
| `requirements` | Project requirements | Due date tracking |
| `invitations` | Workspace invitations | Email-based onboarding |
| `custom_designations` | Custom job titles | Organization-specific roles |
| `custom_departments` | Custom departments | Organization structure |
| `board_columns` | Kanban column configs | Custom workflow states |
| `list_view_columns` | Table view configs | User preferences |
<p align="right">(<a href="#top">back to top</a>)</p>


**Key Features:**
- ✅ Foreign key constraints for data integrity
- ✅ Indexed columns for fast queries
- ✅ JSONB fields for flexible data (custom fields, labels)
- ✅ Cascading deletes for cleanup
- ✅ Timestamps for audit trails

See [Database Structure Documentation](./docs/DATABASE_STRUCTURE.md) for complete schema details.

---

## 🎨 Key Features Breakdown

### 1. **Dynamic Custom Fields** (Jira-Style)

Tasks support dynamic custom fields stored in JSONB columns, allowing organizations to add fields like:
- Sprint numbers
- Story points
- Release versions
- Custom dates
- Dropdown selections

**CSV Import:** Automatically detects and maps non-standard columns to custom fields.

```typescript
// Example task with custom fields
{
  id: "task-123",
  name: "Implement feature X",
  status: "IN_PROGRESS",
  customFields: {
    "Sprint Number": "Sprint 23",
    "Story Points": 5,
    "Release Version": "v2.1.0"
  }
}
```

### 2. **Auto End-Shift System**

Automated cron job runs every minute at **11:59 PM** to:
- Find all active attendance sessions (`IN_PROGRESS`)
- Calculate shift duration from start time to 11:59 PM
- Auto-complete shifts with status `AUTO_COMPLETED`
- Add audit note: "Shift automatically ended at midnight"

**Benefits:**
- ✅ No forgotten shifts
- ✅ Accurate time tracking
- ✅ Fair payroll calculations
- ✅ Clean data integrity

### 3. **Performance Optimization**

**50-record limit** applied across all major endpoints for optimal performance:
- Tasks API
- Attendance records
- Projects list
- Workspaces
- Bug tracker
- Weekly reports

**Result:** <1 second load times even with large datasets.

<p align="right">(<a href="#top">back to top</a>)</p>

### 4. **Role-Based Access Control (RBAC)**

5-tier permission system:

<details>
<summary>Click to view screenshots</summary>

### 🏠 Dashboard Overview
![Dashboard](./public/screenshots/dashboard.png)
*Main dashboard with task statistics, charts, and recent activity*

### 📋 Kanban Board
![Kanban Board](./public/screenshots/kanban.png)
*Drag-and-drop task board with custom columns*

### ✅ Task Management
![Tasks](./public/screenshots/tasks.png)
*Task list with filters, bulk actions, and CSV import/export*

### 🐛 Bug Tracker
![Bug Tracker](./public/screenshots/bugs.png)
*Comprehensive bug tracking with severity levels and lifecycle management*

### ⏰ Attendance System
![Attendance](./public/screenshots/attendance.png)
*Clock in/out system with shift tracking and admin dashboard*

### 📊 Reports & Analytics
![Reports](./public/screenshots/reports.png)
*Weekly reports, performance metrics, and team analytics*

</details>

> **Note:** To add your own screenshots, place images in `/public/screenshots/` directory

<p align="right">(<a href="#top">back to top</a>)</p>
![Dashboard](./public/screenshots/dashboard.png)

### Kanban Board
![Kanban Board](./public/screenshots/kanban.png)

### Task Management
![Tasks](./public/screenshots/tasks.png)

### Bug Tracker
![Bug Tracker](./public/screenshots/bugs.png)

*Note: Add screenshots to `/public/screenshots/` directory*

---

## 🔧 Configuration

### Environment Variables

<p align="right">(<a href="#top">back to top</a>)</p>

Required environment variables for production:

```env
# Database (Required)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Authentication (Required)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Application (Required)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Email (Optional - for invitations)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File Upload (Optional)
MAX_FILE_SIZE="104857600"  # 100MB in bytes
```

### Next.js Configuration

Key configurations in `next.config.mjs`:
- **File upload limits:** 100MB for CSV bulk imports
- **Polling mode:** Enabled for OneDrive compatibility
- **Webpack cache:** Disabled in development to prevent file locks

---

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Deployment Platforms

**Recommended platforms:**

1. **[Vercel](https://vercel.com/)** (Easiest - by Next.js creators)
   ```bash
   vercel deploy
<p align="right">(<a href="#top">back to top</a>)</p>

   ```

2. **[Railway](https://railway.app/)** (PostgreSQL included)
   - Connect GitHub repo
   - Add PostgreSQL plugin
   - Set environment variables
   - Deploy

3. **[Render](https://render.com/)** (Free tier available)
   - Create Web Service
   - Link repository
   - Add PostgreSQL database
   - Deploy
<p align="right">(<a href="#top">back to top</a>)</p>


4. **Docker**
   ```dockerfile
   # Dockerfile included in project
   docker build -t pms1 .
   docker run -p 3000:3000 pms1
   ```

### Database Migration

For production, run migrations before deploying:

```bash
# Generate migration files
npm run db:generate

# Apply migrations to production database
DATABASE_URL="your-prod-db-url" npm run db:migrate
```

---

## 🧪 Testing

```bash
# Run tests
npm test

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

<p align="right">(<a href="#top">back to top</a>)</p>

# Run tests in watch mode
npm run test:watch
 & Contributors

<a href="https://github.com/karan-moorthy">
  <img src="https://github.com/karan-moorthy.png?size=50" width="50" height="50" alt="Karan Moorthy" title="Karan Moorthy" style="border-radius: 50%;">
</a>

**Karan Moorthy** - *Creator & Lead Developer* - [@karan-moorthy](https://github.com/karan-moorthy)

### Contributors

<a href="https://github.com/karan-moorthy/PMS1/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=karan-moorthy/PMS1" />
</a>
- All the amazing open-source contributors

<p align="right">(<a href="#top">back to top</a>)</p>

---

## 📞 Support

If you need help or have questions:

- 📖 Check the [Documentation](./docs)
- 💬 Open a [GitHub Discussion](https://github.com/karan-moorthy/PMS1/discussions)
- 🐛 Report bugs via [GitHub Issues](https://github.com/karan-moorthy/PMS1/issues)
- ⭐ Star the repository to show your support!

<p align="right">(<a href="#top">back to top</a>)</p>
---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
<p align="right">(<a href="#top">back to top</a>)</p>

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

<a href="https://github.com/karan-moorthy/PMS1/stargazers">
  <img src="https://img.shields.io/github/stars/karan-moorthy/PMS1?style=social" alt="GitHub stars">
</a>

---

## 📈 GitHub Stats

![GitHub contributors](https://img.shields.io/github/contributors/karan-moorthy/PMS1?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/karan-moorthy/PMS1?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/karan-moorthy/PMS1?style=flat-square)
![GitHub language count](https://img.shields.io/github/languages/count/karan-moorthy/PMS1?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/karan-moorthy/PMS1?style=flat-square)

---

<div align="center">

**Built with ❤️ by [Karan Moorthy](https://github.com/karan-moorthy)**

**Powered by Next.js • TypeScript • PostgreSQL**

<p>
  <a href="#top">⬆️ Back to Top</a>
</p>

### Coding Standards
- Use **TypeScript** for all new code
- Follow **ESLint** rules
- Write **meaningful commit messages**
- Add **comments** for complex logic
- Update **documentation** for new features

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Karan Moorthy** - [@karan-moorthy](https://github.com/karan-moorthy)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Drizzle ORM](https://orm.drizzle.team/) - Database toolkit
- [Hono](https://hono.dev/) - Web framework

---

## 📞 Support

For support, email [support@example.com](mailto:support@example.com) or open an issue on GitHub.

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] **Sprint management** (Scrum methodology)
- [ ] **Time tracking** (Pomodoro timer integration)
- [ ] **Gantt charts** for project timelines
- [ ] **Mobile app** (React Native)
- [ ] **Email notifications** for task updates
- [ ] **Slack/Discord integration**
- [ ] **Advanced reporting** with custom metrics
- [ ] **AI-powered task suggestions**
- [ ] **Video conferencing** integration
- [ ] **File storage** (AWS S3 or similar)

### In Progress
- [x] ~~Dynamic custom fields~~
- [x] ~~Auto end-shift system~~
- [x] ~~Performance optimization~~
- [x] ~~Bug tracking system~~

---

<div align="center">

**Made with ❤️ using Next.js, TypeScript, and PostgreSQL**

⭐ **Star this repository if you find it helpful!** ⭐

</div>
