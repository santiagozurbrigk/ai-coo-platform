-- Fase 2 del módulo de llamadas: seguimiento del lead.
--
-- Hasta acá cada turno era una fila suelta. Los reagendamientos ya estaban en
-- los datos y quedaban huérfanos: un lead con 7 turnos en 2 días eran 7 filas
-- sin relación entre sí. Y de 1.027 turnos, 0 tenían resultado cargado — porque
-- cuando una llamada no cerraba no había dónde anotar qué seguía.

-- ─── El lead como entidad ───────────────────────────────────────────────────
--
-- Es lo que permite hilar varios intentos de la misma persona. La identidad es
-- el mail; el teléfono y el contacto de GHL sirven de respaldo cuando no lo hay.
create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  ghl_contact_id text,
  /** Cliente en que se convirtió, cuando compró. Cierra el ciclo lead → cliente. */
  client_id uuid references public.clients (id) on delete set null,
  first_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Un lead por mail dentro de la organización. Parcial porque el mail puede
-- faltar: esos leads no se deduplican, que es preferible a fusionar personas
-- distintas por tener el mismo nombre.
create unique index if not exists sales_leads_org_email_uidx
  on public.sales_leads (organization_id, lower(email))
  where email is not null and email <> '';

create unique index if not exists sales_leads_org_ghl_contact_uidx
  on public.sales_leads (organization_id, ghl_contact_id)
  where ghl_contact_id is not null and ghl_contact_id <> '';

create index if not exists sales_leads_org_idx on public.sales_leads (organization_id);
create index if not exists sales_leads_client_idx on public.sales_leads (client_id)
  where client_id is not null;

alter table public.sales_leads enable row level security;

drop policy if exists "Users read org sales leads" on public.sales_leads;
create policy "Users read org sales leads"
  on public.sales_leads for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org sales leads" on public.sales_leads;
create policy "Users insert org sales leads"
  on public.sales_leads for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org sales leads" on public.sales_leads;
create policy "Users update org sales leads"
  on public.sales_leads for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

-- ─── El turno pasa a ser un intento dentro del hilo del lead ────────────────

alter table public.closing_calls
  add column if not exists lead_id uuid references public.sales_leads (id) on delete set null;

create index if not exists closing_calls_lead_idx
  on public.closing_calls (lead_id, scheduled_at desc)
  where lead_id is not null;

-- ─── Próximo paso ───────────────────────────────────────────────────────────
--
-- ⭐ Es lo que convierte "no cerró" en trabajo agendado en vez de un callejón
-- sin salida. Sin esto, el closer no tenía dónde anotar que la llamada derivó en
-- una reagenda para el jueves, y el lead se perdía.
alter table public.closing_calls
  add column if not exists next_action text
    check (
      next_action is null
      or next_action in (
        'reschedule',   -- quedó en volver a agendar
        'follow_up',    -- hay que seguirlo (mensaje, llamada, propuesta)
        'waiting_lead', -- la pelota está del lado del lead
        'lost'          -- se da por perdido
      )
    );

alter table public.closing_calls
  add column if not exists next_action_at timestamptz;

alter table public.closing_calls
  add column if not exists next_action_owner_id uuid
    references public.profiles (id) on delete set null;

alter table public.closing_calls
  add column if not exists next_action_notes text;

-- Cola de seguimiento: lo que vence y todavía no se resolvió.
create index if not exists closing_calls_next_action_idx
  on public.closing_calls (organization_id, next_action_at)
  where next_action is not null and next_action <> 'lost';

-- ─── Calificación del lead ──────────────────────────────────────────────────
--
-- Dos momentos distintos y deliberadamente separados: lo que se sabía **antes**
-- de la llamada (del formulario de reserva) y lo que se supo **después**.
-- Colapsarlas en un solo campo perdería exactamente la información útil: si el
-- lead resultó mejor o peor de lo que parecía al agendar.
alter table public.closing_calls
  add column if not exists pre_call_qualification text
    check (
      pre_call_qualification is null
      or pre_call_qualification in ('hot', 'warm', 'cold', 'unqualified')
    );

alter table public.closing_calls
  add column if not exists post_call_qualification text
    check (
      post_call_qualification is null
      or post_call_qualification in ('hot', 'warm', 'cold', 'unqualified')
    );

-- ─── Hilado de los turnos existentes ────────────────────────────────────────
--
-- Crea un lead por cada contacto de GHL ya conocido y engancha sus turnos. Es
-- **aditivo**: no modifica estado, resultado ni ninguna otra columna de los
-- turnos existentes. Las reagendas ya estaban en los datos —hay contactos con
-- varios turnos en días distintos— y esto las junta en un hilo.
--
-- No se inventa nada: los turnos sin contacto de GHL y sin mail quedan sin lead
-- hasta que un sync les complete la identidad.

insert into public.sales_leads (organization_id, name, ghl_contact_id, first_seen_at)
select
  cc.organization_id,
  (array_agg(cc.lead_name order by cc.scheduled_at))[1],
  cc.ghl_contact_id,
  min(cc.scheduled_at)
from public.closing_calls cc
where cc.ghl_contact_id is not null
  and cc.ghl_contact_id <> ''
  and cc.lead_id is null
group by cc.organization_id, cc.ghl_contact_id
on conflict do nothing;

update public.closing_calls cc
set lead_id = sl.id
from public.sales_leads sl
where cc.lead_id is null
  and cc.ghl_contact_id is not null
  and cc.ghl_contact_id <> ''
  and sl.organization_id = cc.organization_id
  and sl.ghl_contact_id = cc.ghl_contact_id;
