-- Fase 0 del módulo de llamadas: separar asistencia, resultado y ciclo de vida.
--
-- Hasta acá `closing_calls.status` mezclaba tres ejes distintos en un solo campo:
--   · ciclo de vida  (¿el turno ocurrió?)      → scheduled
--   · asistencia     (¿el lead vino?)          → no_show
--   · resultado      (¿compró?)                → closed / not_closed
--
-- Faltaban dos estados que sí ocurren en la realidad y no se podían representar:
--
--   attended   el lead asistió y todavía no se cargó el resultado. Es lo que
--              significa `showed` en GoHighLevel, que hasta ahora se guardaba
--              como `closed` — o sea, asistir se contaba como vender, y eso
--              alimenta la etapa Cash del embudo y la facturación.
--
--   cancelled  el turno se canceló y la llamada nunca ocurrió. GHL las
--              descartaba en el sync y Calendly las guardaba como `no_show`.
--              Una cancelación no es una inasistencia: en una el lead faltó a
--              una llamada que existió, en la otra la llamada no existió.
--
-- No se toca ninguna fila existente: por decisión del usuario, las llamadas
-- anteriores a este sistema quedan como están.

alter table public.closing_calls
  drop constraint if exists closing_calls_status_check;

alter table public.closing_calls
  add constraint closing_calls_status_check check (
    status in (
      'scheduled',   -- agendada, o ya pasó y nadie cargó el desenlace
      'attended',    -- asistió; resultado todavía sin cargar
      'closed',      -- asistió y compró
      'not_closed',  -- asistió y no compró
      'no_show',     -- no asistió a una llamada que sí ocurrió
      'cancelled'    -- se canceló antes de ocurrir
    )
  );

-- Quién fijó el estado actual.
--
-- Los syncs de Calendly y GHL reescriben `status` en cada corrida. Hasta ahora
-- sólo respetaban `closed`, así que un `not_closed` o un `no_show` cargado por
-- un closer volvía a `scheduled` en el siguiente cron — cualquier seguimiento
-- construido encima duraba hasta la próxima hora.
--
-- Las filas existentes quedan en 'sync', que es exactamente cómo se comportan
-- hoy. A partir de acá, toda escritura hecha por una persona marca 'manual' y
-- los syncs dejan de pisar ese estado.
alter table public.closing_calls
  add column if not exists status_source text not null default 'sync'
    check (status_source in ('sync', 'manual'));

-- Quién canceló. La distinción importa para el seguimiento del lead: que
-- cancele el lead es una señal sobre el lead; que cancele el closer es una
-- señal sobre la operación. 'unknown' es el valor honesto cuando el proveedor
-- informa la cancelación pero no su autor — que es el caso de GHL.
alter table public.closing_calls
  add column if not exists cancelled_by text
    check (cancelled_by is null or cancelled_by in ('lead', 'closer', 'unknown'));

-- Identidad estable del lead.
--
-- `sync-events.ts` ya recibía el email del invitado de Calendly y lo usaba sólo
-- para atribución UTM, descartándolo después. Sin esto, las llamadas que no
-- vienen de GHL no tienen forma de hilarse entre sí, que es lo que necesita el
-- seguimiento de reagendas de la Fase 2.
alter table public.closing_calls
  add column if not exists lead_email text;

alter table public.closing_calls
  add column if not exists lead_phone text;

create index if not exists closing_calls_org_status_idx
  on public.closing_calls (organization_id, status);

create index if not exists closing_calls_org_lead_email_idx
  on public.closing_calls (organization_id, lower(lead_email))
  where lead_email is not null;

-- ─── Fathom: llamadas trabadas en 'processing' ──────────────────────────────
--
-- `processSingleFathomCall` marca 'processing' antes de trabajar. Si algo falla
-- a mitad, la fila queda ahí para siempre: el cron sólo levanta 'pending'. Hoy
-- hay 51 así, la más vieja de julio.
--
-- Esta columna permite distinguir una llamada que se está procesando ahora de
-- una que quedó colgada, sin depender de `created_at` (que es la fecha de
-- ingreso, no la del intento).
alter table public.fathom_calls
  add column if not exists processing_started_at timestamptz;

create index if not exists fathom_calls_stuck_idx
  on public.fathom_calls (status, processing_started_at)
  where status = 'processing';
