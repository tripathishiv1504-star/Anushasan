# 03_PROJECT_SPEC.md — Anushasan project specification

**Anushasan: Smart Campus Discipline & Growth Platform**
Tagline: *Consistency, measured. Growth, guided.*

This file is the single source of truth for what the website is. Build exactly this, nothing more.

---

## 1. What the website is

Anushasan is a web platform that helps college students build study discipline and helps mentors and administrators support them. It connects three kinds of users in one system and also works fully for a student studying alone.

**Problem it solves:** a student's daily study effort is invisible. Attendance, marks, and study material live in different places, and mentors find out a student is struggling only after an exam is failed.

**Domain:** Smart Campus Solution (student experience, resource management, attendance, grievances, data-driven administration).

## 2. Fixed technology

React + Vite (JavaScript), `react-router-dom`, plain CSS with variables, `lucide-react`, `recharts`. Mock data first, Supabase in Phase 2. See `02_RULES.md` section 4.

## 3. The exact user flow

```
Landing page (site information)
        |
        v
Sign up or Log in (one simple page)
        |
        v
"Who are you?" screen  -->  three options shown as cards:
        |                      1. Student portal
        |                      2. Mentor portal
        |                      3. Admin authority portal
        |
  +-----+------------------------+--------------------------+
  |                              |                          |
Student portal               Mentor portal            Admin authority portal
  |
  v
Two options shown as cards (NO question text is asked):
  - Join a class
  - Prepare solo
  |
  +-- Join a class --> enter class code --> confirm --> Student dashboard (class mode)
  +-- Prepare solo ---------------------------------> Student dashboard (solo mode)
```

Important details:

- The landing page comes first and explains the site. It is public.
- The sign up / log in page must be simple, clear, and easy to understand.
- After signing in, a user who has not yet chosen a role sees the "Who are you?" screen. A returning user who already has a role goes straight to their portal home.
- On the student mode screen, the two options are **labels on cards**, not a question. Do not write a sentence such as "Do you want to join a class?". Use the card titles "Join a class" and "Prepare solo" with a one-line description each.
- The user can change role or student mode later from the Profile page.
- In this prototype, role selection is a self-selection. A note for Phase 2: mentor and admin roles will need verification (approval or invite code). Do not build verification now.

## 4. Roles and what each can do

### Student, class mode (joined a class)
Dashboard with discipline score, streak, today's study hours, tasks. Study tracker with timer and sessions. Habits and goals. Resource library (class files from the mentor plus personal files). Attendance and timetable view. Grievances (raise and track). Weekly report and achievements. Profile.

### Student, solo mode (prepare solo)
Everything above **except** attendance and grievances, because there is no mentor. The resource library holds only personal uploads. Discipline score uses the solo formula. A "Join a class" button in Profile lets the student switch to class mode.

### Mentor
Create classes and get a join code. Class dashboard showing each student's consistency, attendance, and goal progress. Risk alerts for students whose score is dropping. Upload resources (PDF files: notes, assignments, previous-year question papers) by class and subject. Mark attendance for each session. View and resolve grievances raised by students.

### Admin authority (HOD / admin)
Department setup (mentors and classes). Department analytics rolled up from classes. Grievance overview including escalated issues. Counselling plans for at-risk groups.

## 5. Pages and routes

