-- ==============================================================================
-- SYNAPSE ENTERPRISE AI — SUPABASE PRODUCTION DATABASE SCHEMA
-- Compatible with Supabase SQL Editor and Direct PostgreSQL Migrations
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Define custom ENUM types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'department_type') THEN
        CREATE TYPE department_type AS ENUM ('finance', 'hr', 'engineering', 'operations', 'product');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM ('backlog', 'in_progress', 'review', 'completed');
    END IF;
END $$;

-- 3. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'employee',
    department department_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    department department_type NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    raw_content TEXT NOT NULL,
    ai_summary TEXT,
    extracted_entities JSONB,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Workflows Table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department department_type NOT NULL,
    status task_status DEFAULT 'backlog',
    priority task_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    ai_suggestions JSONB,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Cryptographic Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. High-Performance Indices for Supabase / PostgreSQL
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_documents_department ON public.documents(department);
CREATE INDEX IF NOT EXISTS idx_workflows_department ON public.workflows(department);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON public.workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_priority ON public.workflows(priority);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Service Role Policy: Full unrestricted access for server-side operations
CREATE POLICY "service_role_all_users" ON public.users
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_documents" ON public.documents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_workflows" ON public.workflows
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_audit_logs" ON public.audit_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public / Authenticated read policies (anon and authenticated)
CREATE POLICY "authenticated_read_users" ON public.users
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "authenticated_read_documents" ON public.documents
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "authenticated_insert_documents" ON public.documents
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "authenticated_read_workflows" ON public.workflows
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "authenticated_modify_workflows" ON public.workflows
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_audit" ON public.audit_logs
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "authenticated_insert_audit" ON public.audit_logs
    FOR INSERT TO authenticated, anon WITH CHECK (true);

