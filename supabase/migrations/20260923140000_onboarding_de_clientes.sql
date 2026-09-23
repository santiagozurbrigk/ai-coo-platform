-- El formulario de onboarding de los clientes de un growth partner, adentro
-- de Limitless. Sólo se usa con el add-on `growth_partners`.
--
-- ⭐ El pedido: hasta hoy el formulario vivía en otra app (repo
-- `client-onboarding`), con su propia base, y las respuestas había que pasarlas
-- a mano a la ficha. Ahora el equipo genera un link por cada cliente del
-- growth partner (`client_sub_clients`), el cliente lo completa sin cuenta, y
-- las respuestas caen en su ficha.
--
-- ⭐ No se crea un catálogo de preguntas aparte. Cada pregunta es una columna
-- configurable (`field_definitions`) de la sección nueva «onboarding», con un
-- jsonb que dice en qué paso del formulario va y cómo se pregunta. Así la
-- respuesta vive donde vive todo lo demás del cliente (`client_sub_clients.custom`),
-- se edita desde la ficha como cualquier campo, y agregar una pregunta es una
-- edición en Campos personalizados, no un deploy.

-- ─── 1 · La sección «onboarding» ────────────────────────────────────────────
--
-- Las respuestas crudas del cliente van en su propia solapa y no mezcladas con
-- los 22 campos de Marketing, Ventas y Sistemas: esos son el resumen que arma
-- el equipo, y 70 preguntas intercaladas los enterrarían.
alter table public.field_definitions
  drop constraint if exists field_definitions_section_check;

alter table public.field_definitions
  add constraint field_definitions_section_check
  check (section is null or section in ('marketing', 'ventas', 'sistemas', 'onboarding'));

-- ─── 2 · Cómo se pregunta cada campo en el formulario ───────────────────────
--
-- `{ step, question, required, showIf: { key, equals }, audio }`.
--
-- ⭐ Un jsonb y no cinco columnas: es configuración del formulario que sólo lee
-- el formulario, y la app la parsea a la defensiva igual que `options`. Nulo =
-- el campo no se pregunta.
--
-- ⭐ `required` es del formulario y no reusa `is_required`: `is_required` se
-- valida también cuando el equipo edita la ficha, y marcar obligatorias las 70
-- preguntas le impediría al equipo guardar un cliente a medio cargar.
alter table public.field_definitions
  add column if not exists onboarding jsonb
    check (onboarding is null or jsonb_typeof(onboarding) = 'object');

comment on column public.field_definitions.onboarding is
  'Si el campo se pregunta en el formulario de onboarding: { step, question, required, showIf, audio }. Nulo = no se pregunta.';

-- ─── 3 · Los links ──────────────────────────────────────────────────────────
--
-- Uno por cliente del growth partner. El token es lo único que protege la
-- página pública: lo genera la app (24 bytes al azar) y no se puede adivinar.
-- Revocarlo lo apaga; generar otro deja el anterior revocado.
create table if not exists public.client_onboarding_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  sub_client_id uuid not null references public.client_sub_clients (id) on delete cascade,
  token text not null unique check (char_length(token) between 32 and 128),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- Un solo link activo por cliente: dos links vivos serían dos lugares desde
-- donde pisar las mismas respuestas.
create unique index if not exists client_onboarding_links_activo_uidx
  on public.client_onboarding_links (sub_client_id)
  where revoked_at is null;

create index if not exists client_onboarding_links_org_idx
  on public.client_onboarding_links (organization_id, client_id);

alter table public.client_onboarding_links enable row level security;

drop policy if exists "Org members read client_onboarding_links" on public.client_onboarding_links;
create policy "Org members read client_onboarding_links"
  on public.client_onboarding_links for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Org members insert client_onboarding_links" on public.client_onboarding_links;
create policy "Org members insert client_onboarding_links"
  on public.client_onboarding_links for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members update client_onboarding_links" on public.client_onboarding_links;
create policy "Org members update client_onboarding_links"
  on public.client_onboarding_links for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

-- ─── 4 · El historial de envíos ─────────────────────────────────────────────
--
-- ⭐ Decisión del usuario (2026-09-23): si el cliente vuelve a completar el
-- link, sus respuestas **pisan** lo que había en la ficha. Se puede pisar
-- porque acá queda todo: lo que mandó (`answers`), lo que había antes en cada
-- campo que cambió (`replaced`) y cómo se llamaba cada pregunta en ese momento
-- (`labels`), para que el historial se lea aunque después renombren o borren
-- la columna.
--
-- Lo escribe sólo el servidor, con service role, desde la página pública: no
-- hay policy de insert.
create table if not exists public.client_onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  sub_client_id uuid not null references public.client_sub_clients (id) on delete cascade,
  link_id uuid references public.client_onboarding_links (id) on delete set null,
  respondent_name text check (respondent_name is null or char_length(respondent_name) <= 200),
  answers jsonb not null default '{}'::jsonb,
  replaced jsonb not null default '{}'::jsonb,
  labels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists client_onboarding_submissions_sub_idx
  on public.client_onboarding_submissions (sub_client_id, created_at desc);

create index if not exists client_onboarding_submissions_org_idx
  on public.client_onboarding_submissions (organization_id, client_id);

alter table public.client_onboarding_submissions enable row level security;

drop policy if exists "Org members read client_onboarding_submissions" on public.client_onboarding_submissions;
create policy "Org members read client_onboarding_submissions"
  on public.client_onboarding_submissions for select
  using (organization_id = public.get_my_organization_id());

comment on table public.client_onboarding_links is
  'Links públicos del formulario de onboarding, uno activo por cliente de un growth partner. Sólo con el add-on growth_partners.';
comment on table public.client_onboarding_submissions is
  'Cada envío del formulario de onboarding: qué se respondió y qué había antes en los campos que cambiaron.';
