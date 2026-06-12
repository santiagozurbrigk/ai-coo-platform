-- UTM tracking: YouTube → leads → bookings → sales

CREATE TABLE IF NOT EXISTS public.utm_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  youtube_video_id TEXT,
  youtube_video_title TEXT,
  utm_source TEXT NOT NULL DEFAULT 'youtube',
  utm_medium TEXT NOT NULL DEFAULT 'video',
  utm_campaign TEXT NOT NULL,
  utm_content TEXT,
  full_url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  leads_captured INTEGER NOT NULL DEFAULT 0,
  bookings_attributed INTEGER NOT NULL DEFAULT 0,
  sales_attributed INTEGER NOT NULL DEFAULT 0,
  revenue_attributed NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS utm_links_org_campaign_idx
  ON public.utm_links (organization_id, utm_campaign);

CREATE INDEX IF NOT EXISTS utm_links_org_idx
  ON public.utm_links (organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.utm_lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  utm_link_id UUID REFERENCES public.utm_links (id) ON DELETE SET NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  lead_email TEXT,
  lead_identifier TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_to_conversation BOOLEAN NOT NULL DEFAULT false,
  converted_to_booking BOOLEAN NOT NULL DEFAULT false,
  converted_to_sale BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS utm_lead_captures_org_link_idx
  ON public.utm_lead_captures (organization_id, utm_link_id, captured_at DESC);

-- Waitlist: persist UTM params on signup
ALTER TABLE public.waitlist_leads
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- RPC counters (service role / admin client)
CREATE OR REPLACE FUNCTION public.increment_utm_clicks(campaign TEXT, org_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.utm_links
  SET clicks = clicks + 1, updated_at = NOW()
  WHERE utm_campaign = campaign AND organization_id = org_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_utm_leads(utm_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.utm_links
  SET leads_captured = leads_captured + 1, updated_at = NOW()
  WHERE id = utm_id;
$$;

REVOKE ALL ON FUNCTION public.increment_utm_clicks(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_utm_leads(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_utm_clicks(TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_utm_leads(UUID) TO service_role;

ALTER TABLE public.utm_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_lead_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read org utm links"
  ON public.utm_links FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "Users insert org utm links"
  ON public.utm_links FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Users update org utm links"
  ON public.utm_links FOR UPDATE
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "Users read org utm lead captures"
  ON public.utm_lead_captures FOR SELECT
  USING (organization_id = public.get_my_organization_id());
