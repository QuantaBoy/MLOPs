-- ==========================================================
-- PS1 Smart Support Ticket Priority Prediction System
-- Supabase Postgres Schema & Row-Level Security (RLS) Policies
-- TRD Section 5.1, 5.2, & 5.3
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin', 'mlops')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  predicted_priority TEXT NOT NULL CHECK (predicted_priority IN ('low', 'medium', 'high', 'critical')),
  prediction_confidence NUMERIC(4, 3) NOT NULL CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1),
  current_priority TEXT NOT NULL CHECK (current_priority IN ('low', 'medium', 'high', 'critical')),
  assigned_agent_id UUID REFERENCES public.profiles(id),
  model_version TEXT NOT NULL,
  is_overridden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TICKET_FEEDBACK TABLE (Override Log - Labeled dataset for MLOps retraining)
CREATE TABLE IF NOT EXISTS public.ticket_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  original_prediction TEXT NOT NULL CHECK (original_prediction IN ('low', 'medium', 'high', 'critical')),
  corrected_priority TEXT NOT NULL CHECK (corrected_priority IN ('low', 'medium', 'high', 'critical')),
  corrected_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MODEL_VERSIONS TABLE (MLflow Model Registry Metadata)
CREATE TABLE IF NOT EXISTS public.model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_tag TEXT NOT NULL UNIQUE,
  mlflow_run_id TEXT NOT NULL,
  macro_f1 NUMERIC(4, 3) NOT NULL,
  accuracy NUMERIC(4, 3) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  trained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  training_samples INT NOT NULL DEFAULT 1000
);

-- 5. RETRAIN_JOBS TABLE
CREATE TABLE IF NOT EXISTS public.retrain_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  triggered_by UUID NOT NULL REFERENCES public.profiles(id),
  resulting_model_version_id UUID REFERENCES public.model_versions(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- 6. NOTIFICATIONS TABLE (Realtime Alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- INDEXES (TRD Section 5.3)
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON public.tickets(status, current_priority);
CREATE INDEX IF NOT EXISTS idx_tickets_requester ON public.tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_ticket_feedback_ticket ON public.ticket_feedback(ticket_id);

-- ==========================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES (TRD Section 5.2)
-- ==========================================================

-- Enable RLS on all tables
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrain_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check role of authenticated user
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- TICKETS RLS:
-- Customer sees only their own tickets; Support Agents and Admins see all tickets.
CREATE POLICY "Tickets Select Policy" ON public.tickets
  FOR SELECT USING (
    requester_id = auth.uid() OR public.get_current_user_role() IN ('agent', 'admin', 'mlops')
  );

-- Authenticated user creates tickets under their own profile id
CREATE POLICY "Tickets Insert Policy" ON public.tickets
  FOR INSERT WITH CHECK (
    requester_id = auth.uid()
  );

-- Only Support Agent or Admin can update status / priority
CREATE POLICY "Tickets Update Policy" ON public.tickets
  FOR UPDATE USING (
    public.get_current_user_role() IN ('agent', 'admin', 'mlops')
  );

-- TICKET_FEEDBACK RLS: Readable and writable by Agents / Admins only
CREATE POLICY "Feedback Policy" ON public.ticket_feedback
  FOR ALL USING (
    public.get_current_user_role() IN ('agent', 'admin', 'mlops')
  );

-- MODEL_VERSIONS & RETRAIN_JOBS RLS: Readable and writable by Admins / MLOps Engineers only
CREATE POLICY "Model Versions Policy" ON public.model_versions
  FOR ALL USING (
    public.get_current_user_role() IN ('admin', 'mlops')
  );

CREATE POLICY "Retrain Jobs Policy" ON public.retrain_jobs
  FOR ALL USING (
    public.get_current_user_role() IN ('admin', 'mlops')
  );

-- NOTIFICATIONS RLS: User reads only their own rows
CREATE POLICY "Notifications Policy" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid() OR user_id IS NULL
  );
