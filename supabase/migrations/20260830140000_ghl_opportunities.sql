-- I-4 del plan de integraciones — ver docs/FUNNELS_SOURCE_MAP.md §5
--
-- Oportunidades de GoHighLevel: M21, M22, M23 y M25 del mapa de fuentes, que son
-- 4 de los 6 pasos del embudo DM.
--
-- ⭐ LA DECISIÓN QUE MANDA EL MODELO
--
-- La API v3 de GHL **no expone historial de cambios de etapa** (verificado el
-- 2026-08-30 contra docs/external-apis/gohighlevel/: no hay endpoint de
-- historial, la búsqueda no filtra por transición, y `OpportunityStageUpdate`
-- trae la etapa nueva pero no la anterior).
--
-- El documento fuente pide conteos por etapa **durante un período**, no el
-- estado de hoy. Con sólo el REST, una oportunidad que pasó por tres etapas
-- dentro del período se contaría una sola vez, en la última.
--
-- Por eso OTC construye su propio historial: `ghl_stage_transitions` guarda cada
-- transición derivada contra la última etapa conocida, y `ghl_opportunities`
-- guarda el estado actual que sirve de "última etapa conocida".
--
-- ⭐ EL PERÍODO CIEGO
--
-- Ese historial arranca el día que llega el primer webhook. Antes de esa fecha
-- OTC no sabe nada, y un cero ahí sería exactamente el error de §9.1 de
-- FUNNELS_ARCHITECTURE.md: decir "no pasó nada" cuando la verdad es "no lo
-- sabemos". `ghl_integrations.stage_history_since` marca el borde, y el
-- resolver devuelve `null` para cualquier período que empiece antes.

-- ─── Columnas nuevas en la integración ────────────────────────────────────────

ALTER TABLE public.ghl_integrations
  ADD COLUMN IF NOT EXISTS webhook_secret_encrypted text,
  -- Borde del período ciego: primera transición que OTC pudo observar.
  ADD COLUMN IF NOT EXISTS stage_history_since timestamptz,
  ADD COLUMN IF NOT EXISTS selected_pipeline_ids text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pipelines_synced_at timestamptz;

COMMENT ON COLUMN public.ghl_integrations.stage_history_since IS
  'Momento de la primera transición observada. Antes de esta fecha OTC no tiene historial y los conteos por etapa resuelven a NULL, no a 0.';
COMMENT ON COLUMN public.ghl_integrations.webhook_secret_encrypted IS
  'Secreto compartido para la vía de entrega por Workflow de GHL, cifrado. La vía de app del Marketplace usa la firma Ed25519 de la plataforma y no necesita secreto.';

-- ─── Pipelines y etapas ───────────────────────────────────────────────────────
--
-- La doc oficial NO expande el objeto `pipeline` ni el de sus etapas: dice
-- literalmente `pipelines: object[]`. Por eso se guarda `raw` con el objeto
-- completo tal como llegó, y los campos mapeados son los que se pudieron
-- inferir. Regla 3 de CLAUDE.md: el primer response real es la fuente de verdad.

CREATE TABLE IF NOT EXISTS public.ghl_pipelines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  location_id     text NOT NULL,
  external_id     text NOT NULL,
  name            text,
  raw             jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, external_id)
);

CREATE TABLE IF NOT EXISTS public.ghl_pipeline_stages (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  pipeline_external_id text NOT NULL,
  external_id          text NOT NULL,
  name                 text,
  position             integer,
  raw                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at            timestamptz NOT NULL DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, external_id)
);

CREATE INDEX IF NOT EXISTS ghl_pipeline_stages_pipeline_idx
  ON public.ghl_pipeline_stages (organization_id, pipeline_external_id, position);

-- ─── Oportunidades: el estado actual ──────────────────────────────────────────
--
-- No es la fuente de los conteos por período — es la "última etapa conocida"
-- contra la que se deriva cada transición, porque el webhook no la trae.

CREATE TABLE IF NOT EXISTS public.ghl_opportunities (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id      uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  external_id          text NOT NULL,
  location_id          text,
  contact_id           text,
  pipeline_external_id text,
  stage_external_id    text,
  status               text,
  name                 text,
  source               text,
  monetary_value       numeric(14, 2),
  -- Fecha de creación de la oportunidad en GHL (`dateAdded` del webhook).
  date_added           timestamptz,
  -- Momento en que OTC vio esta oportunidad por primera vez.
  first_seen_at        timestamptz NOT NULL DEFAULT now(),
  -- Momento de la última transición observada por OTC.
  last_stage_change_at timestamptz,
  raw                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, external_id)
);

CREATE INDEX IF NOT EXISTS ghl_opportunities_pipeline_idx
  ON public.ghl_opportunities (organization_id, pipeline_external_id, stage_external_id);

