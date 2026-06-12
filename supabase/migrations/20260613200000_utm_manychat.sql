-- UTM links: soporte ManyChat ref + atribución en conversaciones

ALTER TABLE public.utm_links
  ADD COLUMN IF NOT EXISTS manychat_page_id TEXT,
  ADD COLUMN IF NOT EXISTS manychat_ref TEXT,
  ADD COLUMN IF NOT EXISTS manychat_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_username TEXT,
  ADD COLUMN IF NOT EXISTS link_type TEXT NOT NULL DEFAULT 'landing'
    CHECK (link_type IN ('landing', 'manychat', 'both'));

CREATE INDEX IF NOT EXISTS utm_links_org_manychat_ref_idx
  ON public.utm_links (organization_id, manychat_ref)
  WHERE manychat_ref IS NOT NULL;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_link_id UUID REFERENCES public.utm_links (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_video_title TEXT;

CREATE INDEX IF NOT EXISTS conversations_utm_link_id_idx
  ON public.conversations (utm_link_id)
  WHERE utm_link_id IS NOT NULL;
