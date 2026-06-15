-- Holding multi-tenant: agrupador de organizaciones del portfolio OTC

CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL REFERENCES public.super_admin_users (email),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.holding_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID NOT NULL REFERENCES public.holdings (id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (holding_id, organization_id)
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_holding_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holding_organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_only" ON public.holdings;
CREATE POLICY "super_admin_only"
  ON public.holdings
  FOR ALL
  USING (false);

DROP POLICY IF EXISTS "super_admin_only" ON public.holding_organizations;
CREATE POLICY "super_admin_only"
  ON public.holding_organizations
  FOR ALL
  USING (false);

-- Holding default (solo si el owner existe en super_admin_users)
INSERT INTO public.holdings (name, owner_email)
SELECT 'OTC Portfolio', 'optimizatucontrol@gmail.com'
WHERE EXISTS (
  SELECT 1
  FROM public.super_admin_users
  WHERE email = 'optimizatucontrol@gmail.com'
);

-- Vincular orgs existentes al holding default
INSERT INTO public.holding_organizations (holding_id, organization_id)
SELECT h.id, o.id
FROM public.holdings h
CROSS JOIN public.organizations o
WHERE h.name = 'OTC Portfolio'
ON CONFLICT (holding_id, organization_id) DO NOTHING;
