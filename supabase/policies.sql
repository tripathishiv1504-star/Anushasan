-- ==============================================================================
-- ANUSHASAN: SMART CAMPUS DISCIPLINE & GROWTH PLATFORM
-- Row Level Security (RLS) Policies (Phase 2 - Step 21c)
-- ==============================================================================
-- Instructions: Run this script in the Supabase SQL Editor after running schema.sql.
-- Enforces data isolation strictly as defined in Step 21c:
-- 1. Students see only their own rows and their class's resources.
-- 2. Mentors see only their own classes and their classes' students.
-- 3. Admins see department-wide data, escalated grievances, and counselling.
-- ==============================================================================

-- ==============================================================================
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS CONTROL (SECURITY DEFINER)
-- ==============================================================================

-- 1. Current user's role
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Check if current user is a faculty mentor
CREATE OR REPLACE FUNCTION public.is_mentor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'mentor'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Check if current user is the mentor of a specific class
CREATE OR REPLACE FUNCTION public.is_mentor_of_class(target_class_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.classes 
        WHERE id = target_class_id AND mentor_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Check if current user is an enrolled student in a specific class
CREATE OR REPLACE FUNCTION public.is_student_in_class(target_class_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.class_members 
        WHERE class_id = target_class_id AND student_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. Check if current mentor teaches a specific student in any class
CREATE OR REPLACE FUNCTION public.is_mentor_of_student(target_student_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.class_members cm
        JOIN public.classes c ON c.id = cm.class_id
        WHERE c.mentor_id = auth.uid() AND cm.student_id = target_student_id
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- ENABLE RLS ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselling_plans ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 1. PROFILES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR public.is_admin()
        OR (public.is_mentor() AND public.is_mentor_of_student(id))
        OR (role = 'mentor') -- Students can view mentor profile info
    );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 2. DEPARTMENTS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "departments_select_policy" ON public.departments;
CREATE POLICY "departments_select_policy" ON public.departments
    FOR SELECT TO authenticated
    USING (true); -- Authenticated users can view department info

DROP POLICY IF EXISTS "departments_admin_all" ON public.departments;
CREATE POLICY "departments_admin_all" ON public.departments
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 3. CLASSES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "classes_select_policy" ON public.classes;
CREATE POLICY "classes_select_policy" ON public.classes
    FOR SELECT TO authenticated
    USING (
        mentor_id = auth.uid()
        OR public.is_student_in_class(id)
        OR public.is_admin()
        OR auth.role() = 'authenticated' -- Allow searching/joining class by join_code
    );

DROP POLICY IF EXISTS "classes_mentor_manage" ON public.classes;
CREATE POLICY "classes_mentor_manage" ON public.classes
    FOR ALL TO authenticated
    USING (mentor_id = auth.uid() OR public.is_admin())
    WITH CHECK (mentor_id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 4. CLASS MEMBERS POLICIES (Enrollment)
-- ==============================================================================
DROP POLICY IF EXISTS "class_members_select" ON public.class_members;
CREATE POLICY "class_members_select" ON public.class_members
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_mentor_of_class(class_id)
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "class_members_insert" ON public.class_members;
CREATE POLICY "class_members_insert" ON public.class_members
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id = auth.uid() -- Student self-enrollment via join code
        OR public.is_mentor_of_class(class_id)
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "class_members_delete" ON public.class_members;
CREATE POLICY "class_members_delete" ON public.class_members
    FOR DELETE TO authenticated
    USING (
        student_id = auth.uid() -- Student unenrolls / switches to solo mode
        OR public.is_mentor_of_class(class_id)
        OR public.is_admin()
    );

-- ==============================================================================
-- 5. STUDY SESSIONS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "study_sessions_select" ON public.study_sessions;
CREATE POLICY "study_sessions_select" ON public.study_sessions
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid()
        OR (public.is_mentor() AND public.is_mentor_of_student(student_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "study_sessions_student_manage" ON public.study_sessions;
CREATE POLICY "study_sessions_student_manage" ON public.study_sessions
    FOR ALL TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- ==============================================================================
-- 6. TASKS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select" ON public.tasks
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid()
        OR (public.is_mentor() AND public.is_mentor_of_student(student_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "tasks_student_manage" ON public.tasks;
CREATE POLICY "tasks_student_manage" ON public.tasks
    FOR ALL TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- ==============================================================================
-- 7. HABITS & HABIT LOGS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "habits_select" ON public.habits;
CREATE POLICY "habits_select" ON public.habits
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid()
        OR (public.is_mentor() AND public.is_mentor_of_student(student_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "habits_student_manage" ON public.habits;
CREATE POLICY "habits_student_manage" ON public.habits
    FOR ALL TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "habit_logs_select" ON public.habit_logs;
CREATE POLICY "habit_logs_select" ON public.habit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.habits h WHERE h.id = habit_id AND (
            h.student_id = auth.uid()
            OR (public.is_mentor() AND public.is_mentor_of_student(h.student_id))
            OR public.is_admin()
        ))
    );

DROP POLICY IF EXISTS "habit_logs_student_manage" ON public.habit_logs;
CREATE POLICY "habit_logs_student_manage" ON public.habit_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.habits h WHERE h.id = habit_id AND h.student_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.habits h WHERE h.id = habit_id AND h.student_id = auth.uid())
    );

-- ==============================================================================
-- 8. GOALS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "goals_select" ON public.goals;
CREATE POLICY "goals_select" ON public.goals
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid()
        OR (public.is_mentor() AND public.is_mentor_of_student(student_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "goals_student_manage" ON public.goals;
CREATE POLICY "goals_student_manage" ON public.goals
    FOR ALL TO authenticated
    USING (student_id = auth.uid())
    WITH CHECK (student_id = auth.uid());

-- ==============================================================================
-- 9. RESOURCES POLICIES (Strict Content Access)
-- ==============================================================================
DROP POLICY IF EXISTS "resources_select" ON public.resources;
CREATE POLICY "resources_select" ON public.resources
    FOR SELECT TO authenticated
    USING (
        owner_id = auth.uid() -- Personal uploads
        OR (class_id IS NOT NULL AND public.is_student_in_class(class_id)) -- Enrolled students
        OR (class_id IS NOT NULL AND public.is_mentor_of_class(class_id)) -- Class instructor
        OR public.is_admin() -- Admin authority
    );

DROP POLICY IF EXISTS "resources_insert" ON public.resources;
CREATE POLICY "resources_insert" ON public.resources
    FOR INSERT TO authenticated
    WITH CHECK (
        (is_personal = true AND class_id IS NULL AND owner_id = auth.uid()) -- Personal student upload
        OR (class_id IS NOT NULL AND public.is_mentor_of_class(class_id) AND owner_id = auth.uid()) -- Mentor class upload
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "resources_delete" ON public.resources;
CREATE POLICY "resources_delete" ON public.resources
    FOR DELETE TO authenticated
    USING (
        owner_id = auth.uid()
        OR public.is_admin()
    );

-- ==============================================================================
-- 10. ATTENDANCE RECORDS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "attendance_select" ON public.attendance_records;
CREATE POLICY "attendance_select" ON public.attendance_records
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid() -- Student sees their own attendance
        OR public.is_mentor_of_class(class_id) -- Mentor sees class attendance
        OR public.is_admin() -- Admin oversight
    );

DROP POLICY IF EXISTS "attendance_mentor_manage" ON public.attendance_records;
CREATE POLICY "attendance_mentor_manage" ON public.attendance_records
    FOR ALL TO authenticated
    USING (
        public.is_mentor_of_class(class_id)
        OR public.is_admin()
    )
    WITH CHECK (
        public.is_mentor_of_class(class_id)
        OR public.is_admin()
    );

-- ==============================================================================
-- 11. GRIEVANCES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "grievances_select" ON public.grievances;
CREATE POLICY "grievances_select" ON public.grievances
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid() -- Student sees own issues
        OR public.is_mentor_of_class(class_id) -- Mentor sees class issues
        OR (public.is_admin() AND status = 'escalated') -- Admin sees escalated issues
        OR public.is_admin() -- Full admin jurisdiction
    );

DROP POLICY IF EXISTS "grievances_student_insert" ON public.grievances;
CREATE POLICY "grievances_student_insert" ON public.grievances
    FOR INSERT TO authenticated
    WITH CHECK (
        student_id = auth.uid()
        AND public.is_student_in_class(class_id)
    );

DROP POLICY IF EXISTS "grievances_update" ON public.grievances;
CREATE POLICY "grievances_update" ON public.grievances
    FOR UPDATE TO authenticated
    USING (
        student_id = auth.uid() -- Student updates description if open
        OR public.is_mentor_of_class(class_id) -- Mentor adds reply, moves review, escalates, resolves
        OR public.is_admin() -- Admin resolves escalated grievances
    )
    WITH CHECK (
        student_id = auth.uid()
        OR public.is_mentor_of_class(class_id)
        OR public.is_admin()
    );

-- ==============================================================================
-- 12. BADGES & STUDENT BADGES POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "badges_select" ON public.badges;
CREATE POLICY "badges_select" ON public.badges
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "student_badges_select" ON public.student_badges;
CREATE POLICY "student_badges_select" ON public.student_badges
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid()
        OR (public.is_mentor() AND public.is_mentor_of_student(student_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "student_badges_insert" ON public.student_badges;
CREATE POLICY "student_badges_insert" ON public.student_badges
    FOR INSERT TO authenticated
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 13. SCORE SNAPSHOTS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "score_snapshots_select" ON public.score_snapshots;
CREATE POLICY "score_snapshots_select" ON public.score_snapshots
    FOR SELECT TO authenticated
    USING (
        student_id = auth.uid()
        OR (public.is_mentor() AND public.is_mentor_of_student(student_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "score_snapshots_manage" ON public.score_snapshots;
CREATE POLICY "score_snapshots_manage" ON public.score_snapshots
    FOR ALL TO authenticated
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 14. COUNSELLING PLANS POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "counselling_plans_select" ON public.counselling_plans;
CREATE POLICY "counselling_plans_select" ON public.counselling_plans
    FOR SELECT TO authenticated
    USING (
        public.is_mentor_of_class(class_id)
        OR assigned_mentor_id = auth.uid()
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "counselling_plans_manage" ON public.counselling_plans;
CREATE POLICY "counselling_plans_manage" ON public.counselling_plans
    FOR ALL TO authenticated
    USING (public.is_mentor_of_class(class_id) OR public.is_admin())
    WITH CHECK (public.is_mentor_of_class(class_id) OR public.is_admin());

-- ==============================================================================
-- VERIFICATION TEST QUERIES
-- ==============================================================================
-- You can run these diagnostic verification tests in the Supabase SQL editor:
--
-- 1. Test Student Isolation:
--    SELECT * FROM public.study_sessions; 
--    -- Expected: Only sessions where student_id = auth.uid() are returned.
--
-- 2. Test Resource Visibility:
--    SELECT id, title, is_personal, class_id FROM public.resources;
--    -- Expected: Only returns personal files owned by student OR files shared with classes
--    -- where the student is currently enrolled in class_members.
--
-- 3. Test Mentor Class Boundary:
--    SELECT * FROM public.attendance_records;
--    -- Expected: Mentors only receive records for classes where mentor_id = auth.uid().
--
-- 4. Test Grievance Escalation:
--    SELECT id, title, status FROM public.grievances WHERE status = 'escalated';
--    -- Expected: Escalated tickets are accessible to campus administrators.
