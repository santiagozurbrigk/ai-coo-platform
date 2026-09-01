-- Reducción de alcance del módulo de llamadas: sólo llamadas de venta.
--
-- Por decisión de producto, OTC registra **únicamente llamadas de venta**. Una
-- grabación de Fathom lo es cuando el mail de alguno de sus participantes
-- coincide con el del lead de un turno agendado y el horario corresponde.
--
-- Las llamadas de equipo y de entrega de servicio quedan para más adelante. Lo
-- que se había construido para clasificarlas se retira ahora, en vez de quedar
-- dormido: código y columnas que parecen vivos pero nadie escribe son
-- exactamente cómo terminaron conviviendo los cuatro clasificadores que la
-- Fase 1 acaba de reemplazar.

-- El mapeo tipo de reunión → propósito servía para distinguir entrega de
-- equipo. Sin esas dos categorías no clasifica nada.
drop table if exists public.fathom_meeting_type_map;

-- Señales de clasificación: con una sola regla —cruza con un turno o no— el
-- detalle de qué señal aportó deja de tener sentido. El resultado del cruce,
-- con su confianza y su motivo, se guarda en `appointment_match`.
alter table public.fathom_calls drop column if exists classification_signals;
alter table public.fathom_calls drop column if exists unclassified_reason;

-- Nombre declarado en el título por la convención `tipo - quién`. El título ya
-- no participa de la decisión.
alter table public.fathom_calls drop column if exists declared_name;

-- El índice de "sin clasificar" se reemplaza por el de "sin turno asociado",
-- que es la lista que la UI muestra ahora: grabaciones donde puede haber una
-- llamada de venta que no llegó a cruzarse sola.
drop index if exists public.fathom_calls_unclassified_idx;

create index if not exists fathom_calls_unlinked_idx
  on public.fathom_calls (organization_id, call_date desc)
  where closing_call_id is null and status not in ('pending', 'processing');

-- `counterparty` y `purpose` se conservan: hoy sólo toman 'lead' y 'sales' —o
-- null cuando la grabación no es una llamada de venta— y son la puerta por la
-- que entran entrega y equipo cuando se implementen.
--
-- `meeting_type` y `calendar_invitees` también se conservan: son datos crudos
-- que Fathom devuelve y guardarlos no cuesta nada. `calendar_invitees` es la
-- señal con la que se cruza contra la agenda.
