-- UTM attribution: bookings y ventas reales → contadores en utm_links

CREATE TABLE IF NOT EXISTS public.utm_booking_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  utm_link_id UUID NOT NULL REFERENCES public.utm_links (id) ON DELETE CASCADE,
  utm_lead_capture_id UUID REFERENCES public.utm_lead_captures (id) ON DELETE SET NULL,
  closing_call_id UUID REFERENCES public.closing_calls (id) ON DELETE SET NULL,
  lead_name TEXT,
  lead_email TEXT,
  booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.utm_sale_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  utm_link_id UUID NOT NULL REFERENCES public.utm_links (id) ON DELETE CASCADE,
  utm_booking_attribution_id UUID REFERENCES public.utm_booking_attributions (id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients (id) ON DELETE SET NULL,
  revenue NUMERIC(10, 2) NOT NULL DEFAULT 0,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS utm_booking_attributions_org_link_idx
  ON public.utm_booking_attributions (organization_id, utm_link_id);

CREATE INDEX IF NOT EXISTS utm_sale_attributions_org_link_idx
  ON public.utm_sale_attributions (organization_id, utm_link_id);

CREATE UNIQUE INDEX IF NOT EXISTS utm_booking_attributions_closing_call_idx
  ON public.utm_booking_attributions (closing_call_id)
  WHERE closing_call_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS utm_sale_attributions_client_idx
  ON public.utm_sale_attributions (client_id)
  WHERE client_id IS NOT NULL;

ALTER TABLE public.utm_booking_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_sale_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read org utm booking attributions"
  ON public.utm_booking_attributions FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users read org utm sale attributions"
  ON public.utm_sale_attributions FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE OR REPLACE FUNCTION public.increment_utm_bookings(utm_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.utm_links
  SET bookings_attributed = bookings_attributed + 1,
      updated_at = NOW()
  WHERE id = utm_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_utm_sales(utm_id UUID, revenue_amount NUMERIC)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.utm_links
  SET sales_attributed = sales_attributed + 1,
      revenue_attributed = revenue_attributed + revenue_amount,
      updated_at = NOW()
  WHERE id = utm_id;
$$;

REVOKE ALL ON FUNCTION public.increment_utm_bookings(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_utm_sales(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_utm_bookings(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_utm_sales(UUID, NUMERIC) TO service_role;