| Route | Page | Who |
|---|---|---|
| `/` | Landing page | Public |
| `/auth` | Sign up / Log in (`?mode=signup` or `?mode=login`) | Public |
| `/select-role` | Who are you? (3 cards) | Logged in, no role yet |
| `/student/mode` | Join a class / Prepare solo (2 cards) | Student |
| `/student/join-class` | Enter class code | Student |
| `/student/dashboard` | Student dashboard | Student |
| `/student/study` | Study tracker | Student |
| `/student/habits-goals` | Habits and goals | Student |
| `/student/library` | Resource library | Student |
| `/student/attendance` | Attendance and timetable | Student, class mode only |
| `/student/grievances` | Grievances | Student, class mode only |
| `/student/report` | Weekly report and achievements | Student |
| `/student/profile` | Profile and settings | Student |
| `/mentor/classes` | My classes and create class | Mentor |
| `/mentor/classes/:classId` | Class dashboard | Mentor |
| `/mentor/alerts` | Risk alerts | Mentor |
| `/mentor/upload` | Upload resources | Mentor |
| `/mentor/attendance` | Mark attendance | Mentor |
| `/mentor/grievances` | Resolve grievances | Mentor |
| `/mentor/profile` | Profile | Mentor |
| `/admin/setup` | Department setup | Admin |
| `/admin/analytics` | Department analytics | Admin |
| `/admin/grievances` | Grievance overview | Admin |
| `/admin/counselling` | Counselling plans | Admin |
| `/admin/profile` | Profile | Admin |
| `*` | Not found page | Public |

## 6. Landing page content (Step 1)

The landing page must give real information about the site. Sections, in order:

1. **Navbar:** logo, links (About, Features, How it works, Roles), `Log in` button, `Get started` button.
2. **Hero:** headline, one-line supporting text, two buttons (`Get started` goes to `/auth?mode=signup`, `See how it works` scrolls down), and a CSS-built dashboard preview card (no external images).
3. **About / the problem:** short explanation of the problem and the solution, with three small stat-style points.
4. **Features:** grid of 8 cards: Discipline score, Study tracker, Habits and goals, Streaks and badges, Resource library, Attendance, Early-risk alerts, Weekly growth report.
5. **How it works:** three steps: Sign up, Choose your role, Start growing.
6. **Roles:** three cards for Student, Mentor, Admin authority, each with what they get.
7. **Solo mode callout:** a highlighted banner explaining that students can use Anushasan alone, with no mentor needed.
8. **FAQ:** 5 short questions with expandable answers (use native `<details>`).
9. **Final call to action** band.
10. **Footer:** logo, short description, link groups, copyright line.

## 7. Design system

Create these in `src/styles/tokens.css` and use only these.

```
Colors
--color-primary: #0F766E        (teal, main brand)
--color-primary-dark: #115E59
--color-primary-soft: #CCFBF1
--color-accent: #F59E0B         (saffron, highlights, streak)
--color-accent-soft: #FEF3C7
--color-role-student: #0F766E
--color-role-mentor: #4F46E5
--color-role-admin: #BE123C
--color-bg: #F8FAFC
--color-surface: #FFFFFF
--color-text: #0F172A
--color-text-muted: #64748B
--color-border: #E2E8F0
--color-success: #16A34A
--color-warning: #D97706
--color-danger: #DC2626
--color-info: #2563EB

Typography (load from Google Fonts)
--font-heading: "Manrope", sans-serif
--font-body: "Inter", sans-serif
Sizes: 12, 14, 16, 18, 20, 24, 32, 40, 56 px as tokens
Weights: 400 body, 500 labels, 700 headings

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96 px as tokens
Radius: --radius-sm 8px, --radius-md 12px, --radius-lg 20px, --radius-full 999px
Shadows: --shadow-sm, --shadow-md (soft, low opacity)
Breakpoints: 640px (mobile), 1024px (tablet) — mobile-first
Container: max-width 1200px, centered
```

Tone of the UI text: friendly, short, encouraging, never preachy. Student-focused.

## 8. Folder structure (do not add top-level folders)

