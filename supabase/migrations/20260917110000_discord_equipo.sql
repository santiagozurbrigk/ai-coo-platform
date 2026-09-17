-- Qué usuarios de Discord son gente de tu equipo, y no clientes.
--
-- ⭐ Por qué no era opcional. Medido en el servidor real el 2026-09-17, de las
-- 7 personas que escribieron, **al menos 4 son del propio equipo**:
--
--   | Escribió en Discord | En el equipo de Limitless |
--   |---------------------|---------------------------|
--   | Luckas Falco (4)    | "Luckas Falco" — idéntico  |
--   | Thiago Azcurra (4)  | "Thiago"                   |
--   | Nazareno Gamero (2) | "Nazareno Gamero" — el founder |
--   | Fede McEwen (1)     | "Fede"                     |
--
-- La pantalla de canales las mostraba a las siete con un «7 sin asociar»,
-- invitando a decir qué cliente es cada una. Hacerle caso cargaba mal más de la
-- mitad. Sin esta tabla, lo que se entregó **empuja a meter datos equivocados**.

create table if not exists public.discord_team_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  discord_user_id text not null,

  /**
   * A quién del equipo corresponde. `null` es un caso legítimo, no un dato
   * faltante: alguien que labura con vos y **no tiene cuenta en Limitless** —un
   * editor, un asistente— igual tiene que poder marcarse como equipo. Obligar a
   * elegir una persona lo dejaría afuera, y sus mensajes seguirían contándose
   * como actividad de un cliente.
   *
   * `on delete set null`: si la persona se va de la organización, el usuario de
   * Discord **sigue sin ser un cliente**. Borrar la marca haría que sus
   * mensajes viejos volvieran a atribuirse solos.
   */
  profile_id uuid references public.profiles (id) on delete set null,

  -- Copia del nombre al marcarlo, para poder mostrarlo sin depender de que la
  -- persona haya escrito un mensaje reciente.
  discord_username text,
  discord_display_name text,

  created_at timestamptz not null default now(),
  unique (organization_id, discord_user_id)
);

create index if not exists discord_team_members_org_idx
  on public.discord_team_members (organization_id);

alter table public.discord_team_members enable row level security;

drop policy if exists "org_access" on public.discord_team_members;
create policy "org_access" on public.discord_team_members
  for all using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

comment on table public.discord_team_members is
  'Usuarios de Discord que son del equipo, no clientes. Sus mensajes no se '
  'atribuyen a ningun cliente ni entran al detector de logros. profile_id NULL '
  '= es del equipo pero no tiene cuenta en Limitless.';

-- ─── Nadie puede ser cliente y equipo a la vez ──────────────────────────────
--
-- La exclusión la aplica la aplicación —marcar como equipo borra el vínculo de
-- cliente y al revés—, pero si alguna vez quedan las dos, el orden de lectura
-- decide y eso es una atribución que cambia sin que nadie la haya tocado.
-- Esta limpieza deja el terreno parejo antes de que exista el primer caso.
delete from public.discord_team_members t
 where exists (
   select 1 from public.discord_client_links l
    where l.organization_id = t.organization_id
      and l.discord_user_id = t.discord_user_id
 );
