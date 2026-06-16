-- Holding cliente: una org puede gestionar múltiples negocios (account_type = holding)

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'founder';

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_account_type_check;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_account_type_check
  CHECK (account_type IN ('founder', 'holding'));

CREATE TABLE IF NOT EXISTS public.holding_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_org_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  business_org_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  business_name TEXT,
  revenue_share_pct NUMERIC(5, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (holding_org_id, business_org_id)
);

CREATE INDEX IF NOT EXISTS holding_businesses_holding_idx
  ON public.holding_businesses (holding_org_id);

ALTER TABLE public.holding_businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "holding_can_see_businesses" ON public.holding_businesses;
CREATE POLICY "holding_can_see_businesses"
  ON public.holding_businesses
  FOR SELECT
  USING (
    holding_org_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );
