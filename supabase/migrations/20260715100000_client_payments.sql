-- Historial de pagos y comprobantes por cliente.
-- Bucket de Storage (crear manualmente en Supabase): client-payment-receipts (privado).

CREATE TABLE IF NOT EXISTS public.client_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients (id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  storage_path text NOT NULL,
  mime_type text,
  installment_number integer,
  uploaded_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS client_payments_client_idx
  ON public.client_payments (client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS client_payments_org_idx
  ON public.client_payments (organization_id, created_at DESC);

ALTER TABLE public.client_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read client_payments" ON public.client_payments;
CREATE POLICY "Org members read client_payments"
  ON public.client_payments FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members insert client_payments" ON public.client_payments;
CREATE POLICY "Org members insert client_payments"
  ON public.client_payments FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());
