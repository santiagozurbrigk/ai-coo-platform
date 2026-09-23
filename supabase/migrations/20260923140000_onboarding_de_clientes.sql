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
-- Dos clases:
--   · `creator`: uno por cliente del growth partner. Lo que responde cae en su
--     ficha.
--   · `general`: uno por organización, para quien todavía no está cargado. Lo
--     que responde queda en una bandeja «sin asignar» hasta que el equipo dice
--     de qué cliente es (o crea uno nuevo con ese envío).
--
-- ⭐ El general no crea clientes solo: con un link que anda por ahí, un envío
-- de prueba o repetido sería un cliente fantasma en la cartera. El pedido fue
-- "después decir, bueno, esta ficha pertenece al cliente".
--
-- El token es lo único que protege la página pública: lo genera la app (24
-- bytes al azar) y no se puede adivinar. Revocarlo lo apaga.
create table if not exists public.client_onboarding_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  kind text not null default 'creator' check (kind in ('creator', 'general')),
  client_id uuid references public.clients (id) on delete cascade,
  sub_client_id uuid references public.client_sub_clients (id) on delete cascade,
  token text not null unique check (char_length(token) between 32 and 128),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  -- Un link de creador apunta a su creador y a su growth partner; el general, a
  -- ninguno.
  constraint client_onboarding_links_destino_check check (
    (kind = 'creator' and client_id is not null and sub_client_id is not null)
    or (kind = 'general' and client_id is null and sub_client_id is null)
  )
);

-- Un solo link activo por creador: dos links vivos serían dos lugares desde
-- donde pisar las mismas respuestas.
create unique index if not exists client_onboarding_links_activo_uidx
  on public.client_onboarding_links (sub_client_id)
  where revoked_at is null and kind = 'creator';

-- Y un solo link general activo por organización.
create unique index if not exists client_onboarding_links_general_uidx
  on public.client_onboarding_links (organization_id)
  where revoked_at is null and kind = 'general';

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
--
-- Un envío del link general llega sin cliente (`sub_client_id` nulo) y con el
-- nombre del creador que escribió quien lo completó. Cuando el equipo lo
-- asigna, se completan cliente, creador, `replaced` y `assigned_at`. Si era
-- basura, se descarta (`discarded_at`): no se borra, para que quede rastro.
create table if not exists public.client_onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  sub_client_id uuid references public.client_sub_clients (id) on delete cascade,
  link_id uuid references public.client_onboarding_links (id) on delete set null,
  respondent_name text check (respondent_name is null or char_length(respondent_name) <= 200),
  creator_name text check (creator_name is null or char_length(creator_name) <= 200),
  answers jsonb not null default '{}'::jsonb,
  replaced jsonb not null default '{}'::jsonb,
  labels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  assigned_at timestamptz,
  assigned_by uuid references public.profiles (id) on delete set null,
  discarded_at timestamptz,
  constraint client_onboarding_submissions_destino_check check (
    (sub_client_id is null) = (client_id is null)
  )
);

-- La bandeja: lo que llegó por el link general y nadie asignó ni descartó.
create index if not exists client_onboarding_submissions_bandeja_idx
  on public.client_onboarding_submissions (organization_id, created_at desc)
  where sub_client_id is null and discarded_at is null;

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

-- ─── 5 · Hace cuánto no hay novedades de un cliente ─────────────────────────
--
-- ⭐ «Avisos de hace 15 días que no tenemos update del cliente». Los 15 son de
-- la organización y se cambian desde la app. Una columna y no una tabla de
-- ajustes: hoy es el único número así, y `organizations` ya carga los add-ons.
alter table public.organizations
  add column if not exists client_silence_days integer not null default 15
    check (client_silence_days between 1 and 365);

comment on column public.organizations.client_silence_days is
  'A partir de cuántos días sin novedades un cliente se marca en la lista. Sólo lo usa el add-on growth_partners.';

-- La última novedad de cada cliente de una organización, y de dónde salió.
--
-- ⭐ Qué cuenta como novedad: algo que dice que hubo contacto o que se supo algo
-- del cliente. Una entrada en su línea de tiempo (llamadas, notas, onboarding),
-- una llamada de Fathom, un mensaje que **él** escribió en Discord, un envío de
-- onboarding de uno de sus creadores, un win, la nota o la satisfacción
-- actualizadas. No cuenta `clients.updated_at`: cambia con cualquier edición,
-- y renombrar a alguien no es tener noticias de él.
--
-- Un cliente sin nada de eso cuenta desde su alta: uno nuevo con el que nadie
-- habló en 15 días también tiene que aparecer.
--
-- Sólo service role: la llama el servidor con la organización ya validada.
create or replace function public.client_last_activity(p_org uuid)
returns table (client_id uuid, last_at timestamptz, source text)
language sql
stable
security definer
set search_path = public
as $$
  with eventos as (
    select c.id as client_id, c.created_at as at, 'alta'::text as source
      from public.clients c where c.organization_id = p_org
    union all
    select c.id, c.notes_updated_at, 'nota'
      from public.clients c where c.organization_id = p_org and c.notes_updated_at is not null
    union all
    select c.id, c.satisfaction_updated_at, 'satisfaccion'
      from public.clients c where c.organization_id = p_org and c.satisfaction_updated_at is not null
    union all
    select t.client_id, max(t.created_at), 'linea_de_tiempo'
      from public.client_timeline_entries t where t.organization_id = p_org group by t.client_id
    union all
    select f.client_id, max(f.call_date), 'llamada'
      from public.fathom_calls f
      where f.organization_id = p_org and f.client_id is not null and f.call_date is not null
      group by f.client_id
    union all
    select d.client_id, max(d.sent_at), 'discord'
      from public.discord_messages d
      where d.organization_id = p_org and d.client_id is not null
        and coalesce(d.attributed_by, '') <> 'channel'
      group by d.client_id
    union all
    select s.client_id, max(s.created_at), 'onboarding'
      from public.client_onboarding_submissions s
      where s.organization_id = p_org and s.client_id is not null
      group by s.client_id
    union all
    select w.client_id, max(w.created_at), 'win'
      from public.client_wins w where w.organization_id = p_org group by w.client_id
  )
  select distinct on (e.client_id) e.client_id, e.at, e.source
    from eventos e
    where e.at is not null
    order by e.client_id, e.at desc;
$$;

revoke all on function public.client_last_activity(uuid) from public;
revoke all on function public.client_last_activity(uuid) from anon, authenticated;
grant execute on function public.client_last_activity(uuid) to service_role;
