-- Super-admin Google Drive tokens (keyed by user_id, not organization_id)
CREATE TABLE IF NOT EXISTS public.super_admin_google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  granted_scopes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only service role can access this table (super-admin tokens are sensitive)
ALTER TABLE public.super_admin_google_tokens ENABLE ROW LEVEL SECURITY;
-- No RLS policies = only service role (bypass RLS) can read/write
