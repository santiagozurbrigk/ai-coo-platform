-- Calls 1-1 subidas a mano + las tareas que salen de ellas.
--
-- Pedido del founder, con captura: "quiero subir manualmente los fathoms de las
-- calls 1-1 con los clientes y que automáticamente se pongan en el apartado de
-- tareas las que les asigna el coach a cada cliente. Además de que haya algún
-- apartado que diga cuántas calls 1-1 va teniendo el cliente".

-- ─── 1 · De dónde salió una llamada ─────────────────────────────────────────
--
-- ⭐ Hasta acá toda llamada entraba por la sincronización o por el webhook, y
-- por eso no había con qué distinguirlas. Ahora hay una tercera puerta —alguien
-- pega un link— y esa diferencia importa para dos cosas:
--
--   1. Una llamada subida a mano **no pasa por el clasificador**. El cliente y
--      el propósito los dijo una persona; volver a adivinarlos sólo podría
--      empeorar un dato que ya es correcto.
--   2. Cuando algo sale mal, lo primero que hay que saber es por dónde entró.
alter table public.fathom_calls
  add column if not exists ingest_source text not null default 'sync'
    check (ingest_source in ('sync', 'webhook', 'manual_link')),
  add column if not exists uploaded_by uuid references public.profiles (id) on delete set null,
  /** El token del link compartido. Es lo que permite volver a pedir el transcript. */
  add column if not exists share_token text,
  /**
   * ⭐ El payload crudo de la página compartida, **antes** de interpretarlo.
   *
   * La página de Fathom no es su API documentada: es lo que usa su propio
   * reproductor y lo pueden cambiar sin avisar. Guardar el original completo es
   * lo que permite, el día que cambie, arreglar el mapeo mirando datos reales en
   * vez de adivinar qué había ahí. Misma regla que ya aplica el resto del repo
   * para APIs sin documentación oficial.
   */
  add column if not exists share_payload jsonb,
  /**
   * Cuándo se extrajeron las tareas de esta llamada.
   *
   * ⭐ Es el seguro contra duplicados: sin esta marca, volver a pegar el mismo
   * link le cargaría al cliente la misma tanda de tareas dos veces, y la segunda
   * tanda no se distingue de trabajo nuevo.
   */
  add column if not exists one_on_one_tasks_extracted_at timestamptz;

comment on column public.fathom_calls.ingest_source is
  'Por dónde entró: sync (cron), webhook, o manual_link (alguien pegó el link compartido).';

create index if not exists fathom_calls_org_ingest_idx
  on public.fathom_calls (organization_id, ingest_source);

-- ⭐ El contador de 1-1 de la ficha del cliente cuenta exactamente esto:
-- entregas con cliente resuelto, ordenadas por fecha. Sin este índice es un
-- scan de toda la tabla por cada ficha que se abre.
create index if not exists fathom_calls_delivery_por_cliente_idx
  on public.fathom_calls (organization_id, client_id, call_date desc)
  where purpose = 'delivery' and client_id is not null;

-- ─── 2 · Las tareas del cliente ─────────────────────────────────────────────
--
-- ⭐ Tabla propia y no `workboard_tasks`, aunque se parezcan.
--
-- El tablero es el trabajo **del equipo**: tiene sprint, tiene responsables que
-- son perfiles de la organización, y se mide como carga de trabajo interna. Lo
-- que el coach le deja al cliente no es eso — el cliente no tiene usuario, no
-- entra a un sprint, y meterlo ahí llenaría el tablero con los deberes de
-- doscientas personas ajenas al equipo.
--
-- Lo que sí puede pasar es que una tarea de la llamada resulte ser del equipo.
-- Para eso está `workboard_task_id`: se manda al tablero y queda el vínculo, sin
-- que la tarea deje de verse en la ficha del cliente.
create table if not exists public.client_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,

  title text not null,
  description text not null default '',

  /**
   * De quién es la tarea.
   *
   * ⭐ En una 1-1 se reparten compromisos para los dos lados: el cliente graba
   * los videos, el coach le manda la plantilla. Guardarlos todos como "tareas
   * del cliente" haría que el coach cierre la llamada sin registro de lo suyo.
   */
  owner text not null default 'client'
    check (owner in ('client', 'coach')),

  status text not null default 'pending'
    check (status in ('pending', 'done')),

  due_date date,

  /** De dónde salió: la cargó alguien, o salió de una llamada. */
  source text not null default 'manual'
    check (source in ('manual', 'fathom_call')),
  source_call_id uuid references public.fathom_calls (id) on delete set null,

  /** Cuando se mandó al tablero del equipo, cuál es allá. */
  workboard_task_id uuid references public.workboard_tasks (id) on delete set null,

  position integer not null default 0,

  created_by uuid references public.profiles (id) on delete set null,
  completed_at timestamptz,
  completed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_tasks_org_client_idx
  on public.client_tasks (organization_id, client_id, status, position);

create index if not exists client_tasks_source_call_idx
  on public.client_tasks (source_call_id);

alter table public.client_tasks enable row level security;

drop policy if exists "Org members read client_tasks" on public.client_tasks;
create policy "Org members read client_tasks"
  on public.client_tasks for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Org members insert client_tasks" on public.client_tasks;
create policy "Org members insert client_tasks"
  on public.client_tasks for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members update client_tasks" on public.client_tasks;
create policy "Org members update client_tasks"
  on public.client_tasks for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members delete client_tasks" on public.client_tasks;
create policy "Org members delete client_tasks"
  on public.client_tasks for delete
  using (organization_id = public.get_my_organization_id());

comment on table public.client_tasks is
  'Compromisos que salen de una 1-1 con el cliente. Distinto de workboard_tasks: el tablero es el trabajo del equipo.';
