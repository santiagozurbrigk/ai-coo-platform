-- I-1 del plan de integraciones — ver docs/FUNNELS_SOURCE_MAP.md §5
--
-- Persiste las métricas de anuncios por día y por anuncio.
--
-- POR QUÉ EXISTE: `ZernioAdMetrics` ya devuelve spend, impressions, reach y
-- clicks, pero por convención del repo los ads de Zernio son live-fetch y no se
-- guardan. Eso hace que el histórico de la etapa Spend NO sea reconstruible
-- hacia atrás (docs/FUNNELS_ARCHITECTURE.md §9.3): la serie de cualquier embudo
-- arranca el día que se activa la captura.
--
-- Es una excepción acotada a esa convención: se persiste el AGREGADO diario, no
-- la data cruda del anuncio.

CREATE TABLE IF NOT EXISTS public.ad_metrics_daily (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  -- Día al que corresponden las métricas, en la zona de reporte de la org.
  metric_date     date NOT NULL,
  -- Plataforma de origen. Hoy siempre 'meta' vía Zernio.
  platform        text NOT NULL DEFAULT 'meta',
  ad_external_id  text NOT NULL,
  ad_name         text,
  campaign_name   text,
  ad_set_name     text,

  -- Las cuatro medidas que el documento le asigna a Meta Ads (M01–M04).
  spend           numeric(14, 2) NOT NULL DEFAULT 0,
  impressions     bigint NOT NULL DEFAULT 0,
  reach           bigint NOT NULL DEFAULT 0,
  clicks          bigint NOT NULL DEFAULT 0,

  captured_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, metric_date, platform, ad_external_id)
);

CREATE INDEX IF NOT EXISTS ad_metrics_daily_org_date_idx
  ON public.ad_metrics_daily (organization_id, metric_date DESC);

ALTER TABLE public.ad_metrics_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read their ad_metrics_daily" ON public.ad_metrics_daily;
CREATE POLICY "org members read their ad_metrics_daily"
  ON public.ad_metrics_daily FOR SELECT
  USING (organization_id = public.get_my_organization_id());

-- La escritura es sólo del cron, vía service role (que saltea RLS). No se
-- otorgan políticas de INSERT/UPDATE a usuarios.

COMMENT ON TABLE public.ad_metrics_daily IS
  'Métricas diarias de anuncios por período. Excepción acotada a la convención de live-fetch de Zernio: sin esto el histórico de la etapa Spend no es reconstruible. Escribe sólo el cron con service role.';
