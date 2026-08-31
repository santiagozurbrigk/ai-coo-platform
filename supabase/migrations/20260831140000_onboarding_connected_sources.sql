-- Contar las fuentes de datos conectadas de una organización, en una consulta.
--
-- POR QUÉ UNA FUNCIÓN Y NO CONSULTAS DESDE LA APP.
-- El ítem "conectar una fuente de datos" del checklist arrancó mirando cinco
-- tablas, de dieciséis que existen. Santiago conectó Google en el preview y el
-- ítem siguió abierto: `google_forms_integrations` no estaba en la lista.
-- Contarlas todas desde la app serían dieciséis consultas más en un layout que
-- corre en cada request; acá es una sola, y la lista de qué cuenta como fuente
-- vive junto a las tablas en vez de en un array que se desactualiza solo.
--
-- QUÉ NO CUENTA, Y POR QUÉ:
--   · `discord_integrations` — es un canal de notificación hacia afuera, no una
--     fuente de la que OTC lea datos del negocio.
--   · `team_member_integrations` — es por persona (el Calendly de cada closer),
--     no una conexión de la organización.
--
-- CRITERIO DE "CONECTADA". Cada proveedor se desconecta distinto: unos borran
-- la fila, otros marcan `is_active`, otros un `status` que vale 'connected' o
-- 'active' según la tabla. Por eso se excluyen los estados terminales en vez de
-- exigir un valor: agregar un proveedor nuevo con otro vocabulario no lo deja
-- silenciosamente afuera.

create or replace function public.onboarding_connected_source_count(org_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from (
    select 1 where exists (
      select 1 from zernio_integrations
      where organization_id = org_id and coalesce(is_active, true))
    union all
    select 1 where exists (
      select 1 from ghl_integrations where organization_id = org_id)
    union all
    select 1 where exists (
      select 1 from calendly_integrations where organization_id = org_id)
    union all
    select 1 where exists (
      select 1 from fathom_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from payment_integrations
      where organization_id = org_id and coalesce(is_active, true))
    union all
    select 1 where exists (
      select 1 from google_forms_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from typeform_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from instagram_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from manychat_integrations where organization_id = org_id)
    union all
    select 1 where exists (
      select 1 from unipile_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from youtube_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from stripe_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from mercadopago_integrations
      where organization_id = org_id
        and coalesce(status, '') not in ('disconnected', 'revoked'))
    union all
    select 1 where exists (
      select 1 from hyros_integrations where organization_id = org_id)
    union all
    select 1 where exists (
      select 1 from vturb_integrations where organization_id = org_id)
    union all
    select 1 where exists (
      select 1 from webinarjam_integrations where organization_id = org_id)
  ) fuentes;
$$;

-- `security definer` porque varias de estas tablas guardan secretos y tienen la
-- lectura bloqueada por RLS. Toma un `org_id` arbitrario, así que sólo la puede
-- ejecutar el service role: el resolver ya usa el admin client.
revoke all on function public.onboarding_connected_source_count(uuid) from public;
revoke all on function public.onboarding_connected_source_count(uuid) from authenticated;
revoke all on function public.onboarding_connected_source_count(uuid) from anon;
grant execute on function public.onboarding_connected_source_count(uuid) to service_role;
