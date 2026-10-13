-- ==============================================================================
-- ANUSHASAN: SMART CAMPUS DISCIPLINE & GROWTH PLATFORM
-- Supabase Storage Buckets & Policies Configuration (Phase 2 - Step 21e)
-- ==============================================================================
-- Instructions: Run this script in the Supabase SQL Editor after running schema.sql
-- and policies.sql. It configures the 'resources' storage bucket for course PDFs
-- and personal study files, with file size and MIME-type restrictions.
-- ==============================================================================

-- 1. Create the 'resources' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resources',
    'resources',
    true, -- Publicly readable for authenticated campus members
    10485760, -- 10 MB maximum file size limit (in bytes)
    ARRAY['application/pdf']::text[] -- Strictly restrict to PDF files
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf']::text[];

-- ==============================================================================
-- STORAGE ROW LEVEL SECURITY POLICIES (storage.objects)
-- ==============================================================================

-- 1. Read Policy: All authenticated campus members can view and download PDFs from 'resources'
DROP POLICY IF EXISTS "Authenticated campus members can view resources" ON storage.objects;
CREATE POLICY "Authenticated campus members can view resources" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'resources');

-- 2. Insert Policy: Authenticated users can upload PDF files up to 10 MB into 'resources'
DROP POLICY IF EXISTS "Authenticated campus members can upload PDF resources" ON storage.objects;
CREATE POLICY "Authenticated campus members can upload PDF resources" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'resources'
        AND (
            LOWER(storage.extension(name)) = 'pdf'
            OR metadata->>'mimetype' = 'application/pdf'
        )
    );

-- 3. Delete Policy: Uploaders can delete their own files, or admins can delete any file
DROP POLICY IF EXISTS "Uploaders or admins can delete resources" ON storage.objects;
CREATE POLICY "Uploaders or admins can delete resources" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'resources'
        AND (
            auth.uid() = owner
            OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    );

-- ==============================================================================
-- STORAGE DIAGNOSTIC QUERY
-- ==============================================================================
-- SELECT id, name, public, file_size_limit, allowed_mime_types 
-- FROM storage.buckets 
-- WHERE id = 'resources';
