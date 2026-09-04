-- A · WINS — tracker de logros de clientes y dashboard de casos.
--
-- Hasta acá un cliente exitoso era un booleano (`clients.is_success_case`):
-- prendido o apagado, sin fecha, sin logro y sin número. Armar una landing o una
-- propuesta dependía de acordarse de memoria.
--
-- ⭐ El problema de diseño que resuelve el modelo: el tracker y el dashboard NO
-- piden los mismos datos. El tracker es por win (fecha, logro, captura); el
-- dashboard es por cliente (nicho, punto inicial → final, plazo). Lo segundo
-- sale sólo si cada win puede llevar una **medida comparable** — clave, valor y
-- unidad. Sin dos puntos comparables, el dashboard dice "sin medir".
--
-- Sin backfill: no hay wins previos que migrar.

-- ─── Storage: las capturas van en un bucket PRIVADO ─────────────────────────
--
-- Resultados de clientes (pantallazos de facturación, de métricas) no van en un
-- bucket público. Se acceden por signed URL, igual que 'trial-reels'.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-wins',
  'client-wins',
  false,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- ─── El cliente gana nicho y baseline ───────────────────────────────────────
--
-- `niche` es el nicho DEL CLIENTE. `organizations.industry` ya existe pero es el
-- nicho de la organización dueña de OTC, que es otra cosa.
--
-- El baseline es el "antes de empezar": vive en el cliente y no en un win porque
-- no es un logro, es el punto de partida contra el que se miden los logros.
alter table public.clients
  add column if not exists niche text,
  add column if not exists baseline_metric_key text,
  add column if not exists baseline_metric_value numeric,
  add column if not exists baseline_metric_unit text,
  add column if not exists baseline_captured_at timestamptz;

-- ─── El win ─────────────────────────────────────────────────────────────────
create table if not exists public.client_wins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,

  win_date date not null default current_date,
  /** Qué logró, en palabras. Es lo único obligatorio además del cliente y la fecha. */
  achievement text not null,

  /**
   * ⭐ La medida. Opcional, y es lo que hace posible el dashboard.
   *
   * Dos wins son comparables sólo si comparten `metric_key` **y** `metric_unit`:
   * facturación en USD y en ARS no se restan. La comparación la hace
   * `lib/wins/derive-case.ts`, no la base.
   */
  metric_key text,
  metric_value numeric,
  metric_unit text,

  /**
   * ⭐ Acá viven "tipo de win", "fase" y toda columna configurable (C0).
   * Las claves son las de `field_definitions` con entity = 'win'.
   */
  custom jsonb not null default '{}'::jsonb,

  /**
   * De dónde salió. 'discord' y 'fathom' llegan por el mismo criterio que los
   * checkpoints: proponen, alguien acepta. Nunca se crea un win solo.
   */
  source text not null default 'manual' check (
    source in ('manual', 'discord', 'fathom')
  ),
  source_ref text,

  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_wins_org_idx
  on public.client_wins (organization_id, win_date desc);

create index if not exists client_wins_client_idx
  on public.client_wins (client_id, win_date desc);

-- Para el dashboard: buscar los wins con medida de una clave concreta.
create index if not exists client_wins_metric_idx
  on public.client_wins (client_id, metric_key, win_date)
  where metric_key is not null and metric_value is not null;

-- ─── Las capturas ───────────────────────────────────────────────────────────
--
-- Mismo patrón que `sop_attachments`: `draft_id` permite subir antes de que el
-- win exista, y al guardar se enganchan por `win_id`.
create table if not exists public.win_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  win_id uuid references public.client_wins (id) on delete cascade,
  /** Agrupa las subidas de un formulario que todavía no guardó. */
  draft_id uuid,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  file_size integer,
  created_at timestamptz not null default now()
);

create index if not exists win_attachments_win_idx
  on public.win_attachments (win_id) where win_id is not null;

create index if not exists win_attachments_draft_idx
  on public.win_attachments (draft_id) where draft_id is not null;

-- Un adjunto tiene que colgar de un win o de un borrador; suelto no sirve.
alter table public.win_attachments
  drop constraint if exists win_attachments_owner_check;
alter table public.win_attachments
  add constraint win_attachments_owner_check
  check (win_id is not null or draft_id is not null);

-- ─── Dónde se usó ───────────────────────────────────────────────────────────
--
-- ⭐ Es una tabla y no dos columnas porque un caso bueno se usa en varios lados,
-- y la pregunta real del dashboard es "¿dónde está usado este caso?". Con
-- `used boolean + used_where text` esa pregunta no se puede responder sin leer
-- texto libre.
create table if not exists public.win_usages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  win_id uuid not null references public.client_wins (id) on delete cascade,
  channel text not null check (
    channel in ('landing', 'vsl', 'ad', 'story', 'dm', 'proposal', 'other')
  ),
  /** Dónde exactamente, en palabras: "landing de la mentoría", "VSL del webinar". */
  location_label text,
  url text,
  used_at date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists win_usages_win_idx on public.win_usages (win_id);
create index if not exists win_usages_org_idx
  on public.win_usages (organization_id, channel);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table public.client_wins enable row level security;

drop policy if exists "Users read org wins" on public.client_wins;
create policy "Users read org wins" on public.client_wins for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org wins" on public.client_wins;
create policy "Users insert org wins" on public.client_wins for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org wins" on public.client_wins;
create policy "Users update org wins" on public.client_wins for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org wins" on public.client_wins;
create policy "Users delete org wins" on public.client_wins for delete
  using (organization_id = public.get_my_organization_id());

alter table public.win_attachments enable row level security;

drop policy if exists "Users read org win attachments" on public.win_attachments;
create policy "Users read org win attachments" on public.win_attachments for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org win attachments" on public.win_attachments;
create policy "Users insert org win attachments" on public.win_attachments for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org win attachments" on public.win_attachments;
create policy "Users update org win attachments" on public.win_attachments for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org win attachments" on public.win_attachments;
create policy "Users delete org win attachments" on public.win_attachments for delete
  using (organization_id = public.get_my_organization_id());

alter table public.win_usages enable row level security;

drop policy if exists "Users read org win usages" on public.win_usages;
create policy "Users read org win usages" on public.win_usages for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org win usages" on public.win_usages;
create policy "Users insert org win usages" on public.win_usages for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org win usages" on public.win_usages;
create policy "Users update org win usages" on public.win_usages for update
  using (organization_id = public.get_my_organization_id())
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org win usages" on public.win_usages;
create policy "Users delete org win usages" on public.win_usages for delete
  using (organization_id = public.get_my_organization_id());

-- ─── updated_at ─────────────────────────────────────────────────────────────

drop trigger if exists client_wins_updated_at on public.client_wins;
create trigger client_wins_updated_at
  before update on public.client_wins
  for each row execute function public.set_updated_at();
