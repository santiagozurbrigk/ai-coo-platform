ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS skip_onboarding BOOLEAN DEFAULT false;
