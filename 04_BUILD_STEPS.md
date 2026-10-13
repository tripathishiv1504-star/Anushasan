# 04_BUILD_STEPS.md — Step-by-step build plan

Read `02_RULES.md` and `03_PROJECT_SPEC.md` first. Build **one step at a time**, in order. After each step, update `PROGRESS.md`, show the checklist, and STOP until the user says `NEXT`.

Every step has the same layout: **Goal**, **Files**, **Build**, **Acceptance checklist**.

Order overview:

| Phase | Steps |
|---|---|
| Foundation | 0 Setup |
| Public pages | 1 Landing, 2 Sign up / Log in, 3 Who are you? |
| Student entry | 4 Student mode and class code, 5 App shell |
| Student portal | 6 Dashboard, 7 Study tracker, 8 Habits and goals, 9 Resource library, 10 Attendance and grievances, 11 Report and badges, 12 Profile |
| Mentor portal | 13 Classes, 14 Class dashboard and alerts, 15 Upload resources, 16 Attendance marking, 17 Grievances |
| Admin portal | 18 Department setup, 19 Analytics, grievances, counselling |
| Finish | 20 Polish and README |
| Phase 2 | 21 Supabase (only when the user asks) |

---

## Step 0 — Project setup

**Goal:** a clean, empty, running project with the full folder structure, design tokens, shared components, routing skeleton, and auth context.

**Files to create:** everything in the folder structure from `03_PROJECT_SPEC.md` section 8 that is needed for the foundation.

**Build:**
1. Create the project: `npm create vite@latest anushasan -- --template react`, then `npm install react-router-dom lucide-react`.
2. Create `src/styles/tokens.css` with all tokens from spec section 7, and `src/styles/global.css` (reset, body font, headings, container class, focus styles, link styles). Load Manrope and Inter from Google Fonts in `index.html`. Set the page title to "Anushasan".
3. Create shared components in `src/components/common/`, each with its own CSS file: `Button` (variants: primary, secondary, ghost, danger; sizes: sm, md, lg; loading and disabled states), `Card`, `Input` (label, error text, hint, password show/hide option), `Select`, `Badge` (variants: success, warning, danger, info, neutral), `Modal`, `ProgressBar`, `LoadingState`, `EmptyState`, `ErrorState`, `Logo`, `StatCard`.
4. Create `src/routes/routeConfig.js` with a `ROUTES` object containing every route from spec section 5.
5. Create `src/routes/AppRoutes.jsx` with every route pointing at a temporary `PagePlaceholder` component that shows the page name. This is the **only** step allowed to use a placeholder; later steps replace them.
6. Create `src/utils/storage.js` (get, set, remove with JSON handling and a key prefix `anushasan:`), `src/utils/dates.js`, `src/utils/validators.js` (email, password length, required).
7. Create `src/context/AuthContext.jsx` with `user`, `role`, `studyMode`, `isLoading`, and empty functions `login`, `signup`, `logout`, `selectRole`, `selectStudyMode` that will be filled in later steps. Wrap the app in it.
8. Create `src/mock/index.js` (empty export for now) and an empty `src/config/navigation.js`.
9. Create `PROGRESS.md` using the format in `02_RULES.md` section 10, listing Steps 0 to 21.

**Acceptance checklist:**
- [ ] `npm run dev` starts with no errors and `npm run build` passes
- [ ] Every route in the spec opens and shows its placeholder name
- [ ] Unknown URL shows a basic not-found message
- [ ] All shared components exist and can be rendered (temporarily show them on the `/` placeholder to verify, then remove)
- [ ] `tokens.css` contains every token from the spec and no component CSS hard-codes colors
- [ ] `PROGRESS.md` exists

**STOP. Wait for NEXT.**

---

## Step 1 — Landing page

**Goal:** a polished, public, informative landing page at `/`.

**Files to create:** `src/pages/public/Landing.jsx`, `Landing.css`, `src/components/layout/PublicNavbar.jsx` and `.css`, `src/components/layout/Footer.jsx` and `.css`, and small section components in `src/pages/public/landing/` (`Hero`, `About`, `Features`, `HowItWorks`, `RolesSection`, `SoloCallout`, `Faq`, `FinalCta`).
**Files to modify:** `AppRoutes.jsx` (replace the placeholder for `/` only).

