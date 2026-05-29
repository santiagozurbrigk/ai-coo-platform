-- Oleada G: gastos, suscripciones, compensación y plataformas de pago

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
