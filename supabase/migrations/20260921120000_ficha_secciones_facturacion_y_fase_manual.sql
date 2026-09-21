-- Tres pedidos de la ficha del cliente, en una sola migración porque los tres
-- son aditivos y se aplican juntos.
--
--   1 · Las columnas configurables pueden agruparse en secciones (Marketing,
--       Ventas, Sistemas) y decidir si aparecen en la tabla.
--   2 · La facturación **del negocio del cliente**, con historial.
--   3 · La fase del recorrido se puede fijar a mano.

-- ─── 1 · Secciones y visibilidad de las columnas configurables ──────────────
--
-- ⭐ El pedido era "tres apartados con estos 22 campos". La tentación era
-- hornear los 22 en el código. Se descartó por lo mismo que dice el header de
-- `field_definitions`: eso obliga a acertar la lista antes de usarla, y
-- equivocarse cuesta una migración. Lo único que le faltaba al mecanismo que ya
-- existe era **agrupar**.
--
-- Nulo = sin sección, que es el comportamiento de siempre: el campo va al bloque
-- suelto de arriba, como el «Objetivo general» de hoy.
alter table public.field_definitions
  add column if not exists section text
    check (section is null or section in ('marketing', 'ventas', 'sistemas')),
  /**
   * ⭐ Si la columna aparece en la tabla de clientes.
   *
   * Existe por una razón concreta: con 22 campos nuevos, el comportamiento
   * anterior —toda columna activa se dibuja en la tabla— convertiría la lista
   * en una hoja de cálculo de 25 columnas. Por defecto **no**, y se prende una
   * por una.
   *
   * Los campos que ya existen se dejan en `true` más abajo: estaban visibles y
   * apagarlos en silencio sería cambiarle la pantalla a alguien sin avisar.
   */
  add column if not exists show_in_table boolean not null default false;

comment on column public.field_definitions.section is
  'Agrupa la columna en un apartado de la ficha: marketing, ventas o sistemas. Nulo = suelta.';

-- Preservar lo que ya se veía. Sólo los campos de cliente: los de win y
-- checkpoint no se dibujan en la tabla de clientes.
update public.field_definitions
  set show_in_table = true
  where entity = 'client' and section is null;

create index if not exists field_definitions_org_section_idx
  on public.field_definitions (organization_id, entity, section, sort_order);

-- ─── 2 · La facturación del negocio del cliente ─────────────────────────────
--
-- ⭐ Es plata que gana **el cliente con su negocio**, no lo que nos paga a
-- nosotros. Eso último vive en `client_payments` y se mira en Cobros; son dos
-- números distintos que nunca hay que mezclar.
--
-- ⭐ Va como historial y no como una columna en `clients` a propósito. Un
-- cliente que facturaba 4.000 hace seis meses no factura 4.000 hoy, y un número
-- sin fecha se lee como actual: es el mismo error que `satisfaction` resolvió
-- guardando cuándo y quién. Con filas, además, se puede decir cuánto creció —
-- que es lo que hace que el dato sirva para algo más que llenar una celda.
create table if not exists public.client_revenue_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,

  /** El monto facturado. Positivo; cero es un dato válido (un mes sin vender). */
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'USD' check (currency in ('USD', 'ARS')),

  /**
   * El mes al que corresponde (`YYYY-MM-01`).
   *
   * Se guarda como fecha y no como texto para poder ordenar y comparar. El día
   * siempre es 1: lo que se registra es un período, no un instante.
   */
  period date not null,

  note text,

  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dos registros del mismo mes serían dos verdades sobre el mismo período.
-- Cargar de nuevo un mes lo corrige, no lo duplica.
create unique index if not exists client_revenue_client_period_uidx
  on public.client_revenue_entries (client_id, period);

create index if not exists client_revenue_org_client_idx
  on public.client_revenue_entries (organization_id, client_id, period desc);

alter table public.client_revenue_entries enable row level security;

drop policy if exists "Org members read client_revenue" on public.client_revenue_entries;
create policy "Org members read client_revenue"
  on public.client_revenue_entries for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Org members insert client_revenue" on public.client_revenue_entries;
create policy "Org members insert client_revenue"
  on public.client_revenue_entries for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members update client_revenue" on public.client_revenue_entries;
create policy "Org members update client_revenue"
  on public.client_revenue_entries for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members delete client_revenue" on public.client_revenue_entries;
create policy "Org members delete client_revenue"
  on public.client_revenue_entries for delete
  using (organization_id = public.get_my_organization_id());

comment on table public.client_revenue_entries is
  'Facturación del NEGOCIO DEL CLIENTE, por mes. No confundir con client_payments, que es lo que el cliente nos paga a nosotros.';

-- ─── 3 · La fase del recorrido, fijada a mano ───────────────────────────────
--
-- ⭐ El problema, con la captura del founder delante: la fase se **deduce** del
-- último hito registrado. Un cliente que entra directo a «Creando primer
-- webinar» —porque llega para hacer un webinar con un creador y ya— queda en
-- «Sin empezar» hasta que alguien tilde los cuatro hitos de la fase anterior,
-- que ese cliente nunca hizo. O sea: para decir la verdad sobre dónde está, hay
-- que mentir sobre lo que hizo.
--
-- ⭐ La fase manual **no registra hitos**. Los de las fases anteriores quedan
-- sin evento y la ficha los muestra como *salteados*, en gris. Marcarlos como
-- cumplidos habría sido más barato y habría dejado el historial diciendo que el
-- cliente alcanzó cosas que no alcanzó — y ese historial es el que después
-- alimenta los plazos, los trabados y los reportes.
alter table public.clients
  add column if not exists manual_stage_id uuid
    references public.client_journey_stages (id) on delete set null,
  /**
   * Desde cuándo está en esa fase.
   *
   * ⚠️ Hoy **nadie lo lee todavía**: se guarda, no se usa. Se agrega ahora
   * porque es el único dato que no se puede reconstruir después — el día que
   * `deriveClientJourneyStatus` quiera contar los plazos de una fase fijada a
   * mano (su primer hito no tiene anterior, así que hoy ese cliente nunca
   * aparece como trabado), va a necesitar exactamente esto, y sin haberlo
   * guardado desde el principio habría que inventarlo. Queda anotado en
   * PENDIENTES.md.
   */
  add column if not exists manual_stage_set_at timestamptz;

comment on column public.clients.manual_stage_id is
  'Fase del recorrido fijada a mano. La fase efectiva es la más avanzada entre ésta y la derivada de los hitos registrados.';