**Build:** follow spec section 6 exactly, section by section.
- Navbar is sticky, with a mobile menu button that opens a simple dropdown. Links scroll smoothly to sections by id.
- Hero uses a **CSS-built** dashboard preview card (a streak chip, a score ring made with CSS, and two task rows). No external images.
- Features: 8 cards with lucide icons.
- Roles: 3 cards using the role colors from the tokens.
- FAQ: native `<details>` and `<summary>`, styled.
- Write real copy for every section (headline, supporting text, feature descriptions, FAQ answers). Student-friendly, short.
- `Get started` goes to `/auth?mode=signup`. `Log in` goes to `/auth?mode=login`.

**Acceptance checklist:**
- [ ] All 10 sections from spec section 6 are present in order
- [ ] Navbar links scroll to the right sections; mobile menu opens and closes
- [ ] Both buttons navigate to `/auth` with the correct `mode` query value
- [ ] Looks correct at 375px, 768px, and 1280px with no horizontal scroll
- [ ] No placeholder or lorem text; no external images
- [ ] Build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 2 — Sign up / Log in page

**Goal:** one simple, very clear authentication page at `/auth`.

**Files to create:** `src/pages/public/Auth.jsx`, `Auth.css`, `src/services/authService.js`, `src/mock/users.js`.
**Files to modify:** `src/mock/index.js` (append), `src/context/AuthContext.jsx` (fill `login`, `signup`, `logout`), `AppRoutes.jsx` (`/auth` only).

**Build:**
1. Layout: two columns on desktop. Left: a short brand panel (logo, tagline, three benefit lines). Right: the form card. On mobile only the form card shows, with a small logo above.
2. A two-option switch at the top of the card: **Log in** and **Sign up**. It reads `?mode=` from the URL and updates it when toggled.
3. Log in fields: email, password (with show/hide), a `Log in` button. Sign up fields: full name, email, password, confirm password, a `Create account` button.
4. Validation on submit and on blur: required fields, valid email, password at least 8 characters, passwords match. Show a short error under each field in plain language.
5. `authService` (mock): `signup` rejects an existing email with a clear message; `login` rejects wrong credentials with a clear message. Both return `{ user }`. Store the session through `storage.js`.
6. After success: if the user has no role, go to `/select-role`. If the user already has a role, go to that role's home (`/student/dashboard` if mode set, `/student/mode` if student without mode, `/mentor/classes`, `/admin/analytics`).
7. If an already logged-in user opens `/auth`, redirect them the same way.
8. Seed three demo accounts in `users.js` (one student with role and mode set, one mentor, one admin). Write their emails and passwords in `PROGRESS.md` Notes.

**Acceptance checklist:**
- [ ] Toggling Log in / Sign up works and updates the URL
- [ ] `/auth?mode=signup` opens the sign up form directly
- [ ] All validation messages appear correctly; the form never submits invalid data
- [ ] A new account can be created, then logged in after logout
- [ ] Wrong password and duplicate email show clear messages
- [ ] Redirect rules in points 6 and 7 work for all three demo accounts
- [ ] Simple and uncluttered; readable at 375px, 768px, 1280px
- [ ] Build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 3 — "Who are you?" role selection

**Goal:** the screen where a newly signed-in user picks a portal.

**Files to create:** `src/pages/public/SelectRole.jsx`, `SelectRole.css`, `src/components/common/OptionCard.jsx` and `.css` (reusable selectable card used again in Step 4).
**Files to modify:** `AuthContext.jsx` (fill `selectRole`), `authService.js` (add `saveRole`), `AppRoutes.jsx` (`/select-role` only).

**Build:**
1. Page heading: **"Who are you?"** with one short supporting line. Show the signed-in user's name in a small greeting.
2. Three large `OptionCard`s in a row (stacked on mobile):
   - **Student portal**: icon, one-line description (track study, build habits, use a class or go solo)
   - **Mentor portal**: icon, one-line description (guide classes, share resources, spot students who need help)
   - **Admin authority portal**: icon, one-line description (department view, analytics, support planning)
3. Each card uses its role color from the tokens. Cards are keyboard accessible (they behave as buttons).
4. Clicking a card saves the role and navigates: Student goes to `/student/mode`, Mentor goes to `/mentor/classes`, Admin goes to `/admin/analytics`.
5. Show a small `Log out` link at the bottom so the user is never stuck.
6. The page is only for logged-in users with no role. A logged-in user who already has a role is redirected to their portal home. A logged-out user is redirected to `/auth`.

