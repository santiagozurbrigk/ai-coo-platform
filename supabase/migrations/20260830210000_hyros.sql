-- I-8 del plan de integraciones — ver docs/FUNNELS_SOURCE_MAP.md §5 y §8
--
-- Hyros es el dueño de la atribución según el documento fuente:
--   "Report both blended (all revenue ÷ all spend) and by-source from Hyros.
--    Blended is the truth; by-source is the steering wheel."
--
-- Cubre M05 (revenue atribuido por fuente), M06 (leads atribuidos), M08
-- (visitantes de landing) y M09 (opt-ins). M07 (journeys) se consulta en vivo.
--
-- ⭐ POR QUÉ ESTA UNIDAD ABSORBIÓ A I-7
--
-- Los clientes despliegan sus landings en Vercel, que es hosting y no tiene un
-- concepto de "opt-in" que OTC pueda leer. Pero el script de Hyros ya va a estar
-- en esas páginas, y su endpoint de leads devuelve los opt-ins con su fecha.
-- Por eso M08 y M09 salen de acá y `I-7` dejó de existir como unidad aparte.
--
-- ⭐ POR QUÉ HAY CACHÉ Y NO MÉTRICAS DIARIAS
--
-- Mismo motivo que VTurb: el reporte de atribución se pide por rango exacto y
-- varias de sus métricas son promedios o ratios que no se pueden sumar entre
-- días. Además Hyros limita a 30 req/segundo y 1000 por minuto, y una consulta
-- de atribución recorre todas las fuentes de una cuenta publicitaria.

-- ─── Credenciales por org ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.hyros_integrations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  api_key_encrypted     text NOT NULL,
  -- Header opcional `Accessible-Account-Id`: permite operar sobre una cuenta
  -- cliente conectada cuando la key es de una agencia. El rate limit siempre se
  -- cuenta contra el dueño de la key, no contra la cuenta accedida.
  accessible_account_id text,
  -- Modelo de atribución con el que se piden los reportes. Cambiarlo cambia los
  -- números, así que es configuración explícita de la org y no un default oculto.
  attribution_model     text NOT NULL DEFAULT 'last_click'
                          CHECK (attribution_model IN ('last_click', 'first_click', 'scientific')),
  ad_accounts_synced_at timestamptz,
  last_error            text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id)
);

ALTER TABLE public.hyros_integrations ENABLE ROW LEVEL SECURITY;

-- ─── Cuentas publicitarias conectadas a Hyros ─────────────────────────────────
--
-- El reporte de atribución exige `ids`: no se puede pedir "todo". Hay que
-- nombrar las cuentas, y esta tabla es de dónde salen.

CREATE TABLE IF NOT EXISTS public.hyros_ad_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  external_id     text NOT NULL,
  name            text,
  account_type    text,
  -- Si está en false, sus números no entran en los totales del embudo.
  is_active       boolean NOT NULL DEFAULT true,
  raw             jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at       timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, external_id)
);

-- ─── Caché del reporte de atribución ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.hyros_attribution_cache (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  start_date         date NOT NULL,
  end_date           date NOT NULL,
  attribution_model  text NOT NULL,
  -- Respuesta cruda, una entrada por cuenta publicitaria consultada.
  payload            jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_final           boolean NOT NULL DEFAULT false,
  error_message      text,
  fetched_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, start_date, end_date, attribution_model)
);

CREATE INDEX IF NOT EXISTS hyros_attribution_cache_lookup_idx
  ON public.hyros_attribution_cache (organization_id, start_date, end_date);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.hyros_ad_accounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hyros_attribution_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read their hyros_ad_accounts" ON public.hyros_ad_accounts;
CREATE POLICY "org members read their hyros_ad_accounts"
  ON public.hyros_ad_accounts FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members read their hyros_attribution_cache" ON public.hyros_attribution_cache;
CREATE POLICY "org members read their hyros_attribution_cache"
  ON public.hyros_attribution_cache FOR SELECT
  USING (organization_id = public.get_my_organization_id());

COMMENT ON TABLE public.hyros_attribution_cache IS
  'Reporte de atribución crudo por período y modelo. El modelo forma parte de la llave: cambiarlo cambia los números, así que dos modelos no comparten caché.';
COMMENT ON COLUMN public.hyros_integrations.attribution_model IS
  'last_click, first_click o scientific. Cambia los números del reporte: es configuración explícita, no un default oculto.';
