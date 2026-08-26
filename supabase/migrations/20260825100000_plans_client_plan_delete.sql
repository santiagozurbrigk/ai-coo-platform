-- Planes de programas/productos (con sistemas de cuotas)
-- Reemplaza la lógica de plan_durations standalone → los planes son entidades completas
-- con nombre, duración y múltiples sistemas de cuotas configurables.

CREATE TABLE IF NOT EXISTS public.plans (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  duration_days    integer,
  -- Array de sistemas de cuotas: [{ id, name, count, amountPerInstallment }]
  installment_systems jsonb    NOT NULL DEFAULT '[]'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plans_org_idx ON public.plans (organization_id);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read org plans"
  ON public.plans FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users insert org plans"
  ON public.plans FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Users update org plans"
  ON public.plans FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users delete org plans"
  ON public.plans FOR DELETE
  USING (organization_id = public.get_my_organization_id());

-- Vincular clientes a planes
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS plan_id                     uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS selected_installment_system_id text;

-- Política DELETE para clients (faltaba)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'clients'
      AND policyname = 'Users delete org clients'
  ) THEN
    CREATE POLICY "Users delete org clients"
      ON public.clients FOR DELETE
      USING (organization_id = public.get_my_organization_id());
  END IF;
END$$;