**Acceptance checklist:**
- [ ] Exactly three cards with the exact titles above
- [ ] Each choice saves the role and lands on the correct route
- [ ] Redirect rules in point 6 work
- [ ] Cards work with mouse, touch, and keyboard (Tab and Enter)
- [ ] Looks correct at all three widths
- [ ] Build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 4 — Student mode and class code

**Goal:** after choosing Student, the student picks **Join a class** or **Prepare solo**.

**Files to create:** `src/pages/student/StudentMode.jsx` and `.css`, `src/pages/student/JoinClass.jsx` and `.css`, `src/mock/classes.js`, `src/services/studentService.js`.
**Files to modify:** `src/mock/index.js` (append), `AuthContext.jsx` (fill `selectStudyMode`), `AppRoutes.jsx` (`/student/mode` and `/student/join-class` only).

**Build:**
1. `/student/mode`: two `OptionCard`s. **No question text anywhere.** Use a plain heading such as "Choose your study mode" and these two cards:
   - **Join a class**: "Connect to your mentor's class and see shared resources and attendance."
   - **Prepare solo**: "Study at your own pace with no mentor needed."
2. **Prepare solo** saves `study_mode = solo` and goes to `/student/dashboard`.
3. **Join a class** goes to `/student/join-class`.
4. `/student/join-class`: a single field for the 6-character class code (auto-uppercase, only letters and numbers). Button `Find class`. On a valid code, show a confirmation card with the class name, subject, and mentor name, plus `Join this class` and `Back` buttons. On an invalid code, show a clear error.
5. `Join this class` saves `study_mode = class`, adds the student to `class_members`, and goes to `/student/dashboard`.
6. Seed 3 classes in `classes.js` with working join codes. List the codes in `PROGRESS.md` Notes.
7. A student who already has a mode skips these screens. Allow the user to reach `/student/mode` again from Profile later.

**Acceptance checklist:**
- [ ] Mode screen has exactly two cards and no question sentence
- [ ] Solo path works and saves the mode
- [ ] Class path: invalid code shows an error, valid code shows the preview, joining saves membership and mode
- [ ] Code field formats input correctly (uppercase, 6 characters max)
- [ ] Looks correct at all three widths
- [ ] Build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 5 — App shell and route protection

**Goal:** the logged-in layout (sidebar, top bar, mobile navigation) and secure routing for all roles.

**Files to create:** `src/components/layout/AppShell.jsx`, `Sidebar.jsx`, `Topbar.jsx`, `MobileNav.jsx` (each with CSS), `src/routes/ProtectedRoute.jsx`.
**Files to modify:** `src/config/navigation.js`, `AppRoutes.jsx` (wrap role routes in the shell), `routeConfig.js` (append only if needed).

**Build:**
1. `navigation.js` defines sidebar items per role from spec section 5. For students, items marked "class mode only" (Attendance, Grievances) appear only when `study_mode = class`.
2. `Sidebar` (desktop): logo, nav items with icons and active state, a small role badge at the bottom. `Topbar`: page title, user avatar with initials and a dropdown (Profile, Log out). `MobileNav`: on screens under 1024px the sidebar becomes a slide-in drawer opened from the top bar.
3. `ProtectedRoute` rules:
   - Logged out: redirect to `/auth`
   - Logged in without a role: redirect to `/select-role`
   - Wrong role for the route: redirect to that user's own portal home
   - Student without a mode: redirect to `/student/mode`
   - Solo student opening a class-mode-only route: redirect to `/student/dashboard`
4. All role pages render inside `AppShell`. Public pages (`/`, `/auth`, `/select-role`, `/student/mode`, `/student/join-class`) do **not** use the shell.
5. Each role page still shows its placeholder for now.

**Acceptance checklist:**
- [ ] Sidebar shows the right items for student (class), student (solo), mentor, admin
- [ ] All five redirect rules in point 3 work (test each with the demo accounts)
- [ ] Mobile drawer opens, closes, and navigates
- [ ] Logout returns to `/`
- [ ] Active link highlighting is correct
- [ ] Build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 6 — Student dashboard

**Goal:** the student's home screen.

