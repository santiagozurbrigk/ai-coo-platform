-- ─── Lead Magnets ──────────────────────────────────────────────────────────────

CREATE TYPE public.lead_magnet_type AS ENUM (
  'documento',
  'loom',
  'dashboard',
  'landing',
  'otro'
);

CREATE TYPE public.lead_magnet_channel AS ENUM (
  'manychat',
  'typeform',
  'google_forms',
  'landing',
  'instagram_dm',
  'manual'
);

CREATE TABLE public.lead_magnets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  type              public.lead_magnet_type NOT NULL DEFAULT 'documento',
  channel           public.lead_magnet_channel NOT NULL DEFAULT 'manual',
  asset_url         TEXT,                        -- URL del recurso (PDF, Loom, landing, etc.)
  redirect_url      TEXT,                        -- URL de redirección OTC para tracking de clicks
  -- ManyChat
  manychat_flow_id  TEXT,                        -- ns del flow en ManyChat
  manychat_flow_name TEXT,
  -- Formularios
  form_id           TEXT,                        -- ID del formulario (Typeform o Google Forms)
  form_source       TEXT,                        -- 'typeform' | 'google_forms'
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX lead_magnets_org_idx ON public.lead_magnets (organization_id, status, created_at DESC);

-- ─── Lead Magnet Leads ─────────────────────────────────────────────────────────

CREATE TABLE public.lead_magnet_leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  lead_magnet_id      UUID NOT NULL REFERENCES public.lead_magnets (id) ON DELETE CASCADE,
  email               TEXT,
  name                TEXT,
  channel             public.lead_magnet_channel NOT NULL,
  -- Atribución
  attributed_client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  attributed_at       TIMESTAMPTZ,
  -- Metadata del origen
  conversation_id     TEXT,                      -- ID conversación Zernio (si viene de IG DM)
  form_response_id    TEXT,                      -- ID de respuesta del formulario
  manychat_subscriber_id TEXT,
  -- Clicks (para links de redirección)
  click_count         INT NOT NULL DEFAULT 0,
  last_clicked_at     TIMESTAMPTZ,
  captured_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX lm_leads_org_lm_idx   ON public.lead_magnet_leads (organization_id, lead_magnet_id, captured_at DESC);
CREATE INDEX lm_leads_email_idx    ON public.lead_magnet_leads (organization_id, email);
CREATE INDEX lm_leads_client_idx   ON public.lead_magnet_leads (attributed_client_id);
CREATE INDEX lm_leads_conv_idx     ON public.lead_magnet_leads (conversation_id) WHERE conversation_id IS NOT NULL;

-- ─── Click tracking ────────────────────────────────────────────────────────────

CREATE TABLE public.lead_magnet_clicks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id  UUID NOT NULL REFERENCES public.lead_magnets (id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  ip_hash         TEXT,
  user_agent      TEXT,
  clicked_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX lm_clicks_lm_idx ON public.lead_magnet_clicks (lead_magnet_id, clicked_at DESC);

-- ─── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.lead_magnets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnet_leads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnet_clicks  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can manage lead_magnets"
  ON public.lead_magnets FOR ALL
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "org members can manage lead_magnet_leads"
  ON public.lead_magnet_leads FOR ALL
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "org members can view lead_magnet_clicks"
  ON public.lead_magnet_clicks FOR SELECT
  USING (organization_id = public.get_my_organization_id());

-- ─── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER lead_magnets_updated_at
  BEFORE UPDATE ON public.lead_magnets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.lead_magnets      IS 'Lead magnets registrados por organización';
COMMENT ON TABLE public.lead_magnet_leads IS 'Leads que recibieron cada lead magnet, con atribución a cliente';
