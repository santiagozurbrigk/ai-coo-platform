alter table public.agent_projects
  add column if not exists stage_id uuid references public.business_stages (id) on delete cascade;

create index if not exists agent_projects_stage_id_idx
  on public.agent_projects (stage_id)
  where stage_id is not null;
