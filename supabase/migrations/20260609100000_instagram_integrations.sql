-- Instagram OAuth + Graph API (tokens solo vía service role)

create table if not exists public.instagram_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  instagram_user_id text not null,
  instagram_username text,
  access_token text not null,
  token_expires_at timestamptz,
  page_id text,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  status text not null default 'active' check (status in ('active', 'error', 'disconnected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create index if not exists instagram_integrations_org_idx
  on public.instagram_integrations (organization_id);

alter table public.instagram_integrations enable row level security;

-- Sin policies de lectura: access_token solo accesible con service role (createAdminClient).