**Files to create:** `src/pages/student/Dashboard.jsx` and `.css`, `src/services/scoreService.js`, `src/utils/scoring.js`, `src/mock/studySessions.js`, `src/mock/tasks.js`, small components in `src/components/student/` (`ScoreRing`, `StreakCard`, `TodayTasks`, `WeekChart`).
**Files to modify:** `src/mock/index.js` (append), `AppRoutes.jsx` (`/student/dashboard` only).

**Build:**
1. Greeting with the student's first name and today's date.
2. Row of `StatCard`s: current streak, today's study time, tasks done today, discipline score (with the `ScoreRing`).
3. "Today's tasks" list with checkboxes that update the mock data immediately.
4. "This week" bar chart (recharts) of daily study minutes.
5. Score logic in `scoring.js` follows spec section 11 (both class and solo formulas, risk rule, streak).
6. Solo students must not see any attendance content. Class students see a small attendance percentage card.
7. Seed 4 weeks of study sessions and tasks for the demo students.

**Acceptance checklist:**
- [ ] Numbers come from services and `scoring.js`, not hard-coded
- [ ] Ticking a task updates the list, the count, and the score
- [ ] Class and solo accounts show different content as specified
- [ ] Loading, empty, and error states exist
- [ ] Responsive at all three widths
- [ ] Build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 7 — Study tracker

**Goal:** log study time and manage tasks.

**Files to create:** `src/pages/student/StudyTracker.jsx` and `.css`, `src/services/studyService.js`, `src/components/student/StudyTimer.jsx`, `SessionList.jsx`, `TaskManager.jsx`.
**Files to modify:** `AppRoutes.jsx` (`/student/study` only).

**Build:**
1. **Timer:** choose a subject, then Start, Pause, Resume, Stop and save. Show elapsed time as HH:MM:SS. Also a "Add session manually" form (subject, date, minutes, notes).
2. **Sessions list:** recent sessions grouped by day, with edit and delete.
3. **Tasks:** add, edit, delete, mark done, with subject and due date. Filter tabs: Today, Upcoming, Done.
4. Saving a session or ticking a task updates the dashboard data and the score.
5. Warn before leaving the page while the timer is running.

**Acceptance checklist:**
- [ ] Timer start, pause, resume, stop, and save all work
- [ ] Manual session add, edit, delete work
- [ ] Task add, edit, delete, done, and filters work
- [ ] Data changes appear on the dashboard
- [ ] Validation on every form
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 8 — Habits and goals

**Goal:** daily habit tracking and goal tracking.

**Files to create:** `src/pages/student/HabitsGoals.jsx` and `.css`, `src/services/habitService.js`, `src/mock/habits.js`, `src/components/student/HabitGrid.jsx`, `GoalCard.jsx`.
**Files to modify:** `src/mock/index.js` (append), `AppRoutes.jsx` (`/student/habits-goals` only).

**Build:**
1. **Habits:** add a habit (name and icon from a fixed list: study, exercise, reading, water, sleep). A weekly grid (Mon to Sun) of tick boxes per habit; ticking saves immediately. Show a weekly consistency percentage per habit.
2. **Goals:** add a goal (title, target date), update progress with a slider (0 to 100), mark achieved. Show days remaining. Achieved goals move to a "Completed" list.
3. Habit completion feeds the discipline score.

**Acceptance checklist:**
- [ ] Habit add, delete, and weekly ticking work and persist
- [ ] Goal add, update progress, achieve, delete work and persist
- [ ] Consistency percentages are correct
- [ ] Empty states for no habits and no goals
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 9 — Resource library

**Goal:** browse and download study files.

**Files to create:** `src/pages/student/Library.jsx` and `.css`, `src/services/resourceService.js`, `src/mock/resources.js`, `src/components/common/ResourceCard.jsx`, `FileUpload.jsx` (reusable; used again in Step 15).
**Files to modify:** `src/mock/index.js` (append), `AppRoutes.jsx` (`/student/library` only).

**Build:**
1. Two tabs: **Class resources** (class mode only, files uploaded by the mentor) and **My files** (personal uploads). Solo students see only **My files**.
2. Filters: subject, type (notes, assignment, PYQ), and a search box. Sort by newest.
3. `ResourceCard`: title, subject, type badge, file size, date, uploader name, and `Open` and `Download` buttons (in the prototype, download triggers a generated sample PDF blob so the button really works).
4. Personal upload: `FileUpload` accepts PDF only, maximum 10 MB, with drag and drop and clear errors. Choose subject and type, then save. Allow delete of personal files.

