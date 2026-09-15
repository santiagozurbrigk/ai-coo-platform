-- ⭐ Fathom trae las llamadas **desde la conexión en adelante**, no el historial.
--
-- Decisión tomada el 2026-09-15. Hasta ahora, la primera sincronización de una
-- organización barría los últimos 90 días, y la de un miembro traía **todo** lo
-- que la cuenta tuviera grabado desde siempre.
--
-- El problema de traer el historial no es el espacio: es que cada llamada se
-- transcribe y se analiza con IA. En una cuenta con años de grabaciones, esa
-- primera corrida cuesta plata de verdad y tarda, para traer conversaciones que
-- en su mayoría ya no le importan a nadie.
--
-- `connected_at` es la línea de largada. Existe aparte de `created_at` porque
-- alguien puede desconectar y volver a conectar: en ese caso la línea es la
-- reconexión, no el día que se creó la fila por primera vez.
alter table public.fathom_integrations
  add column if not exists connected_at timestamptz;

comment on column public.fathom_integrations.connected_at is
  'Desde cuándo se traen llamadas. Se sella al conectar; las anteriores no se importan.';

-- Las integraciones que ya existen conservan su fecha de alta como línea de
-- largada. Es lo más cercano a la verdad que se puede afirmar sin inventar.
update public.fathom_integrations
   set connected_at = created_at
 where connected_at is null;
