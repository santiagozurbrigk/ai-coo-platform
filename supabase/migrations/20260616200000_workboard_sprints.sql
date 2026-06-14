-- Workboard: sprints persistentes + FK en tareas

CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  area_focus TEXT CHECK (
    area_focus IN ('ventas', 'marketing', 'operaciones', 'delivery', 'producto', 'general')
  ),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('planning', 'active', 'completed')
  ),
  completion_rate INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.workboard_tasks
  ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES public.sprints (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS sprints_org_status_idx
  ON public.sprints (organization_id, status);

CREATE INDEX IF NOT EXISTS workboard_tasks_sprint_idx
  ON public.workboard_tasks (sprint_id);

ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members read sprints"
  ON public.sprints FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Org members insert sprints"
  ON public.sprints FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Org members update sprints"
  ON public.sprints FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Org members delete sprints"
  ON public.sprints FOR DELETE
  USING (organization_id = public.get_my_organization_id());
