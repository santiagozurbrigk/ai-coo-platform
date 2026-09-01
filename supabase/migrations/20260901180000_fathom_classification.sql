-- Fase 1 del módulo de llamadas: clasificación e identidad.
--
-- Hasta acá OTC decidía qué era una llamada leyendo su título, y el 86% de los
-- títulos reales son "Impromptu Google Meet Meeting". El resultado medible: 0 de
-- 248 llamadas asociadas a un cliente, con 264 clientes cargados.
--
-- La API de Fathom venía devolviendo desde siempre lo que hacía falta —los
-- invitados del calendario, con mail y si son externos— y el parser lo tiraba.

-- ─── Señales que ahora se guardan ───────────────────────────────────────────

-- Invitados del calendario, tal como los devuelve Fathom. Se persiste el array
-- completo y no sólo los mails para poder revisar a mano un vínculo dudoso sin
-- volver a pegarle a la API.
alter table public.fathom_calls
  add column if not exists calendar_invitees jsonb not null default '[]'::jsonb;

-- Tipo de reunión asignado en Fathom. `null` cuando la organización no usa
-- tipos, que es un caso normal y no un error.
alter table public.fathom_calls
  add column if not exists meeting_type text;

-- ─── Los dos ejes, separados ────────────────────────────────────────────────
--
-- `call_type` mezclaba "con quién" y "para qué" en un solo campo, y el fracaso
-- de la primera pregunta decidía la segunda en silencio. Una llamada de venta es
-- con un *lead* —que por definición todavía no es cliente—, así que el sistema
-- viejo, que buscaba clientes, las mandaba todas a `unmatched`.
--
-- `call_type` se deja intacta: la lee la UI actual y se retira en la Fase 2.

alter table public.fathom_calls
  add column if not exists counterparty text
    check (counterparty is null or counterparty in ('lead', 'client', 'internal'));

alter table public.fathom_calls
  add column if not exists purpose text
    check (purpose is null or purpose in ('sales', 'delivery', 'team'));

-- Señales que produjeron la clasificación. Sin esto, un vínculo no se puede
-- auditar: no habría forma de saber si salió del cruce con la agenda o de que
-- alguien tipeó un título.
alter table public.fathom_calls
  add column if not exists classification_signals text[] not null default '{}';

-- Por qué quedó sin clasificar. Es lo que la cola de revisión le muestra al
-- usuario, en lugar de un valor inventado.
alter table public.fathom_calls
  add column if not exists unclassified_reason text
    check (
      unclassified_reason is null
      or unclassified_reason in ('no_signal', 'external_unknown_purpose')
    );

-- Nombre declarado en el título por la convención `tipo - quién`. Se guarda
-- aunque no haya resuelto la identidad: sirve para revisar a mano.
alter table public.fathom_calls
  add column if not exists declared_name text;

-- ─── El vínculo que faltaba ─────────────────────────────────────────────────
--
-- `closing_calls` (la agenda) y `fathom_calls` (la grabación) representan la
-- misma llamada y no tenían ninguna FK entre sí. El único cruce era un
-- `ilike '%nombre%'` que tomaba el turno más reciente sin mirar fechas.
alter table public.fathom_calls
  add column if not exists closing_call_id uuid
    references public.closing_calls (id) on delete set null;

-- Cómo se resolvió el vínculo, para poder revisar los de confianza media.
alter table public.fathom_calls
  add column if not exists appointment_match jsonb;

create index if not exists fathom_calls_closing_call_idx
  on public.fathom_calls (closing_call_id)
  where closing_call_id is not null;

create index if not exists fathom_calls_org_purpose_idx
  on public.fathom_calls (organization_id, purpose);

-- Cola de revisión: llamadas ya procesadas que no se pudieron clasificar.
create index if not exists fathom_calls_unclassified_idx
  on public.fathom_calls (organization_id, call_date desc)
  where purpose is null and status not in ('pending', 'processing');

-- ─── Mapeo de tipos de reunión ──────────────────────────────────────────────
--
-- La organización decide, una vez, qué significa cada tipo de reunión de Fathom.
--
-- ⭐ La clave es el **nombre**, no un ID: la API de Fathom no expone
-- identificador para los tipos. Si alguien renombra un tipo, la fila queda
-- huérfana — por eso la UI compara contra la lista viva y avisa, en vez de dejar
-- de clasificar en silencio.
create table if not exists public.fathom_meeting_type_map (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  meeting_type_name text not null,
  purpose text not null check (purpose in ('sales', 'delivery', 'team')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, meeting_type_name)
);

create index if not exists fathom_meeting_type_map_org_idx
  on public.fathom_meeting_type_map (organization_id);

alter table public.fathom_meeting_type_map enable row level security;

drop policy if exists "Users read org meeting type map" on public.fathom_meeting_type_map;
create policy "Users read org meeting type map"
  on public.fathom_meeting_type_map for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org meeting type map" on public.fathom_meeting_type_map;
create policy "Users insert org meeting type map"
  on public.fathom_meeting_type_map for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org meeting type map" on public.fathom_meeting_type_map;
create policy "Users update org meeting type map"
  on public.fathom_meeting_type_map for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org meeting type map" on public.fathom_meeting_type_map;
create policy "Users delete org meeting type map"
  on public.fathom_meeting_type_map for delete
  using (organization_id = public.get_my_organization_id());
