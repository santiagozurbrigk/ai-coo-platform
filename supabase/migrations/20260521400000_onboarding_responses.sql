-- Oleada B: onboarding wizard persistido por organización

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  data jsonb not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_responses_organization_id_idx
  on public.onboarding_responses (organization_id);

alter table public.onboarding_responses enable row level security;

drop policy if exists "Users read org onboarding" on public.onboarding_responses;
create policy "Users read org onboarding"
  on public.onboarding_responses for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users upsert org onboarding" on public.onboarding_responses;
create policy "Users insert org onboarding"
  on public.onboarding_responses for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org onboarding" on public.onboarding_responses;
create policy "Users update org onboarding"
  on public.onboarding_responses for update
  using (organization_id = public.get_my_organization_id());

-- Actualizar nombre de org tras onboarding (opcional)
drop policy if exists "Users update own org" on public.organizations;
create policy "Users update own org"
  on public.organizations for update
  using (id = public.get_my_organization_id());
