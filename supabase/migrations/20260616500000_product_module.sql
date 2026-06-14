-- Módulo Producto: avatares, productos, value ladder y frameworks

CREATE TABLE IF NOT EXISTS public.customer_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_range TEXT,
  gender TEXT,
  location TEXT,
  occupation TEXT,
  income_range TEXT,
  main_pain TEXT NOT NULL,
  secondary_pains JSONB NOT NULL DEFAULT '[]'::jsonb,
  desires JSONB NOT NULL DEFAULT '[]'::jsonb,
  fears JSONB NOT NULL DEFAULT '[]'::jsonb,
  objections JSONB NOT NULL DEFAULT '[]'::jsonb,
  where_they_hang TEXT,
  language_they_use TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_avatars_org_idx
  ON public.customer_avatars (organization_id, is_primary DESC);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('curso', 'mentoria', 'consultoria', 'comunidad', 'evento', 'otro')),
  price NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_type TEXT CHECK (billing_type IN ('unico', 'mensual', 'anual', 'personalizado')),
  value_ladder_position INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  bonuses JSONB NOT NULL DEFAULT '[]'::jsonb,
  guarantee TEXT,
  target_avatar_id UUID REFERENCES public.customer_avatars (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_org_position_idx
  ON public.products (organization_id, value_ladder_position);

CREATE TABLE IF NOT EXISTS public.value_ladder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products (id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  goal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, level)
);

CREATE TABLE IF NOT EXISTS public.sales_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('script', 'objeciones', 'followup', 'onboarding', 'otro')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.value_ladder ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_frameworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org customer_avatars" ON public.customer_avatars;
CREATE POLICY "Users read org customer_avatars"
  ON public.customer_avatars FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org customer_avatars" ON public.customer_avatars;
CREATE POLICY "Users insert org customer_avatars"
  ON public.customer_avatars FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org customer_avatars" ON public.customer_avatars;
CREATE POLICY "Users update org customer_avatars"
  ON public.customer_avatars FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org customer_avatars" ON public.customer_avatars;
CREATE POLICY "Users delete org customer_avatars"
  ON public.customer_avatars FOR DELETE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users read org products" ON public.products;
CREATE POLICY "Users read org products"
  ON public.products FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org products" ON public.products;
CREATE POLICY "Users insert org products"
  ON public.products FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org products" ON public.products;
CREATE POLICY "Users update org products"
  ON public.products FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org products" ON public.products;
CREATE POLICY "Users delete org products"
  ON public.products FOR DELETE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users read org value_ladder" ON public.value_ladder;
CREATE POLICY "Users read org value_ladder"
  ON public.value_ladder FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org value_ladder" ON public.value_ladder;
CREATE POLICY "Users insert org value_ladder"
  ON public.value_ladder FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org value_ladder" ON public.value_ladder;
CREATE POLICY "Users update org value_ladder"
  ON public.value_ladder FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org value_ladder" ON public.value_ladder;
CREATE POLICY "Users delete org value_ladder"
  ON public.value_ladder FOR DELETE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users read org sales_frameworks" ON public.sales_frameworks;
CREATE POLICY "Users read org sales_frameworks"
  ON public.sales_frameworks FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org sales_frameworks" ON public.sales_frameworks;
CREATE POLICY "Users insert org sales_frameworks"
  ON public.sales_frameworks FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org sales_frameworks" ON public.sales_frameworks;
CREATE POLICY "Users update org sales_frameworks"
  ON public.sales_frameworks FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org sales_frameworks" ON public.sales_frameworks;
CREATE POLICY "Users delete org sales_frameworks"
  ON public.sales_frameworks FOR DELETE
  USING (organization_id = public.get_my_organization_id());
