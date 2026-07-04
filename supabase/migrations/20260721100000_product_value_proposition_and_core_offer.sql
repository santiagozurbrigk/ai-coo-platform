-- Propuesta de valor persistida + flag de oferta core en productos

CREATE TABLE IF NOT EXISTS public.value_propositions (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations (id) ON DELETE CASCADE,
  avatar_text TEXT NOT NULL DEFAULT '',
  result_text TEXT NOT NULL DEFAULT '',
  pain_removed_text TEXT NOT NULL DEFAULT '',
  timeframe_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_core_offer BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.value_propositions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org value propositions" ON public.value_propositions;
CREATE POLICY "Users read org value propositions"
  ON public.value_propositions FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org value propositions" ON public.value_propositions;
CREATE POLICY "Users insert org value propositions"
  ON public.value_propositions FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org value propositions" ON public.value_propositions;
CREATE POLICY "Users update org value propositions"
  ON public.value_propositions FOR UPDATE
  USING (organization_id = public.get_my_organization_id());
