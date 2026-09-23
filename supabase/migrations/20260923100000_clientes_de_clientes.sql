-- Los clientes de un cliente — sólo para organizaciones con el add-on
-- `growth_partners`.
--
-- ⭐ El pedido: Limitless le vende una consultoría a *growth partners*, y cada
-- growth partner trabaja con varios infoproductores a la vez. Marketing, Ventas
-- y Sistemas (Avatar, Oferta, GHL, WebinarJam…) son datos **del negocio del
-- infoproductor**, no del growth partner. Hasta ahora se cargaban una sola vez
-- por cliente, como si el growth partner fuera el dueño del negocio.
--
-- Lo mínimo que hace falta: un nombre, un link opcional (Instagram) y los
-- valores de las mismas columnas configurables con sección que ya existen
-- (`field_definitions.section`). No se crea un catálogo aparte: renombrar
-- «Método único» sigue siendo una edición en Campos personalizados y vale para
-- todos los clientes de todos los growth partners.
--
-- ⭐ El nombre de la tabla es `client_sub_clients` y no `client_clients`: se lee
-- como "los sub-clientes de un cliente" y no se confunde con `clients`.

create table if not exists public.client_sub_clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  /** El growth partner. Si se borra, se borran sus clientes. */
  client_id uuid not null references public.clients (id) on delete cascade,

  name text not null check (char_length(btrim(name)) between 1 and 200),
  /** Un link, pensado para el Instagram del infoproductor. Opcional. */
  instagram_url text check (instagram_url is null or char_length(instagram_url) <= 500),

  /**
   * Los valores de Marketing, Ventas y Sistemas, con la clave del
   * `field_definitions`. El mismo patrón que `clients.custom`.
   */
  custom jsonb not null default '{}'::jsonb,

  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_sub_clients_org_client_idx
  on public.client_sub_clients (organization_id, client_id, created_at);

alter table public.client_sub_clients enable row level security;

drop policy if exists "Org members read client_sub_clients" on public.client_sub_clients;
create policy "Org members read client_sub_clients"
  on public.client_sub_clients for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Org members insert client_sub_clients" on public.client_sub_clients;
create policy "Org members insert client_sub_clients"
  on public.client_sub_clients for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members update client_sub_clients" on public.client_sub_clients;
create policy "Org members update client_sub_clients"
  on public.client_sub_clients for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members delete client_sub_clients" on public.client_sub_clients;
create policy "Org members delete client_sub_clients"
  on public.client_sub_clients for delete
  using (organization_id = public.get_my_organization_id());

comment on table public.client_sub_clients is
  'Los clientes de un cliente (p. ej. los infoproductores de un growth partner), con sus valores de Marketing, Ventas y Sistemas. Sólo se usa con el add-on growth_partners.';

-- ─── El add-on, prendido para Limitless ─────────────────────────────────────
--
-- ⭐ Se busca la organización por el mail de la cuenta y no por su id: un id
-- escrito acá no existe en una base armada desde cero, y el mail sí dice de
-- quién se trata. Se mira `auth.users` (el mail con el que se entra) y
-- `profiles.email` por si difieren. Si no hay ninguna, no hace nada.
--
-- Después de esto el add-on se prende y se apaga desde Super Admin, como los
-- demás.
update public.organizations o
  set enabled_add_ons = array_append(o.enabled_add_ons, 'growth_partners')
  where not ('growth_partners' = any (o.enabled_add_ons))
    and o.id in (
      select p.organization_id
        from public.profiles p
        left join auth.users u on u.id = p.id
        where p.organization_id is not null
          and (
            lower(p.email) = 'limitless@limit-less.llc'
            or lower(u.email) = 'limitless@limit-less.llc'
          )
    );
