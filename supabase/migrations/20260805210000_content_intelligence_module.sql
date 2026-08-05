-- Content Intelligence Module
-- Fase 1: Columnas de clasificación en content_pieces + tabla content_pattern_reports

-- ─── 1. Columnas de clasificación estructurada en content_pieces ───────────────

ALTER TABLE public.content_pieces
  ADD COLUMN IF NOT EXISTS format_type TEXT
    CHECK (format_type IN ('storytime','talking_head','pov','listicle','green_screen','hot_take','carousel','otro')),
  ADD COLUMN IF NOT EXISTS hook_type TEXT
    CHECK (hook_type IN ('dolor_directo','curiosidad','contrarian','prueba_social','resultado')),
  ADD COLUMN IF NOT EXISTS cta_type TEXT
    CHECK (cta_type IN ('dm','comment_word','link','none'));

COMMENT ON COLUMN public.content_pieces.format_type IS 'Formato narrativo detectado por IA: storytime, talking_head, pov, listicle, green_screen, hot_take, carousel, otro';
COMMENT ON COLUMN public.content_pieces.hook_type  IS 'Tipo de hook detectado por IA: dolor_directo, curiosidad, contrarian, prueba_social, resultado';
COMMENT ON COLUMN public.content_pieces.cta_type   IS 'CTA principal detectado por IA: dm, comment_word, link, none';

-- ─── 2. Tabla content_pattern_reports ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.content_pattern_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Selector usado para generar el reporte
  range_type       TEXT NOT NULL CHECK (range_type IN ('COUNT', 'DATE_RANGE')),
  range_value      TEXT NOT NULL,               -- "30" | "2026-06-01:2026-07-31"
  content_ids      UUID[] NOT NULL DEFAULT '{}', -- IDs exactos incluidos en el análisis

  -- Hallazgos estructurados
  top_formats      JSONB,   -- [{ value, count, conversion_rate? }]
  top_hooks        JSONB,   -- [{ value, count, avg_views? }]
  top_topics       JSONB,   -- [{ topic, count, example_ids }]

  -- Texto generado por IA
  summary          TEXT,    -- 2-3 párrafos de observaciones
  suggestions      TEXT,    -- sugerencias con lenguaje de hipótesis (podría, convendría)
  sample_size_notes TEXT,   -- advertencias si muestra pequeña o sin clasificación

  generated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.content_pattern_reports IS 'Reportes de patrones de contenido generados bajo demanda por IA. No se actualizan — se generan nuevos en cada solicitud.';

-- Índices
CREATE INDEX IF NOT EXISTS content_pattern_reports_org_generated
  ON public.content_pattern_reports (organization_id, generated_at DESC);

-- RLS
ALTER TABLE public.content_pattern_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read own reports"
  ON public.content_pattern_reports
  FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "org members can insert own reports"
  ON public.content_pattern_reports
  FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());
