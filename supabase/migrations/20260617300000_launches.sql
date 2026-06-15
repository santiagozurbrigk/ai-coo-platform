-- Módulo Lanzamientos: planning, métricas diarias y vínculo con workboard

CREATE TABLE IF NOT EXISTS public.launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (
    status IN ('planning', 'active', 'completed', 'cancelled')
  ),
  launch_date DATE,
  end_date DATE,
  goal_revenue NUMERIC(10, 2),
  actual_revenue NUMERIC(10, 2) NOT NULL DEFAULT 0,
  goal_clients INTEGER,
  actual_clients INTEGER NOT NULL DEFAULT 0,
  product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
  post_mortem TEXT,
  post_mortem_generated_at TIMESTAMPTZ,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.workboard_tasks
  ADD COLUMN IF NOT EXISTS launch_id UUID REFERENCES public.launches (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workboard_tasks_launch_idx
  ON public.workboard_tasks (launch_id);

CREATE TABLE IF NOT EXISTS public.launch_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id UUID NOT NULL REFERENCES public.launches (id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue NUMERIC(10, 2) NOT NULL DEFAULT 0,
  new_clients INTEGER NOT NULL DEFAULT 0,
  conversations_started INTEGER NOT NULL DEFAULT 0,
  bookings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (launch_id, date)
);

CREATE INDEX IF NOT EXISTS launches_org_status_idx
  ON public.launches (organization_id, status);

CREATE INDEX IF NOT EXISTS launch_metrics_launch_date_idx
  ON public.launch_metrics (launch_id, date);

ALTER TABLE public.launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launch_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read launches" ON public.launches;
CREATE POLICY "Org members read launches"
  ON public.launches FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members insert launches" ON public.launches;
CREATE POLICY "Org members insert launches"
  ON public.launches FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members update launches" ON public.launches;
CREATE POLICY "Org members update launches"
  ON public.launches FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members delete launches" ON public.launches;
CREATE POLICY "Org members delete launches"
  ON public.launches FOR DELETE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members read launch_metrics" ON public.launch_metrics;
CREATE POLICY "Org members read launch_metrics"
  ON public.launch_metrics FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members insert launch_metrics" ON public.launch_metrics;
CREATE POLICY "Org members insert launch_metrics"
  ON public.launch_metrics FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members update launch_metrics" ON public.launch_metrics;
CREATE POLICY "Org members update launch_metrics"
  ON public.launch_metrics FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members delete launch_metrics" ON public.launch_metrics;
CREATE POLICY "Org members delete launch_metrics"
  ON public.launch_metrics FOR DELETE
  USING (organization_id = public.get_my_organization_id());
