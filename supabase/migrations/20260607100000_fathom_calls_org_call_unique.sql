-- Upsert por organización + fathom_call_id (sync cron)

alter table public.fathom_calls
  drop constraint if exists fathom_calls_fathom_call_id_key;

create unique index if not exists fathom_calls_org_fathom_call_id_key
  on public.fathom_calls (organization_id, fathom_call_id);
