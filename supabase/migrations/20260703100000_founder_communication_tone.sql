-- Tono de comunicación del founder: detectado por IA, uso interno en prompts.
-- Nunca se expone al cliente; solo se consume vía admin client desde el servidor.

CREATE TABLE IF NOT EXISTS public.founder_communication_tone (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations (id) ON DELETE CASCADE,
  tone_description TEXT NOT NULL,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_summary JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.founder_communication_tone ENABLE ROW LEVEL SECURITY;

-- Nadie lee esto directamente desde el cliente — solo se consume desde el
-- servidor al construir prompts. Deny-all para clientes; acceso exclusivo
-- vía admin client (service role) que bypassea RLS.
DROP POLICY IF EXISTS "deny_all" ON public.founder_communication_tone;
CREATE POLICY "deny_all"
  ON public.founder_communication_tone
  FOR ALL
  USING (false)
  WITH CHECK (false);
