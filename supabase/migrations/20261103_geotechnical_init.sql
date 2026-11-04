-- Geotechnical Operations Platform Schema Migration
-- Migration: 20261103_geotechnical_init.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'field_engineer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status_enum AS ENUM ('active', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE borehole_status_enum AS ENUM ('planned', 'in_progress', 'completed', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM ('Pending Review', 'Approved', 'Flagged for Re-test');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attachment_type_enum AS ENUM ('site_photo', 'sample_card', 'field_sheet');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- Users table (profile mirroring auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'field_engineer',
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code TEXT UNIQUE,
    project_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    location_address TEXT,
    city TEXT,
    state TEXT,
    status project_status_enum NOT NULL DEFAULT 'active',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Project assignments (Engineers mapped to projects)
CREATE TABLE IF NOT EXISTS public.project_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_project_user_assignment UNIQUE (project_id, user_id)
);

-- Boreholes table
CREATE TABLE IF NOT EXISTS public.boreholes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    borehole_no TEXT NOT NULL,
    depth_target_m NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    depth_drilled_m NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    status borehole_status_enum NOT NULL DEFAULT 'in_progress',
    ground_elevation_m NUMERIC(6, 2),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rig_type TEXT,
    drilling_method TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_project_borehole UNIQUE (project_id, borehole_no)
);

-- Site Logs table
CREATE TABLE IF NOT EXISTS public.site_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borehole_id UUID NOT NULL REFERENCES public.boreholes(id) ON DELETE CASCADE,
    engineer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    depth_from_m NUMERIC(6, 2) NOT NULL,
    depth_to_m NUMERIC(6, 2) NOT NULL,
    sample_no TEXT,
    strata_classification TEXT NOT NULL,
    color_description TEXT,
    density_consistency TEXT,
    spt_blows_15cm INTEGER,
    spt_blows_30cm INTEGER,
    spt_blows_45cm INTEGER,
    spt_n_value INTEGER,
    core_recovery_pct NUMERIC(5, 2),
    rqd_pct NUMERIC(5, 2),
    water_table_depth_m NUMERIC(6, 2),
    water_table_encountered BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    gps_lat DOUBLE PRECISION,
    gps_long DOUBLE PRECISION,
    gps_accuracy_m NUMERIC(6, 2),
    verification_status verification_status_enum NOT NULL DEFAULT 'Pending Review',
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Log Attachments table
CREATE TABLE IF NOT EXISTS public.log_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES public.site_logs(id) ON DELETE CASCADE,
    attachment_type attachment_type_enum NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT,
    mime_type TEXT DEFAULT 'image/jpeg',
    file_size_bytes BIGINT,
    extracted_text_json JSONB,
    generated_xlsx_url TEXT,
    ocr_status TEXT DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
    ocr_processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. INDEXES FOR HIGH-THROUGHPUT REALTIME QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user_id ON public.project_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project_id ON public.project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_boreholes_project_id ON public.boreholes(project_id);
CREATE INDEX IF NOT EXISTS idx_site_logs_borehole_id ON public.site_logs(borehole_id);
CREATE INDEX IF NOT EXISTS idx_site_logs_engineer_id ON public.site_logs(engineer_id);
CREATE INDEX IF NOT EXISTS idx_site_logs_verification_status ON public.site_logs(verification_status);
CREATE INDEX IF NOT EXISTS idx_site_logs_created_at ON public.site_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_log_attachments_log_id ON public.log_attachments(log_id);
CREATE INDEX IF NOT EXISTS idx_log_attachments_type ON public.log_attachments(attachment_type);

-- ============================================================================
-- 4. AUTOMATIC TIMESTAMPS TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON public.users;
CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_boreholes_updated_at ON public.boreholes;
CREATE TRIGGER trigger_update_boreholes_updated_at
BEFORE UPDATE ON public.boreholes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_site_logs_updated_at ON public.site_logs;
CREATE TRIGGER trigger_update_site_logs_updated_at
BEFORE UPDATE ON public.site_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Helper functions to check roles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role_enum AS $$
DECLARE
    v_role user_role_enum;
BEGIN
    SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
    RETURN COALESCE(v_role, 'field_engineer'::user_role_enum);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boreholes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_attachments ENABLE ROW LEVEL SECURITY;

-- ----------------- USERS POLICIES -----------------
DROP POLICY IF EXISTS "Users can view self or Admins can view all" ON public.users;
CREATE POLICY "Users can view self or Admins can view all" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR public.is_admin_or_manager()
    );

DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can manage users" ON public.users
    FOR ALL USING (
        public.is_admin_or_manager()
    );

-- ----------------- PROJECTS POLICIES -----------------
-- Admins/Managers full access
DROP POLICY IF EXISTS "Admins/Managers full access to projects" ON public.projects;
CREATE POLICY "Admins/Managers full access to projects" ON public.projects
    FOR ALL USING (
        public.is_admin_or_manager()
    );

-- Field engineers can only view active projects assigned to them
DROP POLICY IF EXISTS "Field engineers view assigned active projects" ON public.projects;
CREATE POLICY "Field engineers view assigned active projects" ON public.projects
    FOR SELECT USING (
        status = 'active' AND id IN (
            SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid()
        )
    );

