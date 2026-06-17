ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS holding_billing_model TEXT;

ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_holding_billing_model_check;

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_holding_billing_model_check
  CHECK (
    holding_billing_model IS NULL
    OR holding_billing_model IN ('revenue_share', 'fixed_fee')
  );

ALTER TABLE public.holding_businesses
  ADD COLUMN IF NOT EXISTS fixed_fee_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS fixed_fee_currency TEXT DEFAULT 'USD';
