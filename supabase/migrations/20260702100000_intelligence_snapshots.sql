-- Intelligence: snapshots generados por cron (insights IA cruzados)

CREATE TABLE IF NOT EXISTS public.intelligence_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  insights JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  bottlenecks JSONB NOT NULL DEFAULT '[]',
  opportunities JSONB NOT NULL DEFAULT '[]',
  memory_chunks JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS intelligence_snapshots_org_generated_idx
  ON public.intelligence_snapshots (organization_id, generated_at DESC);

ALTER TABLE public.intelligence_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own org intelligence" ON public.intelligence_snapshots;
CREATE POLICY "Users read own org intelligence"
  ON public.intelligence_snapshots
  FOR SELECT
  USING (organization_id = public.get_my_organization_id());
