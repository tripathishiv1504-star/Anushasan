# Anushasan (अनुशासन)
### Smart Campus Discipline & Growth Platform

> **Empowering students with personalized discipline habits, faculty with early-risk intervention telemetry, and campus leadership with department-wide academic intelligence.**

---

## Overview

**Anushasan** is an institutional web platform developed for modern colleges and universities. Traditional campus management software tracks grades and attendance in isolated silos, often discovering academic distress too late. Anushasan solves this through a unified tripartite ecosystem:

1. **Student Growth & Discipline:** Gamified daily study trackers, consistency streaks, milestone badges, digital course material access, attendance monitoring, and confidential grievance redressal.
2. **Faculty Mentorship & Risk Detection:** Automated early warning triggers flagging students falling behind (Discipline Score < 50 or steep drop $\ge$ 15 points), bulk resource publishing, attendance session recording with zero-duplicate protection, and grievance workflows.
3. **Departmental Administration:** Dynamic cross-classroom discipline analytics, 8-week trajectory benchmarking, faculty mentor roster management with class reassignment safety, grievance escalation resolution, and structured student counselling plans.

---

## Architecture: Dual-Mode Engine (Prototype & Supabase Production)

Anushasan features an **adaptive dual-mode backend architecture**:

- **Mode A: Local Prototype & Demo Mode (Zero Config):** Works instantly out of the box with zero database setup. All authentication, study data, habits, attendance, and grievances are managed locally in the browser via scoped `localStorage` with realistic asynchronous network simulation.
- **Mode B: Live Supabase Production Mode:** Once you configure your Supabase URL and Anon key in `.env`, the entire application automatically switches to live Supabase Auth, PostgreSQL tables with Row Level Security (RLS), and Supabase Storage for PDF course materials—without touching a single UI component!

---

## Demo Accounts (Instant Testing)

All portals and workflows can be explored immediately without external database configuration:

| Role | Portal / Study Mode | Email Address | Password | Landing Route |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Class Mode (Aarav Sharma) | `student@campus.edu` | `Password123` | `/student/dashboard` |
| **Student** | Solo Self-Study (Priya Patel) | `solo@campus.edu` | `Password123` | `/student/dashboard` |
| **Faculty Mentor** | CS Systems (Prof. Rajesh Verma) | `mentor@campus.edu` | `Password123` | `/mentor/classes` |
| **Faculty Mentor** | DBMS (Dr. Kavita Raman) | `kavita.raman@campus.edu` | `Password123` | `/mentor/classes` |
| **Faculty Mentor** | Algorithms (Prof. Alok Nath) | `alok.nath@campus.edu` | `Password123` | `/mentor/classes` |
| **Administrator** | Department Head (Dr. Sunita Rao) | `admin@campus.edu` | `Password123` | `/admin/analytics` |

> **1-Click Demo Logins:** On the `/auth` page, quick 1-click test chips allow you to sign in instantly as Mentor, Student, or Admin with zero typing.
>
> **Direct Role Login Entrypoints:** The landing page role cards feature dedicated "Log in as Mentor", "Log in as Student", and "Log in as Admin" buttons.
>
> **New Signups:** Registering any new account via `/auth` automatically guides the user to `/select-role` to choose their institutional persona.
>
> **Elevated Role Verification Codes:**
> - Faculty Mentor Role: `CAMPUS_FACULTY_2026`
> - Department Admin Role: `CAMPUS_ADMIN_2026`
>
> **Working Class Join Codes for Review:**
> - `CS301A` — Operating Systems & Architecture (Mentor: Prof. Rajesh Verma)
> - `DS201B` — Data Structures & Algorithms (Mentor: Prof. Rajesh Verma)
> - `DB202K` — Database Management Systems (Mentor: Dr. Kavita Raman)
> - `AI401C` — Machine Learning Foundations (Mentor: Dr. Sunita Rao)

---

## Feature Matrix

