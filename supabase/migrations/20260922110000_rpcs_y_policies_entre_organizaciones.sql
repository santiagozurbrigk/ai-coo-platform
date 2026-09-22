-- Cierra los caminos por los que un usuario logueado leía o escribía datos de
-- otra organización sin pasar por la app (auditoría de backend 2026-09-22).
--
-- ⚠️ En Supabase las funciones y tablas nuevas quedan con GRANT explícito a
-- `anon` y `authenticated` por los default privileges del proyecto.
-- `REVOKE ... FROM PUBLIC` no alcanza: hay que revocarle a cada rol.
--
-- Todo lo revocado acá lo llama la app con el service role (`createAdminClient`),
-- así que nada deja de funcionar. Cada bloque dice quién lo llama.

-- ─── 1. RAG: búsqueda en la base de conocimiento de cualquier org ────────────
-- SECURITY DEFINER, recibe `org_id` y nunca lo compara con el que llama.
-- Con la anon key y un JWT propio devolvía todos los chunks de otra org.
-- Caller: lib/rag/search.ts (admin).
revoke execute on function public.search_rag_chunks(vector, uuid, integer, text[])
  from public, anon, authenticated;

-- ─── 2. Vista de estado de Claude: listaba todas las orgs ────────────────────
-- La vista corre con los permisos de su dueño y no filtraba: cualquier
-- authenticated leía el id de todas las organizaciones (que es justo lo que
-- pedían las RPCs de arriba). No puede pasar a security_invoker porque lee
-- `claude_api_key_encrypted`, que authenticated no puede ver; se filtra por org.
-- En una vista `current_user` sigue siendo el que consulta.
-- Callers: app/settings/actions.ts (usuario, su org), lib/super-admin/queries.ts (admin).
create or replace view public.organization_claude_status as
select
  id,
  case
    when claude_api_key_encrypted is not null then true
    else false
  end as has_claude_key,
  claude_api_key_status,
  claude_api_key_last_validated_at,
  case
    when claude_oauth_token_encrypted is not null then true
    else false
  end as has_claude_oauth,
  claude_credential_mode,
  claude_oauth_failed_at,
  claude_oauth_last_probe_at,
  claude_oauth_last_success_at
from public.organizations
where current_user not in ('authenticated', 'anon')
   or id = public.get_my_organization_id();

revoke all on public.organization_claude_status from anon;
grant select on public.organization_claude_status to authenticated;

-- ─── 3. RPCs que confían en el id que manda el que llama ─────────────────────
-- Guion de ventas de cualquier org. Caller: lib/fathom/deep-call-analysis.ts (admin).
revoke execute on function public.get_active_sales_script(uuid) from public, anon, authenticated;

-- Contadores UTM: cualquiera podía sumar clicks, leads o `revenue_attributed`
-- (incluso negativo) en cualquier link. Callers: lib/utm/* (admin).
revoke execute on function public.increment_utm_clicks(text, uuid) from public, anon, authenticated;
revoke execute on function public.increment_utm_leads(uuid) from public, anon, authenticated;
revoke execute on function public.increment_utm_bookings(uuid) from public, anon, authenticated;
revoke execute on function public.increment_utm_sales(uuid, numeric) from public, anon, authenticated;

-- MRR y actividad de cualquier holding. La app pasa a llamarla con el service
-- role después de verificar al founder del holding (app/(platform)/holding/actions.ts).
revoke execute on function public.get_holding_dashboard_stats(uuid) from public, anon, authenticated;

-- Se saltea su chequeo cuando `auth.uid()` es null: anon sembraba roles en
-- cualquier org. authenticated la sigue usando desde app/team/actions.ts.
revoke execute on function public.create_default_roles(uuid) from public, anon;

-- ─── 4. Secretos de integraciones legibles por cualquier miembro ─────────────
-- `youtube_integrations` (access/refresh token, API key) y `zernio_integrations`
-- (api_key, webhook_secret) tenían policies de lectura y escritura para todo
-- miembro de la org —la de zernio "org admins" no chequeaba el rol—. Un viewer
-- leía la key o la cambiaba por la de otra cuenta. Toda la app accede a estas
-- dos tablas con el service role; sin policy, RLS las cierra para el resto.
drop policy if exists "Users manage own org youtube integration" on public.youtube_integrations;
drop policy if exists "org members can read zernio_integrations" on public.zernio_integrations;
drop policy if exists "org admins can manage zernio_integrations" on public.zernio_integrations;

-- ─── 5. Columnas de organizations que nunca se habilitaron ───────────────────
-- 20260619100000 pasó organizations a grants por columna. Las columnas que se
-- agregaron después quedaron sin grant y leerlas con el cliente de usuario
-- falla con "permission denied": el país de Configuración no carga ni guarda,
-- y `enabled_add_ons` se lee siempre vacío en los permisos del usuario.
grant select (country, enabled_add_ons, reel_music_path) on public.organizations to authenticated;
grant update (country) on public.organizations to authenticated;

-- ─── 6. Upserts contra índices únicos parciales ──────────────────────────────
-- `ON CONFLICT (cols)` no usa un índice parcial si no se repite su WHERE, y
-- PostgREST no lo repite: el upsert falla con "no unique or exclusion
-- constraint matching the ON CONFLICT specification".
--   - call_analyses (lib/fathom/deep-call-analysis.ts): el análisis profundo
--     de llamadas nunca se guardaba.
--   - content_pieces (lib/google/sync-youtube.ts): la sync de YouTube nunca
--     escribía.
-- Un índice único común admite varios NULL, así que la regla no cambia.
create unique index if not exists call_analyses_fathom_call_id_uniq
  on public.call_analyses (fathom_call_id);
drop index if exists public.call_analyses_fathom_call_id_key;

create unique index if not exists content_pieces_org_platform_post_uniq
  on public.content_pieces (organization_id, platform_post_id);
drop index if exists public.content_pieces_platform_post_unique;
