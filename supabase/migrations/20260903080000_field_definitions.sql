-- C0 · Campos configurables (pieza compartida entre Wins y Checkpoints).
--
-- El problema que resuelve: hasta acá, agregar una columna a una tabla del
-- producto —"Tipo de win", "Fase", "Facturación al mes 3"— era una migración.
-- Eso obligaba a acertar la lista de valores **antes** de usar el módulo, y
-- equivocarse costaba una sesión de desarrollo.
--
-- Con esto, la lista se define desde una pantalla cuando el uso real la revele.
--
-- ⚠️ Esta tabla guarda la DEFINICIÓN de una columna, no sus valores. Los
-- valores viven en un jsonb de la fila dueña (`client_wins.custom`,
-- `client_checkpoint_events.metrics`), igual que `content_pieces.metrics` y
-- `closing_calls.form_answers`. Así leer una fila de la tabla es leer una fila
-- de la base, sin un join por columna.
--
-- Sin backfill: no hay datos previos que migrar (premisa del plan, 2026-09-02).

create table if not exists public.field_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  /** A qué tabla pertenece la columna. Una columna es de wins o de checkpoints, nunca de las dos. */
  entity text not null check (entity in ('win', 'checkpoint')),

  /**
   * Clave interna, estable. Es lo que queda escrito en cada dato cargado.
   * Se deriva de la etiqueta al crear y **no se puede cambiar después**:
   * renombrar la etiqueta no debe tocar un solo dato ya guardado.
   */
  key text not null,

  /** Lo que se ve. Se puede renombrar libremente. */
  label text not null,
  description text,

  field_type text not null check (
    field_type in ('select', 'multi_select', 'text', 'number', 'currency', 'date')
  ),

  /**
   * Opciones de un campo de lista: [{ value, label, color, archived }].
   * Inline a propósito: una tabla aparte obligaría a un join para pintar una
   * celda. `value` es lo que se guarda; `label` es lo que se ve.
   */
  options jsonb not null default '[]'::jsonb,

  /**
   * ⭐ De dónde salen las opciones.
   *
   * 'inline'          → las opciones de la columna `options` (único valor usable hoy)
   * 'journey_stages'  → del catálogo de fases del recorrido del cliente (C1)
   *
   * Existe desde el día uno para que el campo "Fase" del Encargo A pueda
   * arrancar con opciones propias y, cuando C1 entregue el catálogo, se cambie
   * **una fila** sin migrar un solo dato. La app rechaza 'journey_stages'
   * mientras el catálogo no exista.
   */
  options_source text not null default 'inline' check (
    options_source in ('inline', 'journey_stages')
  ),

  /** Unidad de un campo numérico ("%", "clientes"). Sólo para field_type = 'number'. */
  unit text,
  /** Moneda de un campo de dinero. Sólo para field_type = 'currency'. */
  currency text check (currency is null or currency in ('USD', 'ARS')),

  is_required boolean not null default false,
  sort_order integer not null default 0,

  /**
   * Un campo no se borra: se archiva. Deja de ofrecerse en los formularios
   * nuevos pero sigue mostrándose donde ya se cargó. Borrarlo reescribiría el
   * pasado. (La app sí permite borrar de verdad un campo que nadie usó.)
   */
  archived_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dos columnas con la misma clave dentro de la misma entidad serían dos
-- columnas escribiendo en la misma posición del jsonb.
create unique index if not exists field_definitions_org_entity_key_uidx
  on public.field_definitions (organization_id, entity, key);

create index if not exists field_definitions_org_entity_idx
  on public.field_definitions (organization_id, entity, sort_order);

alter table public.field_definitions enable row level security;

drop policy if exists "Users read org field definitions" on public.field_definitions;
create policy "Users read org field definitions"
  on public.field_definitions for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org field definitions" on public.field_definitions;
create policy "Users insert org field definitions"
  on public.field_definitions for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org field definitions" on public.field_definitions;
create policy "Users update org field definitions"
  on public.field_definitions for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org field definitions" on public.field_definitions;
create policy "Users delete org field definitions"
  on public.field_definitions for delete
  using (organization_id = public.get_my_organization_id());

-- ─── updated_at ─────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists field_definitions_updated_at on public.field_definitions;
create trigger field_definitions_updated_at
  before update on public.field_definitions
  for each row execute function public.set_updated_at();
