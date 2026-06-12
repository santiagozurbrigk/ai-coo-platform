ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS website_url TEXT;
