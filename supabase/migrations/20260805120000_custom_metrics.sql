-- Custom metrics: allow founders to define and compose their own KPIs
-- Supports single source or crossed metrics (source_a OP source_b, or source_a OP constant_b)

CREATE TABLE IF NOT EXISTS public.custom_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  -- Primary data source
  source_a text NOT NULL,
  -- Optional composition
  operation text NOT NULL DEFAULT 'none', -- none | multiply | divide | add | subtract
  source_b text,                           -- another MetricSource, or null when using constant_b
  constant_b numeric,                      -- fixed number (e.g. 0.20 for 20%), used when source_b is null
  -- Display
  display_format text NOT NULL DEFAULT 'number', -- number | currency_usd | currency_ars | percentage | ratio
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.custom_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can manage their custom metrics"
  ON public.custom_metrics
  FOR ALL
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- Index for org lookups
CREATE INDEX IF NOT EXISTS custom_metrics_org_idx
  ON public.custom_metrics (organization_id, sort_order);
