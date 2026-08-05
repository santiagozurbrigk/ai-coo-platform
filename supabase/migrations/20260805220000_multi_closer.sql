-- Multi-closer: vincular closing_calls con el profile del closer
-- Los closers son profiles con custom_role_id → team_roles.name ILIKE 'closer'

-- ─── 1. Columnas en closing_calls ─────────────────────────────────────────────

ALTER TABLE public.closing_calls
  ADD COLUMN IF NOT EXISTS closer_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS calendly_host_uri TEXT;  -- URI del host de Calendly crudo para trazabilidad

CREATE INDEX IF NOT EXISTS closing_calls_closer_id_idx
  ON public.closing_calls (organization_id, closer_id, scheduled_at DESC);

-- ─── 2. Comisión por profile ───────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS commission_pct NUMERIC(5,2) DEFAULT 0
    CHECK (commission_pct >= 0 AND commission_pct <= 100);

COMMENT ON COLUMN public.profiles.commission_pct IS '% de comisión sobre el monto cerrado en closing_calls';
COMMENT ON COLUMN public.closing_calls.closer_id  IS 'Profile del closer que tomó esta llamada (resuelto desde calendly_host_uri en el sync)';
COMMENT ON COLUMN public.closing_calls.calendly_host_uri IS 'URI del member de Calendly que hostea el evento — usado para asignar closer_id';
