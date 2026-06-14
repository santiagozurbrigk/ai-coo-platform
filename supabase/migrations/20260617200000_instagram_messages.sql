-- Instagram DMs directos: mensajes, threads y origen en conversations

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manychat'
    CHECK (source IN ('manychat', 'instagram', 'manual'));

CREATE TABLE IF NOT EXISTS public.instagram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,

  instagram_message_id TEXT NOT NULL UNIQUE,
  instagram_thread_id TEXT NOT NULL,
  instagram_sender_id TEXT NOT NULL,
  instagram_recipient_id TEXT NOT NULL,

  message_text TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN (
    'text', 'image', 'video', 'audio', 'story_reply',
    'story_mention', 'deleted', 'unsupported'
  )),
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,

  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  timestamp TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,

  conversation_id UUID REFERENCES public.conversations (id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.instagram_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  instagram_thread_id TEXT NOT NULL,
  instagram_user_id TEXT NOT NULL,
  instagram_username TEXT,
  instagram_name TEXT,
  instagram_profile_pic TEXT,
  last_message_at TIMESTAMPTZ,
  message_count INTEGER NOT NULL DEFAULT 0,
  conversation_id UUID REFERENCES public.conversations (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, instagram_thread_id)
);

ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org instagram_messages" ON public.instagram_messages;
CREATE POLICY "Users read org instagram_messages"
  ON public.instagram_messages FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users read org instagram_threads" ON public.instagram_threads;
CREATE POLICY "Users read org instagram_threads"
  ON public.instagram_threads FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE INDEX IF NOT EXISTS instagram_messages_thread_idx
  ON public.instagram_messages (instagram_thread_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS instagram_threads_org_idx
  ON public.instagram_threads (organization_id, last_message_at DESC);
