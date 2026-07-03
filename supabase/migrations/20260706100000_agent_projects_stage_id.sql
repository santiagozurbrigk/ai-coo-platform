-- Proyectos del agente asociados a una etapa de negocio.
-- Aplicar en Supabase (SQL Editor) si agent_projects no tiene stage_id.
--
-- Nullable: proyectos existentes antes de esta migración quedan sin etapa.
-- La app exige stage_id al crear proyectos nuevos; no se usa NOT NULL en DB.

alter table public.agent_projects
  add column if not exists stage_id uuid references public.business_stages (id) on delete set null;

comment on column public.agent_projects.stage_id is
  'Etapa de negocio a la que pertenece el proyecto. Obligatorio en creaciones nuevas vía app.';

create index if not exists agent_projects_stage_id_idx
  on public.agent_projects (organization_id, stage_id)
  where stage_id is not null;
