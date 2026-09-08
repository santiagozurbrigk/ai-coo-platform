-- Valores de seguimiento propios de cada organización.
--
-- Hasta acá el vocabulario del seguimiento estaba cerrado en dos lugares a la
-- vez: constantes de TypeScript y un CHECK en Postgres. Agregar "Esperando
-- pago" o "Derivado a socio" —cosas que pasan todos los días en un equipo de
-- ventas— requería una migración y un deploy. El closer terminaba metiendo esa
-- información en las notas, donde no se puede filtrar ni contar.

-- ─── El valor como fila ─────────────────────────────────────────────────────
--
-- ⭐ **Un valor no es sólo una etiqueta: tiene consecuencia.** `lost` cierra el
-- hilo del lead; todo lo demás exige una fecha, porque un próximo paso sin fecha
-- nunca vence y por lo tanto nunca vuelve a la cola — es una forma silenciosa de
-- perder el lead. Si un valor creado por el usuario fuera texto libre, el motor
-- que deriva el estado (`lib/sales/lead-thread.ts`) no sabría qué hacer con él.
--
-- Por eso cada valor **declara su comportamiento** al crearse, y el motor
-- pregunta por el comportamiento en vez de comparar contra el string `lost`.
create table if not exists public.sales_follow_up_options (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  /** Qué campo del seguimiento completa este valor. */
  kind text not null check (kind in ('next_action', 'qualification')),
  /** Lo que se guarda en closing_calls. Estable: renombrar la etiqueta no lo cambia. */
  slug text not null,
  label text not null,
  /** Token del design system, no un hex: 'amber' | 'sky' | … Ver lib/sales/follow-up-options.ts */
  color text not null default 'slate',
  /**
   * needs_date   → es un compromiso: pide fecha y vuelve a la cola al vencer.
   * closes_thread → cierra el hilo, no pide fecha.
   * neutral      → sólo describe (las calificaciones), no mueve el estado.
   */
  behavior text not null default 'needs_date'
    check (behavior in ('needs_date', 'closes_thread', 'neutral')),
  sort_order integer not null default 0,
  /**
   * Se archiva, no se borra: hay turnos apuntando a este slug. Un valor borrado
   * vaciaría ese dato en silencio, que es justo lo que el módulo evita.
   */
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, kind, slug)
);

create index if not exists sales_follow_up_options_org_idx
  on public.sales_follow_up_options (organization_id, kind, sort_order);

alter table public.sales_follow_up_options enable row level security;

drop policy if exists "Users manage org follow up options" on public.sales_follow_up_options;
create policy "Users manage org follow up options"
  on public.sales_follow_up_options for all
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

-- ─── Los CHECK cerrados se caen ─────────────────────────────────────────────
--
-- Mismo movimiento que hizo `20260714200000_knowledge_base_custom_categories`:
-- los valores de fábrica siguen hard-codeados en la app (no se siembran acá, así
-- no hay que backfillear cada organización ni se rompe nada si alguien borra una
-- fila), y la validación pasa a la Server Action, que valida contra
-- built-ins ∪ opciones de la organización.
alter table public.closing_calls
  drop constraint if exists closing_calls_next_action_check;

alter table public.closing_calls
  drop constraint if exists closing_calls_pre_call_qualification_check;

alter table public.closing_calls
  drop constraint if exists closing_calls_post_call_qualification_check;

-- El índice de la cola de seguimiento excluía 'lost' por nombre. Ahora que un
-- valor propio también puede cerrar el hilo, la condición que importa es la
-- misma que usa la cola: hay próximo paso **con fecha**. Un valor que cierra el
-- hilo nunca tiene fecha, así que queda afuera solo.
drop index if exists public.closing_calls_next_action_idx;
create index if not exists closing_calls_next_action_idx
  on public.closing_calls (organization_id, next_action_at)
  where next_action is not null and next_action_at is not null;
