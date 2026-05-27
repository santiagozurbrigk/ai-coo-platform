-- Ejecutar TODO este archivo en Supabase → SQL Editor → Run
-- (seguro re-ejecutar: usa IF NOT EXISTS / políticas con drop previo)

-- Helper RLS (evita recursión infinita en profiles)
create or replace function public.get_my_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

revoke all on function public.get_my_organization_id() from public;
grant execute on function public.get_my_organization_id() to authenticated;

-- 1) Organizaciones + perfiles
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'churned')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'founder' check (role in (
    'founder', 'admin', 'project_manager', 'setter', 'operator', 'viewer'
  )),
  created_at timestamptz not null default now()
);

create index if not exists profiles_organization_id_idx on public.profiles (organization_id);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Users read own org" on public.organizations;
create policy "Users read own org"
  on public.organizations for select
  using (id = public.get_my_organization_id());

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "Users read org profiles" on public.profiles;
create policy "Users read org profiles"
  on public.profiles for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- 2) Clientes
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  join_date date not null default current_date,
  payment_type text not null check (
    payment_type in ('upfront', 'installments', 'upfront_fee')
  ),
  platform text not null check (
    platform in ('stripe', 'mercadopago', 'paypal', 'bank_transfer', 'other')
  ),
  total_amount numeric(12, 2) not null default 0,
  upfront_amount numeric(12, 2),
  fee_amount numeric(12, 2),
  fee_frequency text check (fee_frequency in ('monthly', 'weekly')),
  status text not null default 'pending_onboarding' check (
    status in ('pending_onboarding', 'onboarding_done', 'active', 'success_case')
  ),
  is_success_case boolean not null default false,
  installments jsonb not null default '[]'::jsonb,
  sales_fathom_url text,
  closing_call_id text,
  ai_insights jsonb not null default '[]'::jsonb,
  linked_calls jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_organization_id_idx on public.clients (organization_id);

alter table public.clients enable row level security;

drop policy if exists "Users read org clients" on public.clients;
create policy "Users read org clients"
  on public.clients for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org clients" on public.clients;
create policy "Users insert org clients"
  on public.clients for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org clients" on public.clients;
create policy "Users update org clients"
  on public.clients for update
  using (organization_id = public.get_my_organization_id());

-- 3) Conversaciones (Oleada C) — requiere closing_calls para FK opcional en archivo aparte
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_name text not null,
  status text not null default 'active' check (
    status in ('active', 'ghosted', 'booked', 'closed')
  ),
  tag text check (
    tag is null
    or tag in (
      'muy-calificado', 'calificado', 'descalificado', 'muy-descalificado',
      'agendado', 'closeado', 'no-closeado'
    )
  ),
  last_message text not null default '',
  last_message_at timestamptz not null default now(),
  unread boolean not null default false,
  messages jsonb not null default '[]'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversations_org_external_ref_idx
  on public.conversations (organization_id, external_ref)
  where external_ref is not null;

create index if not exists conversations_organization_id_idx
  on public.conversations (organization_id);

alter table public.conversations enable row level security;

drop policy if exists "Users read org conversations" on public.conversations;
create policy "Users read org conversations"
  on public.conversations for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org conversations" on public.conversations;
create policy "Users insert org conversations"
  on public.conversations for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org conversations" on public.conversations;
create policy "Users update org conversations"
  on public.conversations for update
  using (organization_id = public.get_my_organization_id());

-- Tras crear conversations, ejecuta también:
-- supabase/migrations/20260521510000_closing_conversation_fk.sql

-- 4) ManyChat (Oleada F)
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
