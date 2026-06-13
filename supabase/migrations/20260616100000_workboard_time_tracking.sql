-- Workboard: time tracking real + tarifa por hora en profiles

ALTER TABLE public.workboard_tasks
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS actual_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS timer_running BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS time_entries JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS hourly_rate_currency TEXT NOT NULL DEFAULT 'USD';

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

-- Founder/admin pueden actualizar tarifas de miembros de la org
DROP POLICY IF EXISTS "Founders update org profiles" ON public.profiles;
CREATE POLICY "Founders update org profiles"
  ON public.profiles FOR UPDATE
  USING (
    organization_id = public.get_my_organization_id()
    AND (
      id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles me
        WHERE me.id = auth.uid()
          AND me.role IN ('founder', 'admin')
      )
    )
  )
  WITH CHECK (organization_id = public.get_my_organization_id());
