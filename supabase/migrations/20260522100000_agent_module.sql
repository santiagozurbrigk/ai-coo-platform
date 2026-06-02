-- Agente de negocio: proyectos, etapas, conversaciones, mensajes + SOPs

create table if not exists public.agent_projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  color text not null default 'violet',
  created_at timestamptz not null default now()
);

create index if not exists agent_projects_organization_id_idx
  on public.agent_projects (organization_id);

create table if not exists public.business_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists business_stages_organization_id_idx
  on public.business_stages (organization_id, order_index);

create table if not exists public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.agent_projects (id) on delete set null,
  stage_id uuid references public.business_stages (id) on delete set null,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_conversations_organization_id_idx
  on public.agent_conversations (organization_id, updated_at desc);

create index if not exists agent_conversations_project_id_idx
  on public.agent_conversations (project_id)
  where project_id is not null;

create index if not exists agent_conversations_stage_id_idx
  on public.agent_conversations (stage_id)
  where stage_id is not null;

create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.agent_conversations (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  attachments jsonb,
  action_type text check (
    action_type is null
    or action_type in ('created_sop', 'created_document')
  ),
  action_ref_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists agent_messages_conversation_id_idx
  on public.agent_messages (conversation_id, created_at);

create table if not exists public.sops (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  department text not null default 'general',
  content text not null default '',
  goal text,
  status text not null default 'draft' check (
    status in ('draft', 'active', 'outdated')
  ),
  created_by text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sops_organization_id_idx
  on public.sops (organization_id, updated_at desc);

-- RLS
alter table public.agent_projects enable row level security;
alter table public.business_stages enable row level security;
alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;
alter table public.sops enable row level security;

drop policy if exists "Users read org agent_projects" on public.agent_projects;
create policy "Users read org agent_projects"
  on public.agent_projects for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org agent_projects" on public.agent_projects;
create policy "Users insert org agent_projects"
  on public.agent_projects for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org agent_projects" on public.agent_projects;
create policy "Users update org agent_projects"
  on public.agent_projects for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org agent_projects" on public.agent_projects;
create policy "Users delete org agent_projects"
  on public.agent_projects for delete
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users read org business_stages" on public.business_stages;
create policy "Users read org business_stages"
  on public.business_stages for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org business_stages" on public.business_stages;
create policy "Users insert org business_stages"
  on public.business_stages for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org business_stages" on public.business_stages;
create policy "Users update org business_stages"
  on public.business_stages for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org business_stages" on public.business_stages;
create policy "Users delete org business_stages"
  on public.business_stages for delete
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users read org agent_conversations" on public.agent_conversations;
create policy "Users read org agent_conversations"
  on public.agent_conversations for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org agent_conversations" on public.agent_conversations;
create policy "Users insert org agent_conversations"
  on public.agent_conversations for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org agent_conversations" on public.agent_conversations;
create policy "Users update org agent_conversations"
  on public.agent_conversations for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org agent_conversations" on public.agent_conversations;
create policy "Users delete org agent_conversations"
  on public.agent_conversations for delete
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users read org agent_messages" on public.agent_messages;
create policy "Users read org agent_messages"
  on public.agent_messages for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org agent_messages" on public.agent_messages;
create policy "Users insert org agent_messages"
  on public.agent_messages for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users read org sops" on public.sops;
create policy "Users read org sops"
  on public.sops for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users insert org sops" on public.sops;
create policy "Users insert org sops"
  on public.sops for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Users update org sops" on public.sops;
create policy "Users update org sops"
  on public.sops for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Users delete org sops" on public.sops;
create policy "Users delete org sops"
  on public.sops for delete
  using (organization_id = public.get_my_organization_id());
