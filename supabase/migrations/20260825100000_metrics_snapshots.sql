-- Importación de métricas históricas de ventas y finanzas
-- Cada fila = un período (semana, mes, etc.) con sus KPIs en JSONB.

CREATE TABLE IF NOT EXISTS public.metrics_snapshots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category        text NOT NULL CHECK (category IN ('sales', 'finance')),
  period_start    date NOT NULL,
  period_end      date,
  period_label    text,          -- ej. "Semana 1 – Enero 2025", "Enero 2025"
  metrics         jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, category, period_start)
);

CREATE INDEX IF NOT EXISTS metrics_snapshots_org_cat_idx
  ON public.metrics_snapshots (organization_id, category, period_start DESC);

ALTER TABLE public.metrics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can manage their metrics_snapshots"
  ON public.metrics_snapshots
  FOR ALL
  USING  (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());
