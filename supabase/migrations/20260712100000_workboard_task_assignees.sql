-- Multi-assignee support for workboard tasks

CREATE TABLE IF NOT EXISTS public.workboard_task_assignees (
  task_id UUID NOT NULL REFERENCES public.workboard_tasks(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, profile_id)
);

CREATE INDEX IF NOT EXISTS workboard_task_assignees_org_profile_idx
  ON public.workboard_task_assignees (organization_id, profile_id);

CREATE INDEX IF NOT EXISTS workboard_task_assignees_task_idx
  ON public.workboard_task_assignees (task_id);

-- Backfill from legacy single assignee column
INSERT INTO public.workboard_task_assignees (task_id, profile_id, organization_id)
SELECT id, assignee_id, organization_id
FROM public.workboard_tasks
WHERE assignee_id IS NOT NULL
ON CONFLICT (task_id, profile_id) DO NOTHING;

ALTER TABLE public.workboard_task_assignees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read workboard_task_assignees" ON public.workboard_task_assignees;
CREATE POLICY "Org members read workboard_task_assignees"
  ON public.workboard_task_assignees FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members insert workboard_task_assignees" ON public.workboard_task_assignees;
CREATE POLICY "Org members insert workboard_task_assignees"
  ON public.workboard_task_assignees FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members update workboard_task_assignees" ON public.workboard_task_assignees;
CREATE POLICY "Org members update workboard_task_assignees"
  ON public.workboard_task_assignees FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members delete workboard_task_assignees" ON public.workboard_task_assignees;
CREATE POLICY "Org members delete workboard_task_assignees"
  ON public.workboard_task_assignees FOR DELETE
  USING (organization_id = public.get_my_organization_id());

-- Time report: attribute logged time to who logged it; fallback to assignees for legacy rows
DROP VIEW IF EXISTS public.workboard_time_by_member;

CREATE OR REPLACE VIEW public.workboard_time_by_member
WITH (security_invoker = true)
AS
SELECT
  wt.organization_id,
  (entry.value->>'logged_by')::uuid AS assignee_id,
  p.full_name AS member_name,
  p.avatar_url,
  p.hourly_rate,
  p.hourly_rate_currency,
  wt.id AS task_id,
  wt.title AS task_title,
  wt.area,
  wt.status,
  wt.estimated_minutes,
  (entry.value->>'minutes')::integer AS actual_minutes,
  COALESCE((entry.value->>'minutes')::integer, 0) * COALESCE(p.hourly_rate, 0) / 60 AS task_cost_usd,
  wt.updated_at
FROM public.workboard_tasks wt
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN wt.time_entries IS NOT NULL AND jsonb_array_length(wt.time_entries) > 0
      THEN wt.time_entries
    ELSE '[]'::jsonb
  END
) AS entry(value)
LEFT JOIN public.profiles p ON p.id = (entry.value->>'logged_by')::uuid
WHERE (entry.value->>'logged_by') IS NOT NULL
  AND (entry.value->>'minutes') IS NOT NULL

UNION ALL

SELECT
  wt.organization_id,
  wta.profile_id AS assignee_id,
  p.full_name AS member_name,
  p.avatar_url,
  p.hourly_rate,
  p.hourly_rate_currency,
  wt.id AS task_id,
  wt.title AS task_title,
  wt.area,
  wt.status,
  wt.estimated_minutes,
  wt.actual_minutes,
  COALESCE(wt.actual_minutes, 0) * COALESCE(p.hourly_rate, 0) / 60 AS task_cost_usd,
  wt.updated_at
FROM public.workboard_tasks wt
INNER JOIN public.workboard_task_assignees wta ON wta.task_id = wt.id
LEFT JOIN public.profiles p ON p.id = wta.profile_id
WHERE wt.actual_minutes IS NOT NULL
  AND (
    wt.time_entries IS NULL
    OR jsonb_array_length(wt.time_entries) = 0
  );

GRANT SELECT ON public.workboard_time_by_member TO authenticated;
