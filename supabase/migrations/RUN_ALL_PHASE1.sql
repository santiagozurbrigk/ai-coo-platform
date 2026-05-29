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

-- 5) Gastos y finanzas (Oleada G) — copia de 20260521800000_finance_expenses.sql

create table if not exists public.payment_platforms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text,
  currency text not null default 'USD',
  account_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payment_platforms_org_slug_idx
  on public.payment_platforms (organization_id, slug)
  where slug is not null;

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  category text not null default 'other' check (
    category in ('infrastructure', 'professional', 'marketing', 'tools', 'other')
  ),
  amount numeric not null check (amount >= 0),
  currency text not null default 'USD',
  frequency text not null default 'monthly' check (frequency in ('monthly', 'annual')),
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  amount numeric not null check (amount >= 0),
  currency text not null default 'USD',
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  status text not null default 'active' check (status in ('active', 'paused')),
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_compensation (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  member_id text,
  member_name text not null,
  role_label text not null default '',
  has_fixed_salary boolean not null default false,
  fixed_amount numeric,
  has_commission boolean not null default false,
  commission_basis text,
  commission_percentage numeric,
  commission_applied_to text,
  notes text,
  estimated_this_month numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fixed_expenses_organization_id_idx
  on public.fixed_expenses (organization_id);

create index if not exists subscriptions_organization_id_idx
  on public.subscriptions (organization_id);

create index if not exists team_compensation_organization_id_idx
  on public.team_compensation (organization_id);

create index if not exists payment_platforms_organization_id_idx
  on public.payment_platforms (organization_id);

alter table public.payment_platforms enable row level security;
alter table public.fixed_expenses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.team_compensation enable row level security;

drop policy if exists "Users read org payment platforms" on public.payment_platforms;
create policy "Users read org payment platforms"
  on public.payment_platforms for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org payment platforms" on public.payment_platforms;
create policy "Users insert org payment platforms"
  on public.payment_platforms for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org payment platforms" on public.payment_platforms;
create policy "Users update org payment platforms"
  on public.payment_platforms for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org payment platforms" on public.payment_platforms;
create policy "Users delete org payment platforms"
  on public.payment_platforms for delete
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users read org fixed expenses" on public.fixed_expenses;
create policy "Users read org fixed expenses"
  on public.fixed_expenses for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org fixed expenses" on public.fixed_expenses;
create policy "Users insert org fixed expenses"
  on public.fixed_expenses for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org fixed expenses" on public.fixed_expenses;
create policy "Users update org fixed expenses"
  on public.fixed_expenses for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org fixed expenses" on public.fixed_expenses;
create policy "Users delete org fixed expenses"
  on public.fixed_expenses for delete
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users read org subscriptions" on public.subscriptions;
create policy "Users read org subscriptions"
  on public.subscriptions for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org subscriptions" on public.subscriptions;
create policy "Users insert org subscriptions"
  on public.subscriptions for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org subscriptions" on public.subscriptions;
create policy "Users update org subscriptions"
  on public.subscriptions for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org subscriptions" on public.subscriptions;
create policy "Users delete org subscriptions"
  on public.subscriptions for delete
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users read org team compensation" on public.team_compensation;
create policy "Users read org team compensation"
  on public.team_compensation for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org team compensation" on public.team_compensation;
create policy "Users insert org team compensation"
  on public.team_compensation for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org team compensation" on public.team_compensation;
create policy "Users update org team compensation"
  on public.team_compensation for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org team compensation" on public.team_compensation;
create policy "Users delete org team compensation"
  on public.team_compensation for delete
  using (organization_id = public.get_my_organization_id());
