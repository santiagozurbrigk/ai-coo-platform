-- De quién es cada canal de Discord, y de quién es cada mensaje.
--
-- ⭐ El agujero que esto tapa, medido en producción el 2026-09-17:
--
--   | Clientes en el sistema            | 335 |
--   | Personas de Discord vinculadas    |   1 |
--   | Mensajes guardados                |  16 |
--   | Mensajes que no pertenecen a nadie|  15 |
--
-- `summarizeByClient` ignora a propósito los mensajes sin cliente —"un mensaje
-- sin cliente vinculado no es actividad de nadie"—, así que con 15 de 16
-- huérfanos la alerta de silencio no podía dispararse para nadie. La medición
-- estaba enchufada y midiendo el vacío.
--
-- La causa: un mensaje sólo se atribuía si **su autor** estaba vinculado, y
-- vincularse dependía de que el cliente escribiera `!vincular` por su cuenta.

-- ─── 1. De qué cliente es un canal ──────────────────────────────────────────
--
-- Tabla y no un arreglo dentro de `monitored_channels` por dos razones:
-- `on delete cascade` —borrar un cliente no puede dejar su id colgado en un
-- JSONB que nadie va a limpiar—, y porque la pregunta que más se hace es "¿de
-- qué canales es este cliente?", que en JSONB obliga a recorrer todas las filas.
create table if not exists public.discord_channel_clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  channel_id text not null,
  client_id uuid not null references public.clients (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (organization_id, channel_id, client_id)
);

create index if not exists discord_channel_clients_org_channel_idx
  on public.discord_channel_clients (organization_id, channel_id);
create index if not exists discord_channel_clients_client_idx
  on public.discord_channel_clients (client_id);

alter table public.discord_channel_clients enable row level security;

drop policy if exists "org_access" on public.discord_channel_clients;
create policy "org_access" on public.discord_channel_clients
  for all using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

comment on table public.discord_channel_clients is
  'Qué clientes son dueños de un canal de Discord. Varias filas = canal compartido.';

-- ─── 2. Cómo se supo de quién era el mensaje ────────────────────────────────
--
-- ⭐ Sin esta columna, la alerta de silencio se apaga sola.
--
-- Si el canal es de Juan y ahí escribe el coach, atribuir ese mensaje a Juan
-- reinicia su reloj de silencio: el cliente que se está yendo queda tapado por
-- la actividad de tu propio equipo, que es exactamente lo contrario de para qué
-- existe la alerta.
--
-- Así que el reloj lo mueven **sólo** los mensajes de una persona vinculada
-- (`person`). Lo atribuido por canal cuenta como actividad del espacio del
-- cliente y se muestra, pero no apaga nada.
--
--   'person'  — su autor está vinculado a un cliente. Es el cliente hablando.
--   'channel' — su autor no está vinculado; el canal es de un solo cliente.
--   null      — sin dueño.
alter table public.discord_messages
  add column if not exists attributed_by text;

comment on column public.discord_messages.attributed_by is
  'person = el autor está vinculado (mueve el reloj del silencio). '
  'channel = se dedujo del dueño del canal (no lo mueve). null = sin dueño.';

-- Las filas que ya tenían cliente lo tenían por su autor: no había otra forma.
update public.discord_messages
   set attributed_by = 'person'
 where client_id is not null
   and attributed_by is null;

-- ─── 3. El tipo de canal ────────────────────────────────────────────────────
--
-- `monitored_channels[].purpose` existía desde el día uno con cuatro valores
-- posibles, pero **nadie lo elegía**: la pantalla escribía `'clients'` fijo en
-- todos. En producción los 8 canales monitoreados dicen `'clients'` y ninguno
-- es de un cliente — son `wins`, `chat-general`, `equipo`, `presentación`.
--
-- Ahora son dos y los elige el usuario:
--
--   'client'    — el canal es de uno o más clientes (ver tabla de arriba).
--   'community' — escriben muchos clientes. No atribuye por canal.
--
-- ⭐ Todo pasa a `'community'`, que es **exactamente el comportamiento de hoy**:
-- ningún mensaje se atribuye por canal. Nadie se despierta con sus mensajes
-- repartidos entre clientes que no eligió; el que quiera marca sus canales.
--
-- ⭐ El tilde `wins` se resuelve ACÁ, una sola vez, y queda guardado.
--
-- Hasta hoy, que un canal buscara logros dependía de que su **nombre** tuviera
-- una palabra de una lista ("win", "testimonio", "logro"…). Esa lista se
-- consultaba en cada mensaje, y vivía sólo en el bot: la pantalla no tenía
-- forma de mostrar si un canal buscaba wins o no, porque la respuesta se
-- calculaba en otro lado y nunca se guardaba.
--
-- Ahora el valor se escribe una vez —acá para lo que ya existe, y al agregar un
-- canal para lo que venga— y después sólo se lee. La heurística del nombre pasa
-- a ser una sugerencia inicial que el usuario puede corregir, en vez de una
-- regla invisible que le gana siempre.
--
-- `'testimonials'` era el único `purpose` con efecto real (bajaba el listón del
-- pre-filtro), así que también se preserva como `wins: true`.
update public.discord_integrations
   set monitored_channels = (
         select coalesce(jsonb_agg(
           jsonb_set(canal, '{purpose}', '"community"')
             || jsonb_build_object(
                  'wins',
                  canal->>'purpose' = 'testimonials'
                    or lower(coalesce(canal->>'channel_name', '')) ~
                       '(testimoni|win|caso|exito|éxito|logro|resultado|achievement)'
                )
         ), '[]'::jsonb)
           from jsonb_array_elements(monitored_channels) as canal
       ),
       updated_at = now()
 where jsonb_array_length(monitored_channels) > 0;
