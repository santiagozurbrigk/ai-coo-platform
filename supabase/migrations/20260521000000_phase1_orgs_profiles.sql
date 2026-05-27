-- Phase 1: organizaciones + perfiles (multi-tenant)
-- Ejecutar en Supabase SQL Editor si aún no está aplicado.

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

create policy "Users read own org"
  on public.organizations for select
  using (id = public.get_my_organization_id());

create policy "Users read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users read org profiles"
  on public.profiles for select
  using (organization_id = public.get_my_organization_id());

create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid());
