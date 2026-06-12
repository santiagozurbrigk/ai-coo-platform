-- Waitlist leads from public landing (optimizatucontrol.com)

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- Sin acceso vía anon/authenticated; solo service role (createAdminClient)
CREATE POLICY "waitlist_no_client_access"
  ON public.waitlist_leads
  FOR ALL
  USING (false)
  WITH CHECK (false);
