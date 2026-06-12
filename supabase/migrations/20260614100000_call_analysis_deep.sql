-- Deep call analysis: sales scripts + per-call adherence scoring

CREATE TABLE IF NOT EXISTS public.sales_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sales_scripts_org_active_idx
  ON public.sales_scripts (organization_id, is_active);

CREATE TABLE IF NOT EXISTS public.call_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  fathom_call_id TEXT,
  closer_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  closer_name TEXT,
  call_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  script_adherence_pct INTEGER CHECK (script_adherence_pct BETWEEN 0 AND 100),
  section_scores JSONB NOT NULL DEFAULT '{}',
  missing_steps JSONB NOT NULL DEFAULT '[]',
  objections JSONB NOT NULL DEFAULT '[]',
  power_phrases JSONB NOT NULL DEFAULT '[]',
  weak_phrases JSONB NOT NULL DEFAULT '[]',
  filler_words_count INTEGER NOT NULL DEFAULT 0,
  lead_qualified BOOLEAN,
  booked BOOLEAN NOT NULL DEFAULT false,
  sold BOOLEAN NOT NULL DEFAULT false,
  summary TEXT,
  strengths JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS call_analyses_org_date_idx
  ON public.call_analyses (organization_id, call_date DESC);

CREATE INDEX IF NOT EXISTS call_analyses_org_closer_idx
  ON public.call_analyses (organization_id, closer_id, call_date DESC);

ALTER TABLE public.sales_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read org sales scripts"
  ON public.sales_scripts FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users insert org sales scripts"
  ON public.sales_scripts FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Users update org sales scripts"
  ON public.sales_scripts FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Users read org call analyses"
  ON public.call_analyses FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users insert org call analyses"
  ON public.call_analyses FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Users update org call analyses"
  ON public.call_analyses FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());