### 1. Student Portal (`/student/*`)
- **Dynamic Discipline Score (0–100):** Weighted algorithm evaluating daily study goal consistency (35% class / 40% solo), attendance rate (20% class / omitted solo), task completion (25% class / 30% solo), and habit completion (20% class / 30% solo).
- **Focus Study Tracker:** Interactive Pomodoro & continuous stopwatch with subject tags, session duration logging, and daily milestone tracking.
- **Habits & Goals:** Daily habit checklist with weekly Monday–Sunday grid, target completion deadlines, and habit creation modals.
- **Resource Library:** Searchable, filterable repository of lecture notes, assignment PDFs, and previous year question papers (PYQs).
- **Attendance & Timetable:** Section attendance rate percentage, minimum 75% policy indicator, and calendar view (hidden in Solo Mode).
- **Grievance Redressal:** Submit confidential academic or administrative issues; track audit timeline progression and mentor/admin replies.
- **Weekly Growth Report & Badges:** 8-week performance trend chart, personalized dynamic insights, and 8 gamified milestone badges.
- **Study Mode Toggle:** Seamlessly switch between Class Mode and Solo Mode from the student profile.

### 2. Faculty Mentor Portal (`/mentor/*`)
- **Class Management:** Create courses with auto-generated unique 6-character join codes, course renaming, and class deletion.
- **Early-Risk Alerts:** Automated rule engine flagging students with score < 50 or drop $\ge$ 15 points; mark as contacted or dismiss with audit logging.
- **Student Telemetry Drawer:** Inspect individual student streak, attendance, study hours, and 8-week trend while preserving personal notes privacy.
- **Batch Resource Upload:** Multi-file drag-and-drop PDF publisher with category tags (`Notes`, `Assignment`, `PYQ`) and due dates, uploading directly to Supabase Storage.
- **Attendance Marking:** Session selector with date picker, quick "Mark all present/absent" shortcuts, and strict duplicate-prevention logic.
- **Grievance Resolution:** 4-state workflow (`Open`, `In Review`, `Resolved`, `Escalated to Admin`) with response composer and escalation forwarding.

### 3. Department Administration Portal (`/admin/*`)
- **Department Administration & Setup:** Edit department name, uppercase code, and scope; manage faculty mentor roster with class handover protection.
- **Course Reassignment:** One-click reassignment of course sections between instructors with cross-portal event synchronization.
- **Department Analytics:** Cross-classroom score comparison bar charts, 8-week departmental score trajectories with passing benchmark (50 pts), and discipline score distribution bands.
- **Grievance Oversight:** Prioritized inbox for escalated disputes from mentors; formal administrative resolution composer with audit logging.
- **Academic Counselling:** Flagged student rosters grouped by section; create and manage intervention recovery plans across `Planned`, `In Progress`, and `Completed` states.

---

## Technology Stack

- **Framework:** React 18 with Vite
- **Routing:** React Router v6 (25 routes with role-based `<ProtectedRoute>`, `<AppShell>`, and browser history preservation)
- **Error Handling & Resilience:** Application-wide `<ErrorBoundary>` for crash isolation and polymorphic icon rendering
- **Icons:** Lucide React
- **Visualization:** Zero-dependency SVG Charting Engine (`RechartsShim.jsx`)
- **Styling:** Vanilla CSS with custom Design System tokens (`src/styles/tokens.css`, `src/styles/global.css`)
- **Backend / Database (Phase 2):** Supabase (`@supabase/supabase-js`)
  - PostgreSQL 15 schema with 16 relational tables
  - Row Level Security (RLS) policies for student, mentor, and admin isolation
  - Supabase Storage bucket for resource PDF uploads
  - Automatic `auth.users` -> `public.profiles` signup trigger

---

## Project Structure

