-- C1 · El recorrido del cliente: fases y checkpoints configurables.
--
-- Hasta acá un cliente tenía un estado grueso (pendiente / onboardeado / activo
-- / caso de éxito) y nada más. No había forma de decir "ya hizo la sesión de
-- arranque pero todavía no lanzó", ni de notar que alguien está trabado hace
-- tres semanas en un paso que debería tomar cinco días.
--
-- Dos niveles:
--   client_journey_stages  → los tramos grandes (Onboarding, Primeros resultados…)
--   client_checkpoints     → los hitos concretos dentro de cada tramo
--
-- ⚠️ Esto es el CATALOGO, no lo que ocurrió. El registro de que un cliente
-- alcanzó un checkpoint es `client_checkpoint_events` y lo trae C2.
--
-- ⚠️ `clients.status` NO se toca: sigue siendo el estado grueso del negocio, no
-- configurable. Un checkpoint puede *setearlo* si su definición lo dice, que es
-- distinto de hacerlo configurable.
--
-- Sin backfill: no hay datos previos que migrar.

-- ─── Las fases ──────────────────────────────────────────────────────────────
--
-- Esta lista es la que más adelante puede alimentar el campo "Fase" del tracker
-- de wins, cambiando `field_definitions.options_source` a 'journey_stages'.
-- Por eso el color usa los mismos tokens que las opciones de C0.
create table if not exists public.client_journey_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  /** Token de color, no un hex: sigue el tema claro/oscuro. Igual que C0. */
  color text not null default 'neutral' check (
    color in ('neutral', 'cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-6')
  ),
  sort_order integer not null default 0,
  /** No se borra una fase con historia: se archiva. Misma regla que C0. */
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_journey_stages_org_idx
  on public.client_journey_stages (organization_id, sort_order);

-- ─── Los checkpoints ────────────────────────────────────────────────────────
create table if not exists public.client_checkpoints (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stage_id uuid not null references public.client_journey_stages (id) on delete cascade,
  name text not null,
  description text,
  sort_order integer not null default 0,

  /**
   * Al alcanzarlo, el cliente pasa a este estado. Opcional.
   *
   * Los cuatro valores son los de `clients.status`, que NO se hace configurable.
   * El check se escribe acá y no se referencia el de `clients` porque son dos
   * decisiones distintas: esta dice "a qué estado puede llevar un checkpoint".
   */
  sets_client_status text check (
    sets_client_status is null or
    sets_client_status in ('pending_onboarding', 'onboarding_done', 'active', 'success_case')
  ),

  /**
   * ⭐ Plazo esperado **desde el checkpoint anterior** del recorrido, no desde
   * el alta del cliente (decisión de Santiago, 2026-09-02). Así "5 días"
   * significa lo mismo para el primer hito que para el décimo.
   *
   * Es lo que hace útil el módulo: un cliente que lo pasó está **trabado**,
   * mismo criterio `stalled` que ya usa el módulo de leads. Lo consume C3.
   */
  expected_days integer check (expected_days is null or expected_days > 0),

  /**
   * ⭐ Qué métricas pide este checkpoint: [{ field_key, required }].
   *
   * Son **referencias** a `field_definitions` con entity = 'checkpoint' (C0), no
   * una copia de esas definiciones. Guardar la clave y no el detalle es lo que
   * hace que renombrar una métrica la cambie en todos los checkpoints a la vez.
   *
   * No hay un segundo mecanismo de campos configurables: es el de C0.
   */
  metric_schema jsonb not null default '[]'::jsonb,

  /**
   * Para cuando el recorrido dependa del producto contratado.
   *
   * Nullable desde el día uno porque es barato: la UI v1 asume **un solo
   * recorrido por organización**. Si resulta que un cliente de mentoría y uno
   * de curso recorren cosas distintas, cambia la pantalla, no el modelo.
   */
  product_id uuid references public.products (id) on delete set null,

  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_checkpoints_org_idx
  on public.client_checkpoints (organization_id, sort_order);

create index if not exists client_checkpoints_stage_idx
  on public.client_checkpoints (stage_id, sort_order);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table public.client_journey_stages enable row level security;

drop policy if exists "Users read org journey stages" on public.client_journey_stages;
create policy "Users read org journey stages"
  on public.client_journey_stages for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org journey stages" on public.client_journey_stages;
create policy "Users insert org journey stages"
  on public.client_journey_stages for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org journey stages" on public.client_journey_stages;
create policy "Users update org journey stages"
  on public.client_journey_stages for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org journey stages" on public.client_journey_stages;
create policy "Users delete org journey stages"
  on public.client_journey_stages for delete
  using (organization_id = public.get_my_organization_id());

alter table public.client_checkpoints enable row level security;

drop policy if exists "Users read org checkpoints" on public.client_checkpoints;
create policy "Users read org checkpoints"
  on public.client_checkpoints for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org checkpoints" on public.client_checkpoints;
create policy "Users insert org checkpoints"
  on public.client_checkpoints for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org checkpoints" on public.client_checkpoints;
create policy "Users update org checkpoints"
  on public.client_checkpoints for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org checkpoints" on public.client_checkpoints;
create policy "Users delete org checkpoints"
  on public.client_checkpoints for delete
  using (organization_id = public.get_my_organization_id());

-- ─── updated_at ─────────────────────────────────────────────────────────────

drop trigger if exists client_journey_stages_updated_at on public.client_journey_stages;
create trigger client_journey_stages_updated_at
  before update on public.client_journey_stages
  for each row execute function public.set_updated_at();

drop trigger if exists client_checkpoints_updated_at on public.client_checkpoints;
create trigger client_checkpoints_updated_at
  before update on public.client_checkpoints
  for each row execute function public.set_updated_at();
