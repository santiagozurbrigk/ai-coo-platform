-- Reconciliación entre el repo y la base de producción (db diff del 2026-09-22).
--
-- Se comparó el esquema que arman las migraciones del repo contra producción
-- (Supabase `OTC`), objeto por objeto: columnas, índices, constraints, policies,
-- triggers, grants, funciones y vistas. El detalle completo está en
-- `docs/DB_DIFF_PRODUCCION_2026-09-22.md`.
--
-- Esta migración hace dos cosas, y es idempotente en las dos bases:
--   A. Corrige en producción una policy peligrosa que el repo no tiene.
--   B. Trae al repo lo que la app usa y sólo existía en producción (aplicado a
--      mano en su momento), para que una base armada desde cero funcione.
-- Lo que existe sólo en producción y la app no usa (columnas legacy, la tabla
-- `metric_snapshots`) NO se toca: está listado en el documento del diff.

-- ─── A. team_member_integrations: la policy de producción abría todo ─────────
-- Producción tenía "members_own_integrations":
--   FOR ALL USING (auth.uid() = user_id OR get_my_organization_id() = organization_id)
-- sin WITH CHECK (Postgres usa el USING para las escrituras). Con eso:
--   - cualquier miembro leía las integraciones de sus compañeros (Fathom y
--     Calendly de cada closer: key cifrada, webhook_secret, webhook_token);
--   - cualquier usuario podía insertar una fila con su propio user_id en OTRA
--     org (la rama `auth.uid() = user_id` alcanza), y con su webhook_token
--     meter llamadas de Fathom en esa org.
-- El repo define la policy correcta (propia Y de la propia org). Toda la app
-- accede a esta tabla con service role, así que esto no cambia su comportamiento.
drop policy if exists "members_own_integrations" on public.team_member_integrations;
drop policy if exists "Users manage own team member integrations" on public.team_member_integrations;
create policy "Users manage own team member integrations"
  on public.team_member_integrations
  for all
  using (user_id = auth.uid() and organization_id = public.get_my_organization_id())
  with check (user_id = auth.uid() and organization_id = public.get_my_organization_id());

-- ─── B1. Rol `member` ────────────────────────────────────────────────────────
-- La app crea los miembros invitados con role = 'member' (app/team/actions.ts).
-- Producción lo admite (migración `add_member_to_profiles_role_check`, aplicada
-- a mano); el repo no, y en una base nueva las invitaciones fallaban.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in (
  'founder', 'admin', 'project_manager', 'setter', 'operator', 'viewer', 'member'
));

-- ─── B2. Columnas que usa el inbox de Zernio ─────────────────────────────────
-- app/integrations/zernio/actions.ts y components/sales/zernio-side-panel.tsx
-- leen y escriben estas dos columnas; sólo existían en producción.
alter table public.zernio_conversation_analysis
  add column if not exists suggested_next_message text,
  add column if not exists scheduling_process_missing boolean default false;

-- ─── B3. Índices de foreign keys y de performance ────────────────────────────
-- Producción los tiene por `rls_perf_and_fk_indexes` (aplicada a mano). Sin
-- ellos, cada join por FK y cada policy por organization_id hace seq scan.
create index if not exists idx_agent_messages_organization_id on public.agent_messages (organization_id);
create index if not exists idx_business_context_documents_uploaded_by on public.business_context_documents (uploaded_by);
create index if not exists idx_client_timeline_entries_fathom_call_id on public.client_timeline_entries (fathom_call_id);
create index if not exists idx_client_timeline_entries_organization_id on public.client_timeline_entries (organization_id);
create index if not exists idx_clients_closing_call_id on public.clients (closing_call_id);
create index if not exists idx_closing_calls_conversation_id on public.closing_calls (conversation_id);
create index if not exists idx_discord_client_links_client_id on public.discord_client_links (client_id);
create index if not exists idx_form_responses_organization_id on public.form_responses (organization_id);
create index if not exists idx_holding_active_sessions_business_org_id on public.holding_active_sessions (business_org_id);
create index if not exists idx_holdings_owner_email on public.holdings (owner_email);
create index if not exists idx_instagram_messages_conversation_id on public.instagram_messages (conversation_id);
create index if not exists idx_instagram_messages_organization_id on public.instagram_messages (organization_id);
create index if not exists idx_instagram_threads_conversation_id on public.instagram_threads (conversation_id);
create index if not exists idx_launch_metrics_organization_id on public.launch_metrics (organization_id);
create index if not exists idx_launches_created_by on public.launches (created_by);
create index if not exists idx_launches_product_id on public.launches (product_id);
create index if not exists idx_products_target_avatar_id on public.products (target_avatar_id);
create index if not exists idx_profiles_custom_role_id on public.profiles (custom_role_id);
create index if not exists idx_profiles_invited_by on public.profiles (invited_by);
create index if not exists idx_rag_chunks_document_id on public.rag_chunks (document_id);
create index if not exists idx_sales_frameworks_organization_id on public.sales_frameworks (organization_id);
create index if not exists idx_sop_versions_changed_by on public.sop_versions (changed_by);
create index if not exists idx_sop_versions_organization_id on public.sop_versions (organization_id);
create index if not exists idx_sops_approved_by on public.sops (approved_by);
create index if not exists idx_sops_author_user_id on public.sops (author_user_id);
create index if not exists idx_sprints_created_by on public.sprints (created_by);
create index if not exists idx_team_invitations_custom_role_id on public.team_invitations (custom_role_id);
create index if not exists idx_team_invitations_invited_by on public.team_invitations (invited_by);
create index if not exists idx_utm_booking_attributions_utm_lead_capture_id on public.utm_booking_attributions (utm_lead_capture_id);
create index if not exists idx_utm_sale_attributions_utm_booking_attribution_id on public.utm_sale_attributions (utm_booking_attribution_id);
create index if not exists idx_value_ladder_product_id on public.value_ladder (product_id);
create index if not exists idx_workboard_tasks_assignee_id on public.workboard_tasks (assignee_id);
create index if not exists idx_workboard_tasks_created_by on public.workboard_tasks (created_by);

-- Y al revés: el repo define este índice y producción no lo tiene. La lista de
-- clientes filtra por (organization_id, status).
create index if not exists clients_status_idx on public.clients (organization_id, status);
