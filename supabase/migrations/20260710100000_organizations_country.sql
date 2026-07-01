-- País de la organización (proxy Unipile para Instagram/WhatsApp)

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS country TEXT;
