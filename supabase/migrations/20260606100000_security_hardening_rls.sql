-- Security hardening: RLS gaps, ocultar secrets de integraciones, tablas globales

-- ─── Función base (idempotente) ─────────────────────────────────────────────

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

-- ─── Integraciones: sin lectura directa de tokens/API keys desde el cliente ─
-- El backend usa service role (createAdminClient) para leer/escribir secrets.

drop policy if exists "Users read org fathom integration" on public.fathom_integrations;
drop policy if exists "Users read org manychat integration" on public.manychat_integrations;
drop policy if exists "Users read org calendly integration" on public.calendly_integrations;
drop policy if exists "Users read org youtube integration" on public.youtube_integrations;
drop policy if exists "Users read org typeform integration" on public.typeform_integrations;
drop policy if exists "Users read org google forms integration" on public.google_forms_integrations;

alter table public.fathom_integrations enable row level security;
alter table public.manychat_integrations enable row level security;
alter table public.calendly_integrations enable row level security;
alter table public.youtube_integrations enable row level security;
alter table public.typeform_integrations enable row level security;
alter table public.google_forms_integrations enable row level security;

-- ─── token_usage: lectura solo de la propia org ─────────────────────────────

alter table public.token_usage enable row level security;

drop policy if exists "org_read_token_usage" on public.token_usage;
create policy "org_read_token_usage"
  on public.token_usage
  for select
  using (organization_id = public.get_my_organization_id());

-- Escrituras vía service role (cron, IA, webhooks)

-- ─── organization_notes ─────────────────────────────────────────────────────

alter table public.organization_notes enable row level security;

drop policy if exists "org_access_organization_notes" on public.organization_notes;
create policy "org_access_organization_notes"
  on public.organization_notes
  for all
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

-- ─── Tablas globales Super Admin: RLS activo, sin policies = solo service role

alter table public.ai_brain_documents enable row level security;
alter table public.super_admin_users enable row level security;

-- ─── Perfiles: reforzar update propio ───────────────────────────────────────

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─── Organizaciones: solo lectura de la propia org (ya existente, idempotente) ─

drop policy if exists "Users read own org" on public.organizations;
create policy "Users read own org"
  on public.organizations
  for select
  using (id = public.get_my_organization_id());

-- ─── Tablas con organization_id: asegurar RLS habilitado ────────────────────

alter table if exists public.agent_conversations enable row level security;
alter table if exists public.agent_messages enable row level security;
alter table if exists public.agent_projects enable row level security;
alter table if exists public.business_stages enable row level security;
alter table if exists public.sops enable row level security;
alter table if exists public.discord_integrations enable row level security;
alter table if exists public.discord_client_links enable row level security;
alter table if exists public.discord_messages enable row level security;
alter table if exists public.discord_pending_channels enable row level security;
alter table if exists public.discord_pending_links enable row level security;
alter table if exists public.fathom_calls enable row level security;
alter table if exists public.content_assets enable row level security;
alter table if exists public.workboard_tasks enable row level security;
