-- Clientes por organización (Phase 1)

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
create index if not exists clients_status_idx on public.clients (organization_id, status);

alter table public.clients enable row level security;

create policy "Users read org clients"
  on public.clients for select
  using (organization_id = public.get_my_organization_id());

create policy "Users insert org clients"
  on public.clients for insert
  with check (organization_id = public.get_my_organization_id());

create policy "Users update org clients"
  on public.clients for update
  using (organization_id = public.get_my_organization_id());