**Acceptance checklist:**
- [ ] Tabs behave correctly for class and solo students
- [ ] Filters, search, and sort work together
- [ ] Upload rejects non-PDF and files over 10 MB with clear messages
- [ ] Upload, open, download, and delete work
- [ ] Empty states are friendly
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 10 — Attendance and grievances (class mode only)

**Goal:** the two class-only student pages.

**Files to create:** `src/pages/student/Attendance.jsx` and `.css`, `src/pages/student/Grievances.jsx` and `.css`, `src/services/attendanceService.js`, `src/services/grievanceService.js`, `src/mock/attendance.js`, `src/mock/grievances.js`, a simple `src/components/student/AttendanceCalendar.jsx`.
**Files to modify:** `src/mock/index.js` (append), `AppRoutes.jsx` (`/student/attendance`, `/student/grievances` only).

**Build:**
1. **Attendance:** overall percentage, a month calendar showing present, absent, and late days with a legend (color plus text), and a table of recent sessions. Include a short timetable list (weekly schedule from the class). Warn visibly if attendance is below 75%.
2. **Grievances:** a form (title, category, description) to raise a grievance, and a list of the student's grievances with status badges (open, in review, resolved, escalated) and the mentor's reply when present. Click a row to see details.
3. Both pages are blocked for solo students by route protection (already built in Step 5).

**Acceptance checklist:**
- [ ] Attendance numbers match the mock records
- [ ] Calendar and legend work; low attendance warning shows when below 75%
- [ ] Grievance can be raised, appears in the list as `open`, and shows details
- [ ] Solo account cannot reach either page
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 11 — Weekly report and achievements

**Goal:** insights and motivation.

**Files to create:** `src/pages/student/Report.jsx` and `.css`, `src/mock/badges.js`, `src/components/student/WeeklySummary.jsx`, `BadgeGrid.jsx`.
**Files to modify:** `src/mock/index.js` (append), `scoreService.js` (add weekly summary and badge checks), `AppRoutes.jsx` (`/student/report` only).

**Build:**
1. **Weekly report:** score this week vs last week (with up or down change), total study hours, tasks completed, habit consistency, and three plain-language insights generated by simple rules (for example "You studied 5 of 7 days", "Your best day was Wednesday", "Attendance was below 75% this week" only for class mode).
2. A score trend line chart for the last 8 weeks (recharts).
3. **Achievements:** a grid of badges (earned in color, locked in gray with the condition shown). Compute earned badges from real mock data using the examples in spec section 11.

**Acceptance checklist:**
- [ ] All values are computed from services, not hard-coded
- [ ] Insights change when the data changes
- [ ] Earned and locked badges display correctly
- [ ] Solo accounts show no attendance information
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 12 — Student profile and settings

**Goal:** account management and mode switching.

**Files to create:** `src/pages/student/Profile.jsx` and `.css`.
**Files to modify:** `studentService.js` (profile update, leave class), `AppRoutes.jsx` (`/student/profile` only).

**Build:**
1. Edit full name and daily study goal (minutes). Email is shown but read-only.
2. **Study mode panel:** shows the current mode. Solo students get a `Join a class` button (goes to `/student/join-class`). Class students get a `Switch to solo` button with a confirmation modal; leaving the class keeps their personal data.
3. Change password form (mock).
4. `Log out` and a `Delete account` button with a confirmation modal (removes the mock user and their data).

**Acceptance checklist:**
- [ ] Profile edits save and show on the dashboard greeting
- [ ] Mode switching works both ways and updates the sidebar immediately
- [ ] Confirmation modals work (confirm and cancel)
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 13 — Mentor: classes

**Goal:** mentor can create and manage classes.

**Files to create:** `src/pages/mentor/Classes.jsx` and `.css`, `src/services/mentorService.js`, `src/components/mentor/ClassCard.jsx`, `CreateClassModal.jsx`.
**Files to modify:** `AppRoutes.jsx` (`/mentor/classes`, `/mentor/profile`), `src/pages/mentor/MentorProfile.jsx` (create, simple edit-name page).

