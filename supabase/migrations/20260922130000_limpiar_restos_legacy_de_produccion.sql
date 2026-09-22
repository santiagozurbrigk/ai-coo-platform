-- Limpieza de restos legacy que sólo existían en producción (db diff 2026-09-22,
-- ver docs/DB_DIFF_PRODUCCION_2026-09-22.md).
--
-- Antes de escribir esto se midió en producción que cada columna estuviera vacía
-- en todas las filas:
--   closing_calls (1.443 filas): amount, amount_local, notes, origin, program,
--     setter_name, no_close_reason, import_batch_id, import_source → 0 no nulos
--   fathom_calls.member_user_id → 0 no nulos
--   manychat_events → 0 filas
--   zernio_integrations (9 filas): profile_id 0 no nulos,
--     instagram_connected / whatsapp_connected 0 en true
-- Ninguna vista ni función depende de ellas, y el código no las usa.
--
-- En una base armada desde el repo estas columnas no existen: todo es
-- `if exists`, así que ahí esta migración no hace nada.
--
-- `metric_snapshots` (la tabla vieja, con 36 filas de histórico importado) NO se
-- toca acá: tiene datos.

-- ─── closing_calls: sistema de importación histórica, removido ───────────────
alter table public.closing_calls
  drop column if exists amount,
  drop column if exists amount_local,
  drop column if exists notes,
  drop column if exists origin,
  drop column if exists program,
  drop column if exists setter_name,
  drop column if exists no_close_reason,
  drop column if exists import_batch_id,
  drop column if exists import_source;
-- (el índice closing_calls_import_batch_id_idx cae con su columna)

-- ─── fathom_calls: reemplazada por user_id ───────────────────────────────────
alter table public.fathom_calls drop column if exists member_user_id;
-- (idx_fathom_calls_member_user cae con su columna)

-- ─── zernio_integrations: anteriores a zernio_profile_id / connected_accounts ─
alter table public.zernio_integrations
  drop column if exists profile_id,
  drop column if exists instagram_connected,
  drop column if exists whatsapp_connected;

-- ─── manychat_events: se alinea con la definición del repo ───────────────────
-- La tabla está vacía en producción. Se quitan las columnas y la unique que sólo
-- tenía prod, se agrega lo que define el repo (created_at y el check de
-- event_type) y se sacan dos índices de prod que duplican a los del repo.
alter table public.manychat_events
  drop column if exists raw_data,
  drop column if exists synced_at,
  drop constraint if exists manychat_events_organization_id_subscriber_id_event_type_tr_key,
  add column if not exists created_at timestamptz not null default now();

alter table public.manychat_events drop constraint if exists manychat_events_event_type_check;
alter table public.manychat_events add constraint manychat_events_event_type_check
  check (event_type in ('cta_response', 'flow_triggered'));

drop index if exists public.idx_manychat_events_org_type;
drop index if exists public.idx_manychat_events_triggered_at;
