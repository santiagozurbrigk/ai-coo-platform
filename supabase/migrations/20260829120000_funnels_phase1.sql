-- Módulo de Embudos — Fase 1
-- Ver docs/FUNNELS_ARCHITECTURE.md §5 (capa 2: instancia) y §9.2
--
-- Las PLANTILLAS de embudo (webinar, vsl_call, dm) viven en código, en
-- `apps/web/lib/funnels/templates/`. Acá vive sólo lo específico de cada org:
-- qué instancias tiene, cómo están conectadas, qué umbrales sobreescribió y qué
-- series históricas acumuló.

-- ─── Instancias ───────────────────────────────────────────────────────────────
-- Una instancia = una plantilla aplicada a una oferta concreta.
-- Hay VARIAS por org (una por oferta) porque el documento fuente prohíbe
-- explícitamente comparar una oferta de $27 con una de $5k: el price point es
-- parte de la identidad de la instancia, no un detalle de presentación.

CREATE TABLE IF NOT EXISTS public.funnel_instances (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  -- id de la plantilla en código. Sin FK: el catálogo no vive en la DB.
  template_id        text NOT NULL,
  name               text NOT NULL,
  product_id         uuid REFERENCES public.products (id) ON DELETE SET NULL,
  currency           text NOT NULL DEFAULT 'USD',
  price_point        numeric(12, 2) NOT NULL DEFAULT 0,
  -- El documento lo declara no negociable: se reporta en EST porque el
  -- dashboard de Hyros viene por defecto en Mountain Time.
  reporting_timezone text NOT NULL DEFAULT 'America/New_York',
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS funnel_instances_org_idx
  ON public.funnel_instances (organization_id, is_active, created_at DESC);

-- ─── Bindings de step a fuente ────────────────────────────────────────────────
-- Qué fuente concreta alimenta cada step de la plantilla.
-- Un step SIN binding no es un error: resuelve a `null` (sin datos) y la UI lo
-- muestra como hueco de instrumentación, nunca como rotura de negocio (§9.1).

CREATE TABLE IF NOT EXISTS public.funnel_step_bindings (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  funnel_instance_id uuid NOT NULL REFERENCES public.funnel_instances (id) ON DELETE CASCADE,
  -- id del step dentro de la plantilla, ej. "dm.conversation"
  step_id            text NOT NULL,
  -- id de la fuente en `lib/funnels/sources.ts`, ej. "conversations_opened"
  source_id          text NOT NULL,
  config             jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (funnel_instance_id, step_id)
);

CREATE INDEX IF NOT EXISTS funnel_step_bindings_instance_idx
  ON public.funnel_step_bindings (funnel_instance_id);

-- ─── Overrides de benchmark ───────────────────────────────────────────────────
-- Niveles 2 y 3 de la precedencia de §3.5. El nivel 1 (plantilla) vive en código.
--   plantilla  →  offer_override  →  org_baseline   (el último gana)

CREATE TABLE IF NOT EXISTS public.funnel_benchmarks (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  funnel_instance_id uuid NOT NULL REFERENCES public.funnel_instances (id) ON DELETE CASCADE,
  metric_id          text NOT NULL,
  -- Benchmark normalizado, con la forma del tipo `Benchmark` de lib/funnels/types.ts
  benchmark          jsonb NOT NULL,
  source             text NOT NULL DEFAULT 'offer_override'
                       CHECK (source IN ('offer_override', 'org_baseline')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (funnel_instance_id, metric_id, source)
);

CREATE INDEX IF NOT EXISTS funnel_benchmarks_instance_idx
  ON public.funnel_benchmarks (funnel_instance_id, source);

-- ─── Snapshots por período ────────────────────────────────────────────────────
-- Serie histórica del embudo.
--
-- No se reusa `metrics_snapshots` a propósito (§9.2): su CHECK de category no
-- contempla embudos y su UNIQUE (organization_id, category, period_start)
-- colisionaría entre dos instancias de la misma org en el mismo período.
--
-- La tabla existe desde la Fase 1 aunque el job de captura llegue en la Fase 5:
-- los ads de Zernio son live-fetch por convención del repo, así que el Spend
-- histórico no es reconstruible hacia atrás (§9.3).

CREATE TABLE IF NOT EXISTS public.funnel_period_snapshots (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  funnel_instance_id uuid NOT NULL REFERENCES public.funnel_instances (id) ON DELETE CASCADE,
  period_start       date NOT NULL,
  period_end         date NOT NULL,
  granularity        text NOT NULL DEFAULT 'day'
                       CHECK (granularity IN ('day', 'week', 'month')),
  -- stepId → conteo. `null` en un step significa sin datos, distinto de 0.
  step_counts        jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- metricId → valor resuelto
  metrics            jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- metricId → procedencia, para poder etiquetar cada figura ([Meta] / [Hyros])
  provenance         jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (funnel_instance_id, period_start, granularity)
);

CREATE INDEX IF NOT EXISTS funnel_period_snapshots_instance_idx
  ON public.funnel_period_snapshots (funnel_instance_id, granularity, period_start DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.funnel_instances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_step_bindings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_benchmarks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_period_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members manage their funnel_instances" ON public.funnel_instances;
CREATE POLICY "org members manage their funnel_instances"
  ON public.funnel_instances FOR ALL
  USING      (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members manage their funnel_step_bindings" ON public.funnel_step_bindings;
CREATE POLICY "org members manage their funnel_step_bindings"
  ON public.funnel_step_bindings FOR ALL
  USING      (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members manage their funnel_benchmarks" ON public.funnel_benchmarks;
CREATE POLICY "org members manage their funnel_benchmarks"
  ON public.funnel_benchmarks FOR ALL
  USING      (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members manage their funnel_period_snapshots" ON public.funnel_period_snapshots;
CREATE POLICY "org members manage their funnel_period_snapshots"
  ON public.funnel_period_snapshots FOR ALL
  USING      (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- ─── Comentarios ──────────────────────────────────────────────────────────────

COMMENT ON TABLE public.funnel_instances IS
  'Instancia de embudo: una plantilla (en código) aplicada a una oferta concreta de la org. Varias por org — el price point gobierna la comparabilidad.';
COMMENT ON COLUMN public.funnel_instances.template_id IS
  'Id de la plantilla en apps/web/lib/funnels/templates/. Sin FK: el catálogo vive en código, no en la DB.';
COMMENT ON TABLE public.funnel_step_bindings IS
  'Fuente de datos que alimenta cada step. Un step sin binding resuelve a null (sin datos), no a 0.';
COMMENT ON TABLE public.funnel_period_snapshots IS
  'Serie histórica por instancia y período. No usa metrics_snapshots porque su UNIQUE colisiona entre instancias de la misma org.';