-- ----------------- PROJECT ASSIGNMENTS POLICIES -----------------
DROP POLICY IF EXISTS "Admins/Managers full access to assignments" ON public.project_assignments;
CREATE POLICY "Admins/Managers full access to assignments" ON public.project_assignments
    FOR ALL USING (
        public.is_admin_or_manager()
    );

DROP POLICY IF EXISTS "Field engineers view own assignments" ON public.project_assignments;
CREATE POLICY "Field engineers view own assignments" ON public.project_assignments
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- ----------------- BOREHOLES POLICIES -----------------
DROP POLICY IF EXISTS "Admins/Managers full access to boreholes" ON public.boreholes;
CREATE POLICY "Admins/Managers full access to boreholes" ON public.boreholes
    FOR ALL USING (
        public.is_admin_or_manager()
    );

DROP POLICY IF EXISTS "Field engineers view boreholes of assigned projects" ON public.boreholes;
CREATE POLICY "Field engineers view boreholes of assigned projects" ON public.boreholes
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Field engineers can insert boreholes for assigned projects" ON public.boreholes;
CREATE POLICY "Field engineers can insert boreholes for assigned projects" ON public.boreholes
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid()
        )
    );

-- ----------------- SITE LOGS POLICIES -----------------
-- Admins/Managers full control (can approve, flag, view, edit)
DROP POLICY IF EXISTS "Admins/Managers full access to site_logs" ON public.site_logs;
CREATE POLICY "Admins/Managers full access to site_logs" ON public.site_logs
    FOR ALL USING (
        public.is_admin_or_manager()
    );

-- Field engineers can read logs for their assigned projects
DROP POLICY IF EXISTS "Field engineers view logs in assigned projects" ON public.site_logs;
CREATE POLICY "Field engineers view logs in assigned projects" ON public.site_logs
    FOR SELECT USING (
        borehole_id IN (
            SELECT b.id FROM public.boreholes b
            JOIN public.project_assignments pa ON pa.project_id = b.project_id
            WHERE pa.user_id = auth.uid()
        )
    );

-- Field engineers can insert their own logs
DROP POLICY IF EXISTS "Field engineers insert own logs" ON public.site_logs;
CREATE POLICY "Field engineers insert own logs" ON public.site_logs
    FOR INSERT WITH CHECK (
        engineer_id = auth.uid() AND
        borehole_id IN (
            SELECT b.id FROM public.boreholes b
            JOIN public.project_assignments pa ON pa.project_id = b.project_id
            WHERE pa.user_id = auth.uid()
        )
    );

-- Field engineers can update pending review logs that they created
DROP POLICY IF EXISTS "Field engineers update pending logs" ON public.site_logs;
CREATE POLICY "Field engineers update pending logs" ON public.site_logs
    FOR UPDATE USING (
        engineer_id = auth.uid() AND verification_status = 'Pending Review'
    );

-- ----------------- LOG ATTACHMENTS POLICIES -----------------
DROP POLICY IF EXISTS "Admins/Managers full access to attachments" ON public.log_attachments;
CREATE POLICY "Admins/Managers full access to attachments" ON public.log_attachments
    FOR ALL USING (
        public.is_admin_or_manager()
    );

DROP POLICY IF EXISTS "Field engineers view attachments for assigned projects" ON public.log_attachments;
CREATE POLICY "Field engineers view attachments for assigned projects" ON public.log_attachments
    FOR SELECT USING (
        log_id IN (
            SELECT sl.id FROM public.site_logs sl
            JOIN public.boreholes b ON b.id = sl.borehole_id
            JOIN public.project_assignments pa ON pa.project_id = b.project_id
            WHERE pa.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Field engineers insert attachments for own logs" ON public.log_attachments;
CREATE POLICY "Field engineers insert attachments for own logs" ON public.log_attachments
    FOR INSERT WITH CHECK (
        log_id IN (
            SELECT sl.id FROM public.site_logs sl WHERE sl.engineer_id = auth.uid()
        )
    );

-- ============================================================================
-- 6. ENABLE REALTIME PUBLICATION
-- ============================================================================
-- Ensure tables are published to supabase_realtime
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_logs;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.log_attachments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.boreholes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set replica identity to FULL so realtime updates send old and new records
ALTER TABLE public.site_logs REPLICA IDENTITY FULL;
ALTER TABLE public.log_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.boreholes REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;

-- ============================================================================
-- 7. SUPABASE STORAGE BUCKET CREATION & POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('site-photos', 'site-photos', true),
    ('sample-cards', 'sample-cards', true),
    ('field-sheets', 'field-sheets', true),
    ('generated-xlsx', 'generated-xlsx', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read for fast preview, authenticated upload
DROP POLICY IF EXISTS "Public Read for Geotechnical Assets" ON storage.objects;
CREATE POLICY "Public Read for Geotechnical Assets" ON storage.objects
    FOR SELECT USING (bucket_id IN ('site-photos', 'sample-cards', 'field-sheets', 'generated-xlsx'));

DROP POLICY IF EXISTS "Authenticated users upload geotechnical assets" ON storage.objects;
CREATE POLICY "Authenticated users upload geotechnical assets" ON storage.objects
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        bucket_id IN ('site-photos', 'sample-cards', 'field-sheets', 'generated-xlsx')
    );

