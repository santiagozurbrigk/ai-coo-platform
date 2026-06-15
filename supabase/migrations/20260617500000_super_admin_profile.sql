-- Super admins: perfil sin organización de cliente

ALTER TABLE public.profiles
  ALTER COLUMN organization_id DROP NOT NULL;
