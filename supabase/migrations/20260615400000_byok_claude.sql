-- BYOK: API key de Claude por organización

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS claude_api_key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS claude_api_key_last_validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claude_api_key_status TEXT NOT NULL DEFAULT 'none'
    CHECK (claude_api_key_status IN ('none', 'valid', 'invalid', 'error'));

CREATE OR REPLACE VIEW public.organization_claude_status AS
SELECT
  id,
  CASE
    WHEN claude_api_key_encrypted IS NOT NULL THEN true
    ELSE false
  END AS has_claude_key,
  claude_api_key_status,
  claude_api_key_last_validated_at
FROM public.organizations;

GRANT SELECT ON public.organization_claude_status TO authenticated;
