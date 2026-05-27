-- Oleada E (Calendly): sincronizar eventos de cierre en `closing_calls`
-- Importante: mantenemos Closing como tabla fuente. Calendly solo añade metadata e idempotencia.

alter table public.closing_calls
  add column if not exists calendly_event_id text;

alter table public.closing_calls
  add column if not exists calendly_url text;

-- Idempotencia por org: mismo evento no genera duplicados.
create unique index if not exists closing_calls_org_calendly_event_id_idx
  on public.closing_calls (organization_id, calendly_event_id)
  where calendly_event_id is not null;

