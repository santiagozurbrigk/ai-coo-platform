-- Revert multi-assignee: restore single assignee_id as source of truth

DROP VIEW IF EXISTS public.workboard_time_by_member;

CREATE OR REPLACE VIEW public.workboard_time_by_member
WITH (security_invoker = true)
AS
SELECT
  wt.organization_id,
  wt.assignee_id,
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
LEFT JOIN public.profiles p ON p.id = wt.assignee_id
WHERE wt.assignee_id IS NOT NULL
  AND wt.actual_minutes IS NOT NULL;

GRANT SELECT ON public.workboard_time_by_member TO authenticated;

DROP POLICY IF EXISTS "Org members delete workboard_task_assignees" ON public.workboard_task_assignees;
DROP POLICY IF EXISTS "Org members update workboard_task_assignees" ON public.workboard_task_assignees;
DROP POLICY IF EXISTS "Org members insert workboard_task_assignees" ON public.workboard_task_assignees;
DROP POLICY IF EXISTS "Org members read workboard_task_assignees" ON public.workboard_task_assignees;

DROP TABLE IF EXISTS public.workboard_task_assignees;
