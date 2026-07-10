-- Per-organization Zernio API key (replaces OAuth redirect flow)

ALTER TABLE public.zernio_integrations
  ADD COLUMN IF NOT EXISTS api_key TEXT,
  ADD COLUMN IF NOT EXISTS account_name TEXT;
