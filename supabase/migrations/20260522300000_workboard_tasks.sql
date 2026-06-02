-- Tablero de trabajo: tareas por organización (acceso igual para todos los roles del equipo)

create table if not exists public.workboard_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status text not null default 'todo' check (
    status in ('todo', 'in_progress', 'review', 'done')
  ),
  area text not null default 'general' check (
    area in ('marketing', 'ventas', 'operaciones', 'finanzas', 'clientes', 'general')
  ),
  priority text not null default 'medium' check (
    priority in ('low', 'medium', 'high')
  ),
  title text not null,
  description text not null default '',
  assignee_id uuid references public.profiles (id) on delete set null,
  due_date date,
  tags text[] not null default '{}',
  position integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workboard_tasks_org_status_idx
  on public.workboard_tasks (organization_id, status, position);

create index if not exists workboard_tasks_org_due_date_idx
  on public.workboard_tasks (organization_id, due_date);

alter table public.workboard_tasks enable row level security;

-- Cualquier miembro de la org puede gestionar tareas (sin restricción por rol)
drop policy if exists "Org members read workboard_tasks" on public.workboard_tasks;
create policy "Org members read workboard_tasks"
  on public.workboard_tasks for select
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Org members insert workboard_tasks" on public.workboard_tasks;
create policy "Org members insert workboard_tasks"
  on public.workboard_tasks for insert
  with check (organization_id = public.get_my_organization_id());

drop policy if exists "Org members update workboard_tasks" on public.workboard_tasks;
create policy "Org members update workboard_tasks"
  on public.workboard_tasks for update
  using (organization_id = public.get_my_organization_id());

drop policy if exists "Org members delete workboard_tasks" on public.workboard_tasks;
create policy "Org members delete workboard_tasks"
  on public.workboard_tasks for delete
  using (organization_id = public.get_my_organization_id());
