-- Plan/programa contratado en clientes + cache de duración por plan

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS offered_product text;

-- Backfill desde ai_insights ("Producto ofrecido: …")
-- Corregida 2026-09-22: `UPDATE … FROM LATERAL` referenciando la tabla que se
-- actualiza es inválido en Postgres y rompía el armado desde cero. Mismo
-- resultado con una subconsulta correlacionada.
UPDATE public.clients c
SET offered_product = trim(
  regexp_replace(
    (
      SELECT elem::text
      FROM jsonb_array_elements_text(c.ai_insights) AS elem
      WHERE elem::text ~* '^Producto ofrecido:'
      LIMIT 1
    ),
    '^Producto ofrecido:\s*', '', 'i'
  )
)
WHERE c.offered_product IS NULL
  AND c.ai_insights IS NOT NULL
  AND jsonb_array_length(c.ai_insights) > 0
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(c.ai_insights) AS elem
    WHERE elem::text ~* '^Producto ofrecido:'
  );

CREATE TABLE IF NOT EXISTS public.plan_durations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  duration_days integer,
  source text NOT NULL DEFAULT 'unknown' CHECK (source IN ('rag', 'manual', 'unknown')),
  source_detail text,
  resolved_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, plan_name)
);

CREATE INDEX IF NOT EXISTS plan_durations_org_idx
  ON public.plan_durations (organization_id);

ALTER TABLE public.plan_durations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read org plan durations"
  ON public.plan_durations FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users insert org plan durations"
  ON public.plan_durations FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Users update org plan durations"
  ON public.plan_durations FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users delete org plan durations"
  ON public.plan_durations FOR DELETE
  USING (organization_id = public.get_my_organization_id());
