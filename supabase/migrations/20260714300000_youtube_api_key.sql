-- Add API key auth method to youtube_integrations
ALTER TABLE public.youtube_integrations
  ADD COLUMN IF NOT EXISTS youtube_api_key TEXT,
  ADD COLUMN IF NOT EXISTS auth_method TEXT NOT NULL DEFAULT 'oauth'
    CHECK (auth_method IN ('oauth', 'api_key'));

-- Upgrade read-only policy to full management so users can upsert via API key flow
DROP POLICY IF EXISTS "Users read org youtube integration" ON public.youtube_integrations;
CREATE POLICY "Users manage own org youtube integration"
  ON public.youtube_integrations FOR ALL
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());
