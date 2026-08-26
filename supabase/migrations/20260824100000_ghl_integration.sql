-- GoHighLevel integration
-- Tabla de credenciales por organización + columnas de idempotencia en closing_calls

-- ─── 1. Tabla ghl_integrations ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ghl_integrations (
  organization_id     uuid PRIMARY KEY REFERENCES public.organizations (id) ON DELETE CASCADE,
  api_key_encrypted   text NOT NULL,       -- cifrado con ENCRYPTION_MASTER_KEY (AES-256-GCM)
  location_id         text NOT NULL,       -- GHL Sub-account/Location ID
  default_calendar_id text,               -- calendario elegido por el usuario
  connected_calendars jsonb NOT NULL DEFAULT '[]'::jsonb,  -- lista de {id, name} disponibles
  last_sync_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Sin RLS SELECT: los secrets solo se leen con createAdminClient() (service role)
ALTER TABLE public.ghl_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own ghl integration" ON public.ghl_integrations;
CREATE POLICY "Users insert own ghl integration"
  ON public.ghl_integrations FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update own ghl integration" ON public.ghl_integrations;
CREATE POLICY "Users update own ghl integration"
  ON public.ghl_integrations FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete own ghl integration" ON public.ghl_integrations;
CREATE POLICY "Users delete own ghl integration"
  ON public.ghl_integrations FOR DELETE
  USING (organization_id = public.get_my_organization_id());

-- ─── 2. Columnas en closing_calls para GHL ───────────────────────────────────
ALTER TABLE public.closing_calls
  ADD COLUMN IF NOT EXISTS ghl_appointment_id text;

ALTER TABLE public.closing_calls
  ADD COLUMN IF NOT EXISTS ghl_calendar_id text;

-- Idempotencia: mismo appointment no genera duplicados por org
CREATE UNIQUE INDEX IF NOT EXISTS closing_calls_org_ghl_appointment_id_idx
  ON public.closing_calls (organization_id, ghl_appointment_id)
  WHERE ghl_appointment_id IS NOT NULL;
