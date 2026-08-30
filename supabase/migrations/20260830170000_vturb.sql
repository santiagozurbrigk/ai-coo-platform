-- I-6 del plan de integraciones — ver docs/FUNNELS_SOURCE_MAP.md §5
--
-- VTurb es el hosting de video que el equipo usa para los VSL. Alimenta la etapa
-- Engaged del embudo VSL: M08 (visitantes de la página), M10 (reproducciones),
-- M11 (% promedio visto) y M12 (llegaron al CTA).
--
-- ⭐ POR QUÉ HAY UNA TABLA DE CACHÉ Y NO UNA DE MÉTRICAS DIARIAS
--
-- `ad_metrics_daily` guarda una fila por día y suma. Con VTurb eso no sirve:
-- `engagement_rate` es un **promedio**, y un promedio de promedios diarios no es
-- el promedio del período (cada día pesa distinto según cuántas sesiones tuvo).
-- Sumar el `engagement_rate` de 30 días daría un número sin significado.
--
-- Por eso se le pide a VTurb el período exacto y se cachea la respuesta cruda
-- por (player, start_date, end_date). Además respeta sus cuotas, que son
-- ajustadas: 60-800 requests por minuto según el plan, y una sola llamada HTTP
-- puede contar como más de una query.

-- ─── Credenciales por org ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vturb_integrations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  api_key_encrypted  text NOT NULL,
  -- Zona horaria con la que se le piden los períodos a VTurb.
  timezone           text NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  players_synced_at  timestamptz,
  last_error         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id)
);

-- Sin políticas de RLS a propósito: guarda el token de la cuenta y sólo se lee
-- desde el servidor con service role, igual que el resto de las integraciones.
ALTER TABLE public.vturb_integrations ENABLE ROW LEVEL SECURITY;

-- ─── Catálogo de players ──────────────────────────────────────────────────────
--
-- `pitch_time` es el dato que hace que M12 sea confiable: VTurb ya modela "en qué
-- segundo está la oferta" y no hay que configurarlo a mano en OTC. Un player con
-- `pitch_time = 0` no lo tiene configurado, y ahí `total_over_pitch` no significa
-- nada — ver lib/vturb/resolve-stats.ts.

CREATE TABLE IF NOT EXISTS public.vturb_players (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  external_id      text NOT NULL,
  name             text,
  duration_seconds integer,
  -- Segundo del pitch según VTurb. 0 = el player no lo tiene configurado.
  pitch_time       integer,
  raw              jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at        timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, external_id)
);

CREATE INDEX IF NOT EXISTS vturb_players_org_idx
  ON public.vturb_players (organization_id, name);

-- ─── Caché de estadísticas por período ────────────────────────────────────────
--
-- Guarda la respuesta **cruda** de VTurb antes de interpretarla, como pide la
-- regla 3 de CLAUDE.md: el spec no describe la semántica de ningún campo de
-- `Stats` (qué cuenta como `viewed` contra `started`, qué deduplican los sufijos
-- `_uniq`), así que el primer response real es la fuente de verdad.
--
-- `is_final` distingue un período cerrado de uno que incluye hoy: el primero no
-- va a cambiar nunca y se puede cachear indefinidamente; el segundo se refresca.

CREATE TABLE IF NOT EXISTS public.vturb_stats_cache (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  player_external_id text NOT NULL,
  start_date         date NOT NULL,
  end_date           date NOT NULL,
  -- Respuesta cruda de POST /sessions/stats
  stats              jsonb,
  -- Respuesta cruda de POST /times/user_engagement (incluye la curva)
  engagement         jsonb,
  -- `pitch_time` con el que se pidió: cambia el significado de total_over_pitch.
  pitch_time         integer,
  is_final           boolean NOT NULL DEFAULT false,
  error_message      text,
  fetched_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, player_external_id, start_date, end_date)
);

CREATE INDEX IF NOT EXISTS vturb_stats_cache_lookup_idx
  ON public.vturb_stats_cache (organization_id, player_external_id, start_date, end_date);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.vturb_players     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vturb_stats_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read their vturb_players" ON public.vturb_players;
CREATE POLICY "org members read their vturb_players"
  ON public.vturb_players FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members read their vturb_stats_cache" ON public.vturb_stats_cache;
CREATE POLICY "org members read their vturb_stats_cache"
  ON public.vturb_stats_cache FOR SELECT
  USING (organization_id = public.get_my_organization_id());

COMMENT ON TABLE public.vturb_stats_cache IS
  'Respuesta cruda de VTurb por período. No es una tabla de métricas diarias a propósito: engagement_rate es un promedio y no se puede sumar entre días.';
COMMENT ON COLUMN public.vturb_players.pitch_time IS
  'Segundo del pitch según VTurb. 0 significa que el player no lo tiene configurado, y en ese caso total_over_pitch no representa "llegó al CTA".';
