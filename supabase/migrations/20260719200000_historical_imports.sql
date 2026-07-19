-- Importador de métricas históricas

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  module text not null check (module in ('closing', 'finance', 'content')),
  file_name text not null,
  status text not null default 'pending' check (
    status in ('pending', 'completed', 'undone', 'error')
  ),
  rows_imported integer not null default 0,
  rows_skipped integer not null default 0,
  skip_reasons jsonb not null default '[]'::jsonb,
  column_mapping jsonb not null default '{}'::jsonb,
  selected_sheets jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists import_batches_organization_id_idx
  on public.import_batches (organization_id);

alter table public.import_batches enable row level security;

create policy "Users read org import batches"
  on public.import_batches for select
  using (organization_id = public.get_my_organization_id());

create policy "Users insert org import batches"
  on public.import_batches for insert
  with check (organization_id = public.get_my_organization_id());

create policy "Users update org import batches"
  on public.import_batches for update
  using (organization_id = public.get_my_organization_id());

create policy "Users delete org import batches"
  on public.import_batches for delete
  using (organization_id = public.get_my_organization_id());

-- Columnas de trazabilidad de importación en closing_calls
alter table public.closing_calls
  add column if not exists import_source text,
  add column if not exists import_batch_id uuid references public.import_batches (id) on delete set null,
  add column if not exists setter_name text,
  add column if not exists amount numeric;

create index if not exists closing_calls_import_batch_id_idx
  on public.closing_calls (import_batch_id)
  where import_batch_id is not null;
