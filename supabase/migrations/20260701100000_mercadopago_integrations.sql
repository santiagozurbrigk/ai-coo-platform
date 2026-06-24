-- Mercado Pago Marketplace OAuth (tokens cifrados, solo vía service role)

create table if not exists public.mercadopago_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  mp_user_id text not null,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  public_key text,
  livemode boolean not null default false,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  status text not null default 'active' check (status in ('active', 'error', 'disconnected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create index if not exists mercadopago_integrations_org_idx
  on public.mercadopago_integrations (organization_id);

create index if not exists mercadopago_integrations_mp_user_idx
  on public.mercadopago_integrations (mp_user_id);

alter table public.mercadopago_integrations enable row level security;
