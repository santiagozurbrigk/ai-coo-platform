-- Extended waitlist application fields (landing qualification form)

ALTER TABLE public.waitlist_leads
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS monthly_revenue TEXT,
  ADD COLUMN IF NOT EXISTS team_size TEXT,
  ADD COLUMN IF NOT EXISTS operational_pain TEXT,
  ADD COLUMN IF NOT EXISTS why_now TEXT;
