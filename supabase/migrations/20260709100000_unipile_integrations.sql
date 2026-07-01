-- Unipile: Instagram DMs + WhatsApp (mensajería vía API intermediaria)

CREATE TABLE IF NOT EXISTS public.unipile_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  unipile_account_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('instagram', 'whatsapp')),
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'connected'
    CHECK (status IN ('connected', 'disconnected', 'error')),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, unipile_account_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS unipile_integrations_org_provider_idx
  ON public.unipile_integrations (organization_id, provider)
  WHERE status = 'connected';

ALTER TABLE public.unipile_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own org unipile" ON public.unipile_integrations;
CREATE POLICY "Users manage own org unipile" ON public.unipile_integrations
  FOR ALL USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- Ampliar origen de conversaciones para WhatsApp
ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_source_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_source_check
  CHECK (source IN ('manychat', 'instagram', 'manual', 'whatsapp'));
