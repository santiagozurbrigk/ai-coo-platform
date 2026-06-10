-- Stripe Connect OAuth (tokens solo vía service role)

create table if not exists public.stripe_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_account_id text not null,
  access_token text not null,
  livemode boolean not null default false,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  status text not null default 'active' check (status in ('active', 'error', 'disconnected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create index if not exists stripe_integrations_org_idx
  on public.stripe_integrations (organization_id);

alter table public.stripe_integrations enable row level security;
