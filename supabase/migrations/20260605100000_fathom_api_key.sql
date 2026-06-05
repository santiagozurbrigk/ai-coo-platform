-- Fathom: reemplazar OAuth por API key por organización

alter table public.fathom_integrations
  add column if not exists api_key text;

alter table public.fathom_integrations
  drop column if exists access_token,
  drop column if exists refresh_token,
  drop column if exists token_expires_at;