-- ─── Transiciones: el historial propio ────────────────────────────────────────
--
-- Esta tabla es la que responde "cuántas oportunidades pasaron por esta etapa
-- durante el período". Es la razón de ser de I-4.
--
-- `occurred_at` es el momento en que OTC recibió el evento, NO `dateAdded`:
-- `dateAdded` es la fecha de creación de la oportunidad y no cambia con las
-- transiciones. GHL no manda el timestamp del cambio.

CREATE TABLE IF NOT EXISTS public.ghl_stage_transitions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id          uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  opportunity_external_id  text NOT NULL,
  pipeline_external_id     text,
  -- NULL cuando es la primera vez que OTC ve la oportunidad: no hay etapa
  -- anterior conocida, y decir que venía de la etapa 1 sería inventar.
  from_stage_external_id   text,
  to_stage_external_id     text,
  -- 'created' | 'stage_change' | 'status_change'
  kind                     text NOT NULL CHECK (kind IN ('created', 'stage_change', 'status_change')),
  status                   text,
  occurred_at              timestamptz NOT NULL,
  -- Id del evento de GHL, para no contar dos veces una reentrega.
  external_event_id        text,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ghl_stage_transitions_period_idx
  ON public.ghl_stage_transitions (organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ghl_stage_transitions_stage_idx
  ON public.ghl_stage_transitions (organization_id, to_stage_external_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS ghl_stage_transitions_opportunity_idx
  ON public.ghl_stage_transitions (organization_id, opportunity_external_id, occurred_at DESC);

-- Una reentrega del mismo evento no debe sumar una transición de más.
CREATE UNIQUE INDEX IF NOT EXISTS ghl_stage_transitions_event_dedupe_idx
  ON public.ghl_stage_transitions (organization_id, external_event_id)
  WHERE external_event_id IS NOT NULL;

-- ─── Eventos crudos ───────────────────────────────────────────────────────────
--
-- Mismo criterio que `payment_webhook_events`: se guarda el evento ANTES de
-- interpretarlo. La doc de GHL no expande el objeto `opportunity` de las
-- respuestas REST, así que el payload real es lo único que permite corregir el
-- mapeo sin adivinar.

CREATE TABLE IF NOT EXISTS public.ghl_webhook_events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid REFERENCES public.organizations (id) ON DELETE CASCADE,
  event_type        text,
  external_event_id text,
  -- 'platform_ed25519' | 'platform_rsa_legacy' | 'workflow_shared_secret'
  auth_path         text,
  payload           jsonb NOT NULL,
  -- 'pending' | 'processed' | 'unmapped' | 'duplicate' | 'error'
  status            text NOT NULL DEFAULT 'pending',
  error_message     text,
  received_at       timestamptz NOT NULL DEFAULT now(),
  processed_at      timestamptz
);

CREATE INDEX IF NOT EXISTS ghl_webhook_events_status_idx
  ON public.ghl_webhook_events (status, received_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS ghl_webhook_events_dedupe_idx
  ON public.ghl_webhook_events (external_event_id)
  WHERE external_event_id IS NOT NULL;

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.ghl_pipelines         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_pipeline_stages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_opportunities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghl_webhook_events    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read their ghl_pipelines" ON public.ghl_pipelines;
CREATE POLICY "org members read their ghl_pipelines"
  ON public.ghl_pipelines FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members read their ghl_pipeline_stages" ON public.ghl_pipeline_stages;
CREATE POLICY "org members read their ghl_pipeline_stages"
  ON public.ghl_pipeline_stages FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members read their ghl_opportunities" ON public.ghl_opportunities;
CREATE POLICY "org members read their ghl_opportunities"
  ON public.ghl_opportunities FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members read their ghl_stage_transitions" ON public.ghl_stage_transitions;
CREATE POLICY "org members read their ghl_stage_transitions"
  ON public.ghl_stage_transitions FOR SELECT
  USING (organization_id = public.get_my_organization_id());

-- `ghl_webhook_events` queda sin políticas: guarda payloads crudos con datos
-- personales del contacto. Sólo servidor, con service role.

COMMENT ON TABLE public.ghl_stage_transitions IS
  'Historial de transiciones de etapa construido por OTC a partir de los webhooks. GHL no expone historial: sin esta tabla no se puede contar cuántas oportunidades pasaron por una etapa durante un período.';
COMMENT ON COLUMN public.ghl_stage_transitions.occurred_at IS
  'Momento de recepción del webhook. GHL no manda el timestamp del cambio de etapa; dateAdded es la fecha de creación de la oportunidad y no sirve.';
COMMENT ON TABLE public.ghl_webhook_events IS
  'Webhooks crudos de GHL tal como llegaron. La doc no expande el objeto opportunity de las respuestas REST: el payload real es lo único que permite corregir el mapeo.';
