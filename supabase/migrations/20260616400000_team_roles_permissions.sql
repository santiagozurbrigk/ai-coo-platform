-- Equipo: roles custom, invitaciones y campos extra en profiles

CREATE TABLE IF NOT EXISTS public.team_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS team_roles_organization_id_idx
  ON public.team_roles (organization_id, is_default DESC);

CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  custom_role_id UUID REFERENCES public.team_roles (id) ON DELETE SET NULL,
  invited_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, email)
);

CREATE INDEX IF NOT EXISTS team_invitations_org_status_idx
  ON public.team_invitations (organization_id, status);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS custom_role_id UUID REFERENCES public.team_roles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL;

ALTER TABLE public.team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org team_roles" ON public.team_roles;
CREATE POLICY "Users read org team_roles"
  ON public.team_roles FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org team_roles" ON public.team_roles;
CREATE POLICY "Users insert org team_roles"
  ON public.team_roles FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org team_roles" ON public.team_roles;
CREATE POLICY "Users update org team_roles"
  ON public.team_roles FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org team_roles" ON public.team_roles;
CREATE POLICY "Users delete org team_roles"
  ON public.team_roles FOR DELETE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users read org team_invitations" ON public.team_invitations;
CREATE POLICY "Users read org team_invitations"
  ON public.team_invitations FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org team_invitations" ON public.team_invitations;
CREATE POLICY "Users insert org team_invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org team_invitations" ON public.team_invitations;
CREATE POLICY "Users update org team_invitations"
  ON public.team_invitations FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org team_invitations" ON public.team_invitations;
CREATE POLICY "Users delete org team_invitations"
  ON public.team_invitations FOR DELETE
  USING (organization_id = public.get_my_organization_id());

CREATE OR REPLACE FUNCTION public.create_default_roles(org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND org_id IS DISTINCT FROM public.get_my_organization_id() THEN
    RAISE EXCEPTION 'No autorizado para crear roles en esta organización';
  END IF;

  INSERT INTO public.team_roles (organization_id, name, description, is_default, permissions)
  VALUES
    (org_id, 'Founder', 'Acceso total a todo el sistema', true,
     '{"dashboard":"full","workboard":"full","agent":"full","finance":"full","expenses":"full","sales_inbox":"full","sales_metrics":"full","marketing":"full","marketing_content":"full","marketing_sales":"full","marketing_forms":"full","closing":"full","clients":"full","operations_overview":"full","operations_sops":"full","operations_team_inputs":"full","knowledge_base":"full","integrations":"full","team":"full","settings":"full"}'::jsonb),
    (org_id, 'Setter', 'Acceso a bandeja de ventas y métricas', true,
     '{"dashboard":"view","sales_inbox":"full","sales_metrics":"view","marketing":"view"}'::jsonb),
    (org_id, 'Closer', 'Acceso a closing y clientes', true,
     '{"dashboard":"view","sales_inbox":"view","closing":"full","clients":"full"}'::jsonb),
    (org_id, 'Operador', 'Acceso a operaciones y workboard', true,
     '{"dashboard":"view","workboard":"full","operations_overview":"full","operations_sops":"full","operations_team_inputs":"full"}'::jsonb),
    (org_id, 'Viewer', 'Solo lectura de métricas generales', true,
     '{"dashboard":"view","sales_inbox":"view","sales_metrics":"view","operations_overview":"view","marketing":"view"}'::jsonb)
  ON CONFLICT (organization_id, name) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_default_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_roles(UUID) TO service_role;