```
Anushasan/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── PROGRESS.md
├── .env.example                     # Environment template for Supabase credentials
├── supabase/
│   ├── schema.sql                   # 16 PostgreSQL tables, UUIDs, FKs, indexes & trigger
│   ├── policies.sql                 # Row Level Security (RLS) policies & test queries
│   └── storage.sql                  # Resources PDF bucket configuration & storage RLS
└── src/
    ├── main.jsx
    ├── context/
    │   └── AuthContext.jsx          # Session state, role detection, Supabase auth listener
    ├── config/
    │   └── navigation.js            # Role-specific sidebar configuration
    ├── routes/
    │   ├── routeConfig.js           # Centralized route constants
    │   ├── ProtectedRoute.jsx       # Role and study mode access guards
    │   └── AppRoutes.jsx            # Application route tree (25 routes)
    ├── lib/
    │   ├── supabaseClient.js        # Supabase client with isSupabaseConfigured flag
    │   └── storageClient.js         # Supabase Storage PDF upload and URL utilities
    ├── styles/
    │   ├── tokens.css               # Design tokens (colors, typography, spacing, shadows)
    │   └── global.css               # Reset, typography utilities, animations
    ├── components/
    │   ├── common/                  # Shared UI components (ErrorBoundary, Button, Modal, etc.)
    │   ├── layout/                  # Shell, Topbar, Sidebar, MobileNav, Footer
    │   ├── student/                 # Student widgets (ScoreRing, HabitGrid, WeekChart)
    │   ├── mentor/                  # Mentor widgets (StudentTable, RiskBadge, Drawer)
    │   └── admin/                   # Admin widgets (DeptChart SVG component)
    ├── pages/
    │   ├── public/                  # Landing, Auth, SelectRole
    │   ├── student/                 # 8 Student portal views
    │   ├── mentor/                  # 7 Faculty mentor portal views
    │   └── admin/                   # 5 Department admin views
    ├── mock/                        # Mock seed fixtures & fallback demo data
    ├── services/                    # Dual-mode async service abstraction layer
    │   ├── authService.js           # Supabase Auth / profile sync
    │   ├── studyService.js          # Study sessions & tasks
    │   ├── habitService.js          # Habits, logs & goals
    │   ├── scoreService.js          # Discipline scoring & reports
    │   ├── resourceService.js       # PDF resources & upload
    │   ├── attendanceService.js     # Class attendance & schedules
    │   ├── grievanceService.js      # Student grievances & replies
    │   ├── studentService.js        # Classes, enrollment, solo mode
    │   ├── mentorService.js         # Mentor courses & risk telemetry
    │   └── adminService.js          # Department analytics & counselling
    └── utils/
        ├── storage.js               # Scoped localStorage wrapper ('anushasan:' prefix)
        ├── scoring.js               # Discipline Score calculation algorithms
        └── dates.js                 # Academic date, streak, and time formatters
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/anushasan.git

# Navigate into project directory
cd anushasan

# Install dependencies
npm install
```

### 3. Running Locally in Prototype / Demo Mode
```bash
# Start development server
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**. You can immediately log in with any demo account listed above.

---

## Phase 2: Connecting to Live Supabase Backend

To connect the application to your own live Supabase project:

### Step 1: Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings > API**, copy the **Project URL** and the **anon public key**.

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Run Database Schema Script
1. Open the **SQL Editor** in your Supabase dashboard.
2. Paste and run the contents of [`supabase/schema.sql`](file:///d:/Anushasan/supabase/schema.sql).
   - Creates all 16 relational tables with UUIDs, foreign key cascades, and performance indexes.
   - Registers the `handle_new_user()` trigger for automated user profile sync.
   - Seeds badge catalog rows.

### Step 4: Run Security & Row Level Security Policies
1. In the Supabase **SQL Editor**, paste and run [`supabase/policies.sql`](file:///d:/Anushasan/supabase/policies.sql).
   - Enables RLS across all 16 tables.
   - Configures role-based access for students, mentors, and administrators.

### Step 5: Run Storage Bucket Script
1. In the Supabase **SQL Editor**, paste and run [`supabase/storage.sql`](file:///d:/Anushasan/supabase/storage.sql).
   - Creates the `resources` storage bucket with a 10 MB limit and PDF MIME restriction.
   - Configures storage RLS policies for campus members.

### Step 6: Start the App
```bash
npm run dev
```
The application will detect the Supabase configuration and automatically route authentication and data operations through your live backend.

---

## Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## License

This project is developed for educational and hackathon demonstration purposes.
