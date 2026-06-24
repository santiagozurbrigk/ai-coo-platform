-- Holding portfolio: lectura RLS de negocios vinculados sin service role.
-- Permite getHoldingBusinesses (embed organizations) y métricas agregadas del dashboard.

CREATE OR REPLACE FUNCTION public.get_my_holding_business_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hb.business_org_id
  FROM public.holding_businesses hb
  INNER JOIN public.profiles p ON p.id = auth.uid()
  INNER JOIN public.organizations ho ON ho.id = p.organization_id
  WHERE hb.holding_org_id = p.organization_id
    AND ho.account_type = 'holding'
    AND hb.status = 'active';
$$;

REVOKE ALL ON FUNCTION public.get_my_holding_business_org_ids() FROM public;
GRANT EXECUTE ON FUNCTION public.get_my_holding_business_org_ids() TO authenticated;

DROP POLICY IF EXISTS "holding_reads_linked_business_orgs" ON public.organizations;
CREATE POLICY "holding_reads_linked_business_orgs"
  ON public.organizations
  FOR SELECT
  USING (id IN (SELECT public.get_my_holding_business_org_ids()));

DROP POLICY IF EXISTS "holding_reads_portfolio_clients" ON public.clients;
CREATE POLICY "holding_reads_portfolio_clients"
  ON public.clients
  FOR SELECT
  USING (organization_id IN (SELECT public.get_my_holding_business_org_ids()));

DROP POLICY IF EXISTS "holding_reads_portfolio_conversations" ON public.conversations;
CREATE POLICY "holding_reads_portfolio_conversations"
  ON public.conversations
  FOR SELECT
  USING (organization_id IN (SELECT public.get_my_holding_business_org_ids()));

DROP POLICY IF EXISTS "holding_reads_portfolio_closing_calls" ON public.closing_calls;
CREATE POLICY "holding_reads_portfolio_closing_calls"
  ON public.closing_calls
  FOR SELECT
  USING (organization_id IN (SELECT public.get_my_holding_business_org_ids()));
