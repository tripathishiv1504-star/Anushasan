-- ==============================================================================
-- ANUSHASAN: SMART CAMPUS DISCIPLINE & GROWTH PLATFORM
-- Supabase PostgreSQL Database Schema (Phase 2 - Step 21b)
-- ==============================================================================
-- Instructions: Run this script in the Supabase SQL Editor.
-- It creates all required tables from Project Specification Section 10 with
-- UUID primary keys, foreign key constraints, performance indexes, check constraints,
-- timestamps, and automatic user profile sync triggers.
-- ==============================================================================

-- Enable UUID extension (enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing tables if re-running (in reverse dependency order)
-- DROP TABLE IF EXISTS counselling_plans CASCADE;
-- DROP TABLE IF EXISTS score_snapshots CASCADE;
-- DROP TABLE IF EXISTS student_badges CASCADE;
-- DROP TABLE IF EXISTS badges CASCADE;
-- DROP TABLE IF EXISTS grievances CASCADE;
-- DROP TABLE IF EXISTS attendance_records CASCADE;
-- DROP TABLE IF EXISTS resources CASCADE;
-- DROP TABLE IF EXISTS goals CASCADE;
-- DROP TABLE IF EXISTS habit_logs CASCADE;
-- DROP TABLE IF EXISTS habits CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS study_sessions CASCADE;
-- DROP TABLE IF EXISTS class_members CASCADE;
-- DROP TABLE IF EXISTS classes CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
    study_mode TEXT CHECK (study_mode IN ('class', 'solo')),
    department_id UUID,
    daily_goal_minutes INTEGER DEFAULT 120,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 2. DEPARTMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Add foreign key constraint from profiles to departments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_department'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_department 
        FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. CLASSES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    join_code VARCHAR(6) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 4. CLASS MEMBERS (Enrollment bridge)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    CONSTRAINT uq_class_student UNIQUE (class_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 5. STUDY SESSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 6. TASKS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT DEFAULT '',
    due_date DATE,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 7. HABITS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'book-open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 8. HABIT LOGS (Daily checks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    CONSTRAINT uq_habit_date UNIQUE (habit_id, log_date)
);

-- ------------------------------------------------------------------------------
-- 9. GOALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_date DATE,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 10. RESOURCES (Materials & PDFs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('notes', 'assignment', 'pyq')),
    file_name TEXT NOT NULL,
    file_size_kb INTEGER NOT NULL DEFAULT 0,
    file_path TEXT,
    file_url TEXT,
    is_personal BOOLEAN NOT NULL DEFAULT FALSE,
    due_date DATE,
    instructions TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 11. ATTENDANCE RECORDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subject TEXT,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    CONSTRAINT uq_attendance_session UNIQUE (class_id, student_id, session_date)
);

-- ------------------------------------------------------------------------------
-- 12. GRIEVANCES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    category TEXT NOT NULL DEFAULT 'academic',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'escalated')),
    mentor_reply TEXT,
    mentor_reply_at TIMESTAMPTZ,
    admin_reply TEXT,
    admin_reply_at TIMESTAMPTZ,
    escalation_reason TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    status_history JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 13. BADGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT DEFAULT 'discipline',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ------------------------------------------------------------------------------
-- 14. STUDENT BADGES (Achievements earned)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    CONSTRAINT uq_student_badge UNIQUE (student_id, badge_id)
);

-- ------------------------------------------------------------------------------
-- 15. SCORE SNAPSHOTS (Weekly historical tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.score_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    study_score INTEGER DEFAULT 0,
    task_score INTEGER DEFAULT 0,
    habit_score INTEGER DEFAULT 0,
    attendance_score INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW()),
    CONSTRAINT uq_score_snapshot UNIQUE (student_id, week_start)
);

-- ------------------------------------------------------------------------------
-- 16. COUNSELLING PLANS (At-Risk student interventions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.counselling_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    intervention_date DATE NOT NULL,
    assigned_mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
    notes TEXT DEFAULT '',
    student_ids JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department_id);

CREATE INDEX IF NOT EXISTS idx_classes_mentor ON public.classes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_classes_department ON public.classes(department_id);
CREATE INDEX IF NOT EXISTS idx_classes_join_code ON public.classes(join_code);

CREATE INDEX IF NOT EXISTS idx_class_members_student ON public.class_members(student_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON public.class_members(class_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_student_date ON public.study_sessions(student_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_student_done ON public.tasks(student_id, is_done);
CREATE INDEX IF NOT EXISTS idx_habits_student ON public.habits(student_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(habit_id, log_date);
CREATE INDEX IF NOT EXISTS idx_goals_student ON public.goals(student_id);

CREATE INDEX IF NOT EXISTS idx_resources_class ON public.resources(class_id);
CREATE INDEX IF NOT EXISTS idx_resources_owner ON public.resources(owner_id);

CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance_records(class_id, session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);

CREATE INDEX IF NOT EXISTS idx_grievances_class_status ON public.grievances(class_id, status);
CREATE INDEX IF NOT EXISTS idx_grievances_student ON public.grievances(student_id);

CREATE INDEX IF NOT EXISTS idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_score_snapshots_student ON public.score_snapshots(student_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_counselling_class_status ON public.counselling_plans(class_id, status);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_grievances_updated_at ON public.grievances;
CREATE TRIGGER set_grievances_updated_at
    BEFORE UPDATE ON public.grievances
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        study_mode
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Campus Member'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'study_mode', 'class')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED STANDARD BADGES (Spec Section 11)
-- ==============================================================================
INSERT INTO public.badges (code, name, description, icon, category) VALUES
    ('first_step', 'First Session', 'Completed your very first focused study session on Anushasan.', 'award', 'consistency'),
    ('streak_7', '7-Day Streak', 'Maintained an unbroken daily study habit for 7 consecutive days.', 'flame', 'streak'),
    ('streak_30', '30-Day Master', 'Unstoppable consistency! 30 consecutive days of study dedication.', 'zap', 'streak'),
    ('century_hours', '100 Hours Logged', 'Crossed 100 hours of cumulative academic focus.', 'clock', 'volume'),
    ('perfect_week', 'Perfect Week', 'Achieved 100% attendance, daily habit completion, and all weekly goals.', 'check-circle-2', 'excellence'),
    ('goal_crusher', 'Goal Crusher', 'Successfully completed and checked off an academic milestone.', 'target', 'milestone'),
    ('night_owl', 'Night Owl', 'Completed a productive study session after 10 PM.', 'moon', 'timing'),
    ('early_bird', 'Early Bird', 'Started a focused study session before 7 AM.', 'sun', 'timing')
ON CONFLICT (code) DO NOTHING;
