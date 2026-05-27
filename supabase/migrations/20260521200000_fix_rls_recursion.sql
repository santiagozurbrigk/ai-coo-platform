-- Corrige "infinite recursion detected in policy for relation profiles"
-- Ejecutar en Supabase SQL Editor

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

-- Profiles: quitar política recursiva
drop policy if exists "Users read org profiles" on public.profiles;

create policy "Users read org profiles"
  on public.profiles for select
  using (organization_id = public.get_my_organization_id());

-- Organizations
drop policy if exists "Users read own org" on public.organizations;

create policy "Users read own org"
  on public.organizations for select
  using (id = public.get_my_organization_id());

-- Clients
drop policy if exists "Users read org clients" on public.clients;
drop policy if exists "Users insert org clients" on public.clients;
drop policy if exists "Users update org clients" on public.clients;

create policy "Users read org clients"
  on public.clients for select
  using (organization_id = public.get_my_organization_id());

create policy "Users insert org clients"
  on public.clients for insert
  with check (organization_id = public.get_my_organization_id());

create policy "Users update org clients"
  on public.clients for update
  using (organization_id = public.get_my_organization_id());
