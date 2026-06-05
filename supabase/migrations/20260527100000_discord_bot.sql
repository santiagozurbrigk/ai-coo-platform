-- Discord bot integration (Phase 2)

alter table public.clients
  add column if not exists email text;

create table if not exists public.discord_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade unique,
  guild_id text not null unique,
  guild_name text,
  bot_name text default 'Asistente OTC',
  monitored_channels jsonb not null default '[]'::jsonb,
  auto_monitor_pattern text default 'cliente-',
  status text not null default 'connected',
  last_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discord_client_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  discord_user_id text not null,
  discord_username text,
  discord_display_name text,
  link_method text not null,
  link_confidence numeric(3, 2) default 1.00,
  linked_at timestamptz not null default now(),
  unique (organization_id, discord_user_id)
);

create table if not exists public.discord_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  discord_message_id text not null unique,
  discord_user_id text not null,
  discord_username text,
  discord_display_name text,
  guild_id text not null,
  channel_id text not null,
  channel_name text,
  content text not null,
  message_type text not null default 'message',
  attachments jsonb not null default '[]'::jsonb,
  is_testimonial boolean not null default false,
  ai_sentiment text,
  ai_summary text,
  requires_attention boolean not null default false,
  sent_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.discord_pending_channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  guild_id text not null,
  channel_id text not null unique,
  channel_name text not null,
  detected_at timestamptz not null default now(),
  status text not null default 'pending',
  resolved_at timestamptz
);

create table if not exists public.discord_pending_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  discord_user_id text not null,
  discord_username text,
  discord_display_name text,
  email_attempted text,
  channel_id text,
  channel_name text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (organization_id, discord_user_id)
);

create index if not exists discord_messages_org_client_idx
  on public.discord_messages (organization_id, client_id);
create index if not exists discord_messages_org_sent_at_idx
  on public.discord_messages (organization_id, sent_at desc);
create index if not exists discord_client_links_org_idx
  on public.discord_client_links (organization_id);

alter table public.discord_integrations enable row level security;
alter table public.discord_client_links enable row level security;
alter table public.discord_messages enable row level security;
alter table public.discord_pending_channels enable row level security;
alter table public.discord_pending_links enable row level security;

create policy "org_access" on public.discord_integrations
  for all using (organization_id = public.get_my_organization_id());

create policy "org_access" on public.discord_client_links
  for all using (organization_id = public.get_my_organization_id());

create policy "org_access" on public.discord_messages
  for all using (organization_id = public.get_my_organization_id());

create policy "org_access" on public.discord_pending_channels
  for all using (organization_id = public.get_my_organization_id());

create policy "org_access" on public.discord_pending_links
  for all using (organization_id = public.get_my_organization_id());
