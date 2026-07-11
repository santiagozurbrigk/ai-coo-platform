-- Dual AI credentials: OAuth (suscripción) + API key fallback

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS claude_oauth_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS claude_oauth_refresh_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS claude_oauth_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claude_credential_mode TEXT NOT NULL DEFAULT 'api_key_active'
    CHECK (claude_credential_mode IN ('oauth_active', 'api_key_active', 'oauth_degraded')),
  ADD COLUMN IF NOT EXISTS claude_oauth_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claude_oauth_last_probe_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claude_oauth_last_success_at TIMESTAMPTZ;

-- Orgs con API key existente: modo api_key_active (default ya aplica)
UPDATE public.organizations
SET claude_credential_mode = 'api_key_active'
WHERE claude_api_key_encrypted IS NOT NULL
  AND claude_credential_mode IS DISTINCT FROM 'oauth_active';

CREATE OR REPLACE VIEW public.organization_claude_status AS
SELECT
  id,
  CASE
    WHEN claude_api_key_encrypted IS NOT NULL THEN true
    ELSE false
  END AS has_claude_key,
  claude_api_key_status,
  claude_api_key_last_validated_at,
  CASE
    WHEN claude_oauth_token_encrypted IS NOT NULL THEN true
    ELSE false
  END AS has_claude_oauth,
  claude_credential_mode,
  claude_oauth_failed_at,
  claude_oauth_last_probe_at,
  claude_oauth_last_success_at
FROM public.organizations;

GRANT SELECT ON public.organization_claude_status TO authenticated;

-- Metadatos no sensibles visibles para authenticated
GRANT SELECT (
  claude_credential_mode,
  claude_oauth_failed_at,
  claude_oauth_last_probe_at,
  claude_oauth_last_success_at
) ON public.organizations TO authenticated;
