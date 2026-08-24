-- Agrega display_location a metric_snapshots para que el usuario
-- pueda asociar métricas importadas a un módulo específico del producto.
ALTER TABLE public.metric_snapshots
  ADD COLUMN IF NOT EXISTS display_location text NOT NULL DEFAULT 'dashboard';

CREATE INDEX IF NOT EXISTS metric_snapshots_org_location_idx
  ON public.metric_snapshots (organization_id, display_location, period DESC);
