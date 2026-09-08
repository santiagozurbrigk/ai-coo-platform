-- C2 · Registrar que un cliente alcanzó un checkpoint.
--
-- C1 dejó el catálogo (fases + checkpoints). Esto es lo que OCURRIÓ: la fila que
-- dice "este cliente alcanzó este hito, este día, con estos números".
--
-- Al registrarse, un checkpoint puede:
--   · mover el estado grueso del cliente (si su definición lo dice), usando la
--     misma columna clients.status de siempre — que NO se hace configurable;
--   · dejar registrada la fase actual del cliente en clients.current_stage_id,
--     desnormalizada a propósito para que la lista de clientes (C3) no tenga que
--     recalcular el recorrido de cada uno.
--
-- Sin backfill: no hay eventos previos que migrar.

-- ─── La fase actual del cliente, desnormalizada ─────────────────────────────
--
-- Es lo único que C2 toca de una tabla compartida. Nullable: un cliente sin
-- ningún checkpoint alcanzado no está en ninguna fase todavía.
alter table public.clients
  add column if not exists current_stage_id uuid
    references public.client_journey_stages (id) on delete set null;

-- ─── El evento ──────────────────────────────────────────────────────────────
create table if not exists public.client_checkpoint_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  checkpoint_id uuid not null references public.client_checkpoints (id) on delete cascade,

  /** Cuándo se alcanzó. Puede ser pasado, nunca futuro (lo valida la app). */
  reached_at timestamptz not null default now(),

  /**
   * Los valores de las métricas que pedía el checkpoint, validados con las
   * reglas de C0. jsonb con las claves de los campos: { "facturacion": 12000 }.
   * Mismo patrón que field_definitions describe para client_wins.custom.
   */
  metrics jsonb not null default '{}'::jsonb,

  note text,

  /** Quién lo registró. Para la trazabilidad, no para permisos. */
  recorded_by uuid references public.profiles (id) on delete set null,

  /**
   * De dónde salió. 'manual' hoy; 'discord'/'fathom' cuando C3 conecte las
   * propuestas automáticas. 'automatic' queda reservado. Un evento siempre lo
   * confirma alguien: las fuentes externas proponen, no afirman.
   */
  source text not null default 'manual' check (
    source in ('manual', 'discord', 'fathom', 'automatic')
  ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ⭐ Un checkpoint se alcanza una sola vez por cliente. Un hito que pasó dos
-- veces no es un hito; registrar de nuevo edita el evento que ya existe.
create unique index if not exists client_checkpoint_events_unique_idx
  on public.client_checkpoint_events (client_id, checkpoint_id);

create index if not exists client_checkpoint_events_org_idx
  on public.client_checkpoint_events (organization_id, reached_at desc);

create index if not exists client_checkpoint_events_client_idx
  on public.client_checkpoint_events (client_id, reached_at desc);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table public.client_checkpoint_events enable row level security;

drop policy if exists "Users read org checkpoint events" on public.client_checkpoint_events;
create policy "Users read org checkpoint events"
  on public.client_checkpoint_events for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org checkpoint events" on public.client_checkpoint_events;
create policy "Users insert org checkpoint events"
  on public.client_checkpoint_events for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org checkpoint events" on public.client_checkpoint_events;
create policy "Users update org checkpoint events"
  on public.client_checkpoint_events for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org checkpoint events" on public.client_checkpoint_events;
create policy "Users delete org checkpoint events"
  on public.client_checkpoint_events for delete
  using (organization_id = public.get_my_organization_id());

-- ─── updated_at ─────────────────────────────────────────────────────────────

drop trigger if exists client_checkpoint_events_updated_at on public.client_checkpoint_events;
create trigger client_checkpoint_events_updated_at
  before update on public.client_checkpoint_events
  for each row execute function public.set_updated_at();
