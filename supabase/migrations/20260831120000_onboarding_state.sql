-- Onboarding guiado — estado persistido por organización.
--
-- Esta tabla guarda **sólo lo que no se puede derivar**. El progreso del
-- checklist NO vive acá: se deriva en cada lectura de las tablas reales
-- (products, customer_avatars, funnel_instances, …) porque un booleano por
-- paso miente apenas el usuario carga datos por fuera del wizard.
-- Ver docs/ONBOARDING_PLAN.md §3.
--
-- No confundir con `onboarding_responses`, que es del wizard de holdings y
-- queda intacta.

create table if not exists public.onboarding_state (
  organization_id uuid primary key
    references public.organizations (id) on delete cascade,

  -- Cuándo terminó el gate de tres pasos. Null = todavía lo debe.
  -- Es un hecho de navegación, no un dato de negocio: no se puede derivar.
  gate_completed_at timestamptz,

  -- Ítems del checklist que el usuario descartó a propósito. La intención de
  -- ocultar algo tampoco es derivable — el ítem puede seguir sin cumplirse.
  dismissed_items text[] not null default '{}',

  -- Tours contextuales ya vistos (Fase 3).
  tours_seen text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_state enable row level security;

-- Lectura y escritura por la propia organización. No hay secretos acá, así que
-- no hace falta restringir la lectura al service role como en las tablas de
-- integraciones.
drop policy if exists "Users read org onboarding state" on public.onboarding_state;
create policy "Users read org onboarding state"
  on public.onboarding_state for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org onboarding state" on public.onboarding_state;
create policy "Users insert org onboarding state"
  on public.onboarding_state for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org onboarding state" on public.onboarding_state;
create policy "Users update org onboarding state"
  on public.onboarding_state for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

-- ─── Backfill: las organizaciones que ya existían quedan eximidas del gate ────
--
-- Sin esto, al desplegar la Fase 1 seis organizaciones reales —una activa con
-- tres miembros— se encontrarían el próximo login con un wizard bloqueante,
-- porque nunca cargaron oferta principal ni avatar. Bloquear a un cliente que
-- ya está usando el producto es hostil, y no hace falta: el checklist les va a
-- mostrar igual lo que les falta, sin encerrarlas.
--
-- El gate queda entonces para lo que se diseñó: las cuentas creadas de acá en
-- adelante, que empiezan de cero y donde configurar la moneda antes de cargar
-- el primer dato sí cambia algo.
insert into public.onboarding_state (organization_id, gate_completed_at)
select id, now() from public.organizations
on conflict (organization_id) do nothing;
