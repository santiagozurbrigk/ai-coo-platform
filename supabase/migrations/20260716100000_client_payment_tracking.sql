-- Campos de origen/destino del pago en cierres y comprobantes.

ALTER TABLE public.client_payments
  ADD COLUMN IF NOT EXISTS payment_received_from text,
  ADD COLUMN IF NOT EXISTS payment_destination_platform_id uuid
    REFERENCES public.payment_platforms (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS client_payments_destination_platform_idx
  ON public.client_payments (payment_destination_platform_id)
  WHERE payment_destination_platform_id IS NOT NULL;

ALTER TABLE public.closing_calls
  ADD COLUMN IF NOT EXISTS payment_received_from text;
