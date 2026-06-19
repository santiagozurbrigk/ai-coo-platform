-- BYOK: permitir status valid_no_credits (key reconocida por Anthropic sin saldo)

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_claude_api_key_status_check;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_claude_api_key_status_check
  CHECK (claude_api_key_status IN (
    'none',
    'valid',
    'valid_no_credits',
    'invalid',
    'error'
  ));
