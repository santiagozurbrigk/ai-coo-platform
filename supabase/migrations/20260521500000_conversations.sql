-- Oleada C: conversaciones de ventas (inbox) por organización

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  lead_name text not null,
  status text not null default 'active' check (
    status in ('active', 'ghosted', 'booked', 'closed')
  ),
  tag text check (
    tag is null
    or tag in (
      'muy-calificado',
      'calificado',
      'descalificado',
      'muy-descalificado',
      'agendado',
      'closeado',
      'no-closeado'
    )
  ),
  last_message text not null default '',
  last_message_at timestamptz not null default now(),
  unread boolean not null default false,
  messages jsonb not null default '[]'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversations_org_external_ref_idx
  on public.conversations (organization_id, external_ref)
  where external_ref is not null;

create index if not exists conversations_organization_id_idx
  on public.conversations (organization_id);

create index if not exists conversations_last_message_at_idx
  on public.conversations (organization_id, last_message_at desc);

alter table public.conversations enable row level security;

drop policy if exists "Users read org conversations" on public.conversations;
create policy "Users read org conversations"
  on public.conversations for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org conversations" on public.conversations;
create policy "Users insert org conversations"
  on public.conversations for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org conversations" on public.conversations;
create policy "Users update org conversations"
  on public.conversations for update
  using (organization_id = public.get_my_organization_id());
