-- BYOK Claude: ciphertext real (AES-256-GCM en app) + bloqueo de lectura directa
-- del ciphertext para el rol authenticated. Service role sigue con acceso completo.

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

-- Column-level privileges: authenticated puede leer/actualizar org sin ver el ciphertext.
REVOKE ALL ON TABLE public.organizations FROM authenticated;

GRANT SELECT (
  id,
  name,
  status,
  created_at,
  mrr_usd,
  website_url,
  industry,
  timezone,
  currency,
  language,
  account_type,
  holding_billing_model,
  skip_onboarding,
  claude_api_key_status,
  claude_api_key_last_validated_at
) ON public.organizations TO authenticated;

GRANT UPDATE (
  name,
  industry,
  website_url,
  timezone,
  currency,
  language
) ON public.organizations TO authenticated;
