-- Zernio integration per organization
CREATE TABLE IF NOT EXISTS public.zernio_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  zernio_profile_id TEXT NOT NULL,             -- Zernio "Profile" ID (groups accounts)
  connected_accounts JSONB DEFAULT '[]'::jsonb, -- Array de { accountId, platform, username, avatarUrl }
  webhook_secret TEXT,                          -- Para verificar X-Zernio-Signature
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

ALTER TABLE public.zernio_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read zernio_integrations"
  ON public.zernio_integrations FOR SELECT
  USING (organization_id = get_my_organization_id());

CREATE POLICY "org admins can manage zernio_integrations"
  ON public.zernio_integrations FOR ALL
  USING (organization_id = get_my_organization_id());

-- Zernio messages (DMs recibidos y enviados)
CREATE TABLE IF NOT EXISTS public.zernio_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  zernio_message_id TEXT NOT NULL,
  zernio_conversation_id TEXT NOT NULL,
  platform TEXT NOT NULL,                      -- 'instagram' | 'facebook' | 'whatsapp' | etc.
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  text TEXT,
  sender_name TEXT,
  sender_username TEXT,
  sender_avatar_url TEXT,
  is_read BOOLEAN DEFAULT false,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, zernio_message_id)
);

ALTER TABLE public.zernio_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read zernio_messages"
  ON public.zernio_messages FOR SELECT
  USING (organization_id = get_my_organization_id());

CREATE POLICY "org members can insert zernio_messages"
  ON public.zernio_messages FOR INSERT
  WITH CHECK (organization_id = get_my_organization_id());

-- Zernio comments (comentarios en posts)
CREATE TABLE IF NOT EXISTS public.zernio_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  zernio_comment_id TEXT NOT NULL,
  zernio_post_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  author_name TEXT,
  author_username TEXT,
  text TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  is_replied BOOLEAN DEFAULT false,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, zernio_comment_id)
);

ALTER TABLE public.zernio_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read zernio_comments"
  ON public.zernio_comments FOR SELECT
  USING (organization_id = get_my_organization_id());

CREATE POLICY "org members can insert zernio_comments"
  ON public.zernio_comments FOR INSERT
  WITH CHECK (organization_id = get_my_organization_id());

CREATE POLICY "org members can update zernio_comments"
  ON public.zernio_comments FOR UPDATE
  USING (organization_id = get_my_organization_id());