**Build:**
1. Grid of the mentor's classes with name, subject, student count, and the join code with a `Copy code` button.
2. `Create class` modal: name and subject. A unique 6-character code is generated.
3. Each card links to `/mentor/classes/:classId`. Allow rename and delete (with confirmation) from a card menu.
4. Mentor profile page: edit name, change password, log out.

**Acceptance checklist:**
- [ ] Class creation generates a unique working code (a student can join with it)
- [ ] Copy code works and confirms
- [ ] Rename and delete work with confirmation
- [ ] Empty state for a mentor with no classes
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 14 — Mentor: class dashboard and risk alerts

**Goal:** see how every student in a class is doing.

**Files to create:** `src/pages/mentor/ClassDashboard.jsx` and `.css`, `src/pages/mentor/Alerts.jsx` and `.css`, `src/components/mentor/StudentTable.jsx`, `RiskBadge.jsx`.
**Files to modify:** `mentorService.js` (class overview, student detail, alerts), `AppRoutes.jsx` (`/mentor/classes/:classId`, `/mentor/alerts`).

**Build:**
1. **Class dashboard:** summary stats (average score, students at risk, average attendance, goals on track), a sortable and searchable student table (name, score, streak, attendance, risk badge), and a class score distribution chart.
2. Clicking a student opens a side panel with their weekly score trend, study hours, task completion, and attendance. Mentors see summary data only, not private notes.
3. **Alerts page:** all at-risk students across the mentor's classes using the risk rule in spec section 11, with the reason (for example "Score 42, down 18 points") and actions `Mark as contacted` and `Dismiss`.
4. Show an alert count badge in the sidebar for the Alerts item.

**Acceptance checklist:**
- [ ] Table sorts and searches correctly
- [ ] Risk badges and alerts follow the risk rule exactly
- [ ] Student side panel opens and closes
- [ ] Contacted and dismissed alerts update the list and the sidebar count
- [ ] Responsive (table scrolls inside its own container on mobile), build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 15 — Mentor: upload resources

**Goal:** mentors share PDFs with a class.

**Files to create:** `src/pages/mentor/UploadResources.jsx` and `.css`.
**Files to modify:** `resourceService.js` (mentor upload, list, delete), `AppRoutes.jsx` (`/mentor/upload`).

**Build:**
1. Upload form: choose class, subject, type (notes, assignment, PYQ), title, optional description and due date (for assignments), and the PDF using the reusable `FileUpload` (PDF only, max 10 MB, multiple files allowed).
2. Below the form, a table of the mentor's uploaded resources with class, subject, type, date, and a `Delete` action with confirmation.
3. Uploaded files must appear instantly in the Class resources tab for students in that class (Step 9).

**Acceptance checklist:**
- [ ] Validation for every field and file rule
- [ ] Multiple uploads work; each becomes its own resource
- [ ] A student in that class sees the new file; a student in another class does not
- [ ] Delete removes it for everyone
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 16 — Mentor: attendance marking

**Goal:** record attendance for each session.

**Files to create:** `src/pages/mentor/MarkAttendance.jsx` and `.css`.
**Files to modify:** `attendanceService.js` (create session, save records, edit past session), `AppRoutes.jsx` (`/mentor/attendance`).

**Build:**
1. Choose a class and a date. Show the student list with a three-way toggle per student (present, absent, late) and a `Mark all present` shortcut.
2. `Save attendance` stores records. Reopening the same class and date loads and edits the existing record instead of creating a duplicate.
3. A history list of past sessions with the attendance percentage for each.
4. Saved attendance appears on each student's Attendance page and affects their score.

**Acceptance checklist:**
- [ ] No duplicate sessions for the same class and date
- [ ] Editing a past session works
- [ ] Student pages and scores update after saving
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 17 — Mentor: grievances

**Goal:** mentors handle student issues.

**Files to create:** `src/pages/mentor/Grievances.jsx` and `.css`.
**Files to modify:** `grievanceService.js` (list by mentor, update status, add reply, escalate), `AppRoutes.jsx` (`/mentor/grievances`).

**Build:**
1. List of grievances from the mentor's classes with filters by status and class.
2. Detail view: student, class, description, status history, and actions: `Move to in review`, `Reply`, `Mark resolved`, `Escalate to admin`.
3. Replies and status changes are visible on the student's Grievances page (Step 10).

