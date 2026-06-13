-- Weekly inputs y reportes ejecutivos generados con IA

CREATE TABLE IF NOT EXISTS public.weekly_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  department TEXT NOT NULL CHECK (
    department IN ('ventas', 'delivery', 'operaciones', 'marketing', 'founder')
  ),
  type TEXT NOT NULL CHECK (type IN ('text', 'rating')),
  content TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  submitted_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, week_start, department, submitted_by)
);

CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  executive_summary TEXT,
  risks JSONB NOT NULL DEFAULT '[]',
  bottlenecks JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'generating', 'ready', 'error')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, week_start)
);

CREATE INDEX IF NOT EXISTS weekly_inputs_org_week_idx
  ON public.weekly_inputs (organization_id, week_start DESC);

CREATE INDEX IF NOT EXISTS weekly_reports_org_week_idx
  ON public.weekly_reports (organization_id, week_start DESC);

ALTER TABLE public.weekly_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weekly_inputs_select_org" ON public.weekly_inputs;
CREATE POLICY "weekly_inputs_select_org"
  ON public.weekly_inputs FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "weekly_inputs_insert_org" ON public.weekly_inputs;
CREATE POLICY "weekly_inputs_insert_org"
  ON public.weekly_inputs FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "weekly_inputs_update_org" ON public.weekly_inputs;
CREATE POLICY "weekly_inputs_update_org"
  ON public.weekly_inputs FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "weekly_inputs_delete_org" ON public.weekly_inputs;
CREATE POLICY "weekly_inputs_delete_org"
  ON public.weekly_inputs FOR DELETE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "weekly_reports_select_org" ON public.weekly_reports;
CREATE POLICY "weekly_reports_select_org"
  ON public.weekly_reports FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "weekly_reports_insert_org" ON public.weekly_reports;
CREATE POLICY "weekly_reports_insert_org"
  ON public.weekly_reports FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "weekly_reports_update_org" ON public.weekly_reports;
CREATE POLICY "weekly_reports_update_org"
  ON public.weekly_reports FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE OR REPLACE FUNCTION public.get_current_week_start()
RETURNS DATE
LANGUAGE sql
STABLE
AS $$
  SELECT DATE_TRUNC('week', CURRENT_DATE)::DATE;
$$;

REVOKE ALL ON FUNCTION public.get_current_week_start() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_week_start() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_week_start() TO service_role;
