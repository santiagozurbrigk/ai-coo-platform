-- Oleada A: closing_calls + FK en clients

create table if not exists public.closing_calls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_name text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'closed', 'not_closed', 'no_show')
  ),
  conversation_id text,
  form_answers jsonb not null default '[]'::jsonb,
  fathom_url text,
  outcome jsonb,
  closed_by_name text,
  payment_source_platform_id text,
  payment_destination_platform_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists closing_calls_organization_id_idx
  on public.closing_calls (organization_id);

create index if not exists closing_calls_scheduled_at_idx
  on public.closing_calls (organization_id, scheduled_at);

alter table public.closing_calls enable row level security;

drop policy if exists "Users read org closing calls" on public.closing_calls;
create policy "Users read org closing calls"
  on public.closing_calls for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org closing calls" on public.closing_calls;
create policy "Users insert org closing calls"
  on public.closing_calls for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org closing calls" on public.closing_calls;
create policy "Users update org closing calls"
  on public.closing_calls for update
  using (organization_id = public.get_my_organization_id());

-- FK clients → closing_calls (columna era text con IDs mock)
update public.clients
set closing_call_id = null
where closing_call_id is not null
  and closing_call_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

alter table public.clients
  drop constraint if exists clients_closing_call_id_fkey;

alter table public.clients
  alter column closing_call_id type uuid
  using (
    case
      when closing_call_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then closing_call_id::uuid
      else null
    end
  );

alter table public.clients
  add constraint clients_closing_call_id_fkey
  foreign key (closing_call_id) references public.closing_calls (id)
  on delete set null;