**Acceptance checklist:**
- [ ] All four status changes work and persist
- [ ] Reply appears for the student
- [ ] Escalated grievances appear for the admin later (verify the data is stored with status `escalated`)
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 18 — Admin: department setup

**Goal:** admin manages mentors and classes.

**Files to create:** `src/pages/admin/DepartmentSetup.jsx` and `.css`, `src/pages/admin/AdminProfile.jsx`, `src/services/adminService.js`, `src/mock/departments.js`.
**Files to modify:** `src/mock/index.js` (append), `AppRoutes.jsx` (`/admin/setup`, `/admin/profile`).

**Build:**
1. Department name editor.
2. Mentors table: name, email, number of classes, with `Add mentor` (name and email) and `Remove` (confirmation).
3. Classes table across the department with mentor, subject, and student count, plus `Reassign mentor`.
4. Admin profile page: edit name, change password, log out.

**Acceptance checklist:**
- [ ] Add, remove, and reassign work and persist
- [ ] Counts update correctly
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 19 — Admin: analytics, grievances, counselling

**Goal:** the department-level views.

**Files to create:** `src/pages/admin/Analytics.jsx`, `AdminGrievances.jsx`, `Counselling.jsx` (each with CSS), `src/components/admin/DeptChart.jsx`.
**Files to modify:** `adminService.js`, `AppRoutes.jsx` (`/admin/analytics`, `/admin/grievances`, `/admin/counselling`).

**Build:**
1. **Analytics:** summary cards (total students, average discipline score, at-risk count, average attendance), a class comparison bar chart, and an 8-week score trend for the department. Filter by class.
2. **Grievances:** all escalated and open grievances with status counts, and actions to reply and resolve.
3. **Counselling:** a list of at-risk students grouped by class. Create a counselling plan (students, date, notes, assigned mentor or counsellor) and track its status (planned, in progress, completed).

**Acceptance checklist:**
- [ ] Analytics are computed from the same data the mentors and students use
- [ ] Filters work
- [ ] Escalated grievances from Step 17 appear and can be resolved
- [ ] Counselling plans can be created, updated, and completed
- [ ] Responsive, build passes, console clean

**STOP. Wait for NEXT.**

---

## Step 20 — Polish and README

**Goal:** make the whole site consistent and ready to present.

**Build:**
1. Walk through all three roles with the demo accounts and fix visual inconsistencies (spacing, heading sizes, button styles).
2. Check every page for loading, empty, and error states, and for keyboard access and focus order.
3. Make sure no page has a console warning, no dead link, and no placeholder text.
4. Write `README.md`: what the project is, how to run it, demo accounts, folder structure, and a clear note that data is mock for now.
5. Final `npm run build` and `npm run lint`.

**Acceptance checklist:**
- [ ] All routes tested for all roles
- [ ] No console warnings or errors anywhere
- [ ] `README.md` written
- [ ] `PROGRESS.md` shows Steps 0 to 20 complete

**STOP. Wait for the user.**

---

## Step 21 — Phase 2: Supabase (ONLY when the user explicitly asks)

Do not start this step on `NEXT`. The user must write "start Phase 2". The user may also do this part personally.

**Plan, to be done in this order, one sub-step at a time with a STOP after each:**
1. **21a Setup:** install `@supabase/supabase-js`, create `src/lib/supabaseClient.js` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`, add `.env.example`.
2. **21b Database:** write one SQL file with all tables from spec section 10 (UUID keys, foreign keys, indexes, `created_at` defaults) for the user to run in the Supabase SQL editor.
3. **21c Security:** write Row Level Security policies: students see only their own rows and their class's resources; mentors see only their own classes and those classes' students; admins see their department. Verify with test queries.
4. **21d Auth:** replace the mock `authService` with Supabase Auth and a `profiles` row created at signup. Add verification for mentor and admin roles (invite code or admin approval).
5. **21e Storage:** create buckets for resource PDFs with access rules; replace the mock file handling.
6. **21f Services:** replace mock service internals one file at a time. Function names and return shapes must not change, so no page needs editing.
7. **21g Cleanup:** remove `src/mock/` and `storage.js` data usage, update the README.

**Rule for Phase 2:** the pages must not change. Only files in `src/services/`, `src/lib/`, and `src/context/AuthContext.jsx` may be edited.
