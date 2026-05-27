-- Oleada F (ManyChat): API key por organización + token de webhook

create table if not exists public.manychat_integrations (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  api_token text not null,
  page_id text,
  page_name text,
  webhook_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists manychat_integrations_webhook_token_idx
  on public.manychat_integrations (webhook_token);

alter table public.manychat_integrations enable row level security;

drop policy if exists "Users read org manychat integration" on public.manychat_integrations;
create policy "Users read org manychat integration"
  on public.manychat_integrations for select
  using (organization_id = public.get_my_organization_id());
