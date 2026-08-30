-- I-5 del plan de integraciones — ver docs/FUNNELS_SOURCE_MAP.md §5
--
-- WebinarJam / EverWebinar: M13 (registrados), M14 (asistieron) y M15 (se
-- quedaron hasta la oferta). Son tres de los cuatro pasos que hoy dejan al
-- embudo Webinar midiendo sólo sus extremos.
--
-- ⭐ M16 (clicks al CTA durante el webinar) **NO se puede medir**: la API no lo
-- expone. Lo más cercano es `purchased_live`, que es conversión y no intención.
-- Presentar una cosa por la otra sería inventar la medida, así que ese paso
-- queda sin fuente a propósito.
--
-- ⭐ POR QUÉ SE PERSISTEN LOS REGISTRANTES Y NO UN AGREGADO
--
-- `/registrants` **no acepta un rango de fechas arbitrario**: su filtro
-- `date_range` es una lista de presets (hoy, ayer, esta semana, últimos 30
-- días…). El módulo de embudos pregunta por períodos arbitrarios.
--
-- La única forma de responder eso es traer las filas y filtrarlas del lado de
-- OTC por `signup_date` y por la fecha de asistencia, que sí vienen por
-- registrante. Por eso hay una tabla de personas y no una de totales.

-- ─── Credenciales por org ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.webinarjam_integrations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  -- La key es de cuenta, no por webinar, y sirve para los dos prefijos.
  api_key_encrypted  text NOT NULL,
  webinars_synced_at timestamptz,
  registrants_synced_at timestamptz,
  last_error         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id)
);

ALTER TABLE public.webinarjam_integrations ENABLE ROW LEVEL SECURITY;

-- ─── Catálogo de webinars ─────────────────────────────────────────────────────
--
-- `product` distingue los dos prefijos de la misma API: `/webinarjam/*` para los
-- webinars en vivo y `/everwebinar/*` para los automatizados. No hay que elegir
-- uno: el sync consulta los dos y guarda de dónde vino cada webinar.

CREATE TABLE IF NOT EXISTS public.webinarjam_webinars (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  product          text NOT NULL CHECK (product IN ('webinarjam', 'everwebinar')),
  external_id      text NOT NULL,
  name             text,
  title            text,
  webinar_type     text,
  timezone         text,
  -- Horarios con su `schedule` id. ⚠️ El id que devuelve la API NO es el que se
  -- ve en la pestaña Schedules del panel: hay que usar el de la API.
  schedules        jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Segundo del webinar en el que aparece la oferta. Lo configura el usuario en
  -- OTC: la API de WebinarJam no lo expone (a diferencia de VTurb).
  pitch_second     integer,
  raw              jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at        timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, product, external_id)
);

CREATE INDEX IF NOT EXISTS webinarjam_webinars_org_idx
  ON public.webinarjam_webinars (organization_id, name);

-- ─── Registrantes ─────────────────────────────────────────────────────────────
--
-- Una fila por persona por sesión. Los conteos del embudo salen de contar estas
-- filas dentro del período.
--
-- Los tres campos de asistencia son **nullable a propósito**: `NULL` significa
-- "la API no lo dijo", que no es lo mismo que `false`. Un `false` afirma que la
-- persona no asistió; un `NULL` dice que no se sabe.

CREATE TABLE IF NOT EXISTS public.webinarjam_registrants (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  product                text NOT NULL CHECK (product IN ('webinarjam', 'everwebinar')),
  webinar_external_id    text NOT NULL,
  schedule_external_id   text,
  email                  text NOT NULL,
  first_name             text,
  last_name              text,
  signup_at              timestamptz,
  attended_live          boolean,
  attended_replay        boolean,
  live_watched_at        timestamptz,
  replay_watched_at      timestamptz,
  -- `true` sólo si la consulta filtrada por el segundo del pitch lo confirmó.
  -- `NULL` mientras no haya `pitch_second` configurado: sin saber en qué segundo
  -- está la oferta, no se puede decir quién se quedó hasta ella.
  stayed_past_pitch      boolean,
  purchased_live         boolean,
  purchased_replay       boolean,
  utm_source             text,
  utm_medium             text,
  utm_campaign           text,
  raw                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, product, webinar_external_id, schedule_external_id, email)
);

CREATE INDEX IF NOT EXISTS webinarjam_registrants_signup_idx
  ON public.webinarjam_registrants (organization_id, webinar_external_id, signup_at DESC);
CREATE INDEX IF NOT EXISTS webinarjam_registrants_live_idx
  ON public.webinarjam_registrants (organization_id, webinar_external_id, live_watched_at DESC);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.webinarjam_webinars    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinarjam_registrants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "org members read their webinarjam_webinars" ON public.webinarjam_webinars;
CREATE POLICY "org members read their webinarjam_webinars"
  ON public.webinarjam_webinars FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "org members read their webinarjam_registrants" ON public.webinarjam_registrants;
CREATE POLICY "org members read their webinarjam_registrants"
  ON public.webinarjam_registrants FOR SELECT
  USING (organization_id = public.get_my_organization_id());

COMMENT ON TABLE public.webinarjam_registrants IS
  'Una fila por registrante y sesión. Existe porque /registrants no acepta rangos de fecha arbitrarios: el filtro por período lo hace OTC sobre estas filas.';
COMMENT ON COLUMN public.webinarjam_registrants.stayed_past_pitch IS
  'NULL mientras el webinar no tenga pitch_second configurado. NULL es "no se sabe", no "no se quedó".';
COMMENT ON COLUMN public.webinarjam_webinars.pitch_second IS
  'Segundo en el que aparece la oferta. Lo configura el usuario: la API de WebinarJam no lo expone.';