```
anushasan/
  PROGRESS.md
  index.html
  package.json
  src/
    main.jsx
    App.jsx
    config/
      navigation.js          (sidebar items per role)
    routes/
      routeConfig.js         (ROUTES constants)
      AppRoutes.jsx
      ProtectedRoute.jsx
    context/
      AuthContext.jsx
    services/                (all data access; async; mock now, Supabase later)
      authService.js
      studentService.js
      studyService.js
      habitService.js
      resourceService.js
      attendanceService.js
      grievanceService.js
      mentorService.js
      adminService.js
      scoreService.js
    mock/                    (mock data; only services import from here)
      index.js
      users.js
      classes.js
      ... (added step by step)
    utils/
      storage.js             (the only file that touches localStorage)
      scoring.js             (discipline score logic)
      dates.js
      validators.js
    styles/
      tokens.css
      global.css
    components/
      common/                (Button, Card, Input, Select, Badge, Modal, ProgressBar,
                              LoadingState, EmptyState, ErrorState, Logo, StatCard)
      layout/                (AppShell, Sidebar, Topbar, MobileNav, PublicNavbar, Footer)
    pages/
      public/                (Landing, Auth, SelectRole, NotFound)
      student/
      mentor/
      admin/
```

## 9. Mock data and the service layer

- Pages call services. Services read and write mock data through `src/utils/storage.js`. Pages never import mock files.
- Every service function is `async` and returns the same shape a database call would return.
- Seed mock data so every screen looks real on first load: at least 1 department, 2 mentors, 3 classes, 12 students, 4 weeks of study sessions, tasks, habit logs, 15 resources, attendance for 10 sessions, and 6 grievances in different states.
- Mock login: users are stored in `localStorage` through `storage.js`. Passwords in mock data are plain text **for the prototype only**; Phase 2 replaces this with Supabase Auth.
- Provide two ready demo accounts (shown nowhere in the UI, listed in `PROGRESS.md` notes): one student, one mentor, one admin.

## 10. Data model (use these names for mock data; Phase 2 will use them as tables)

All field names are `snake_case`. Every record has `id` (string) and `created_at` (ISO date string).

| Table | Fields |
|---|---|
| `profiles` | id, full_name, email, role (`student` / `mentor` / `admin`), study_mode (`class` / `solo` / null), department_id, created_at |
| `departments` | id, name, admin_id |
| `classes` | id, name, subject, mentor_id, department_id, join_code (6 characters), created_at |
| `class_members` | id, class_id, student_id, joined_at |
| `study_sessions` | id, student_id, subject, started_at, duration_minutes, notes |
| `tasks` | id, student_id, title, subject, due_date, is_done |
| `habits` | id, student_id, name, icon |
| `habit_logs` | id, habit_id, log_date, is_done |
| `goals` | id, student_id, title, target_date, progress_percent |
| `resources` | id, owner_id, class_id (null if personal), title, subject, type (`notes` / `assignment` / `pyq`), file_name, file_size_kb, is_personal, created_at |
| `attendance_records` | id, class_id, student_id, session_date, status (`present` / `absent` / `late`) |
| `grievances` | id, student_id, class_id, title, description, status (`open` / `in_review` / `resolved` / `escalated`), created_at, resolved_by |
| `badges` | id, code, name, description |
| `student_badges` | id, student_id, badge_id, earned_at |
| `score_snapshots` | id, student_id, week_start, score |

Files (PDFs): in the prototype, store only the file metadata (name, size) and keep the file in memory for the session. In Phase 2 the files move to Supabase Storage.

## 11. Discipline score (0 to 100), computed in `src/utils/scoring.js`

Weekly score from the last 7 days.

**Class mode:**
- Study consistency (days studied out of 7, with at least 30 minutes): 35 points
- Task completion (done tasks out of due tasks): 25 points
- Habit completion (habit logs done out of expected): 20 points
- Attendance (present or late out of sessions): 20 points

**Solo mode** (no attendance): study consistency 40, task completion 30, habit completion 30.

**Risk rule:** a student is **at risk** when the score is below 50, or when it has dropped 15 points or more compared with the previous week.

**Streak:** consecutive days with at least 30 minutes of study, counted back from today.

**Badges (examples):** First session, 7-day streak, 30-day streak, 100 hours studied, Perfect week, Goal achieved.

## 12. Out of scope (do not build)

Real payments, chat or messaging, video calls, AI chatbots, mobile apps, dark mode, email sending, push notifications, social feeds, multi-college support. Do not add them even if they seem helpful.
