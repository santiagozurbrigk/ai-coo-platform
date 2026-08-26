-- RPC: get_holding_dashboard_stats
--
-- Reemplaza el patrón N×4 queries en getHoldingDashboardAction.
-- Para un holding con N negocios, pasa de N×4 llamadas a Supabase a 1 sola RPC.
-- Corre con SECURITY DEFINER para poder leer profiles sin RLS de anonkey.
--
-- Retorna una fila por cada negocio activo del holding con:
--   business_org_id   UUID   — ID de la org del negocio
--   mrr               NUMERIC — suma de client.total_amount
--   active_convs      BIGINT  — conversaciones de los últimos 30 días
--   closed_calls      BIGINT  — closing_calls cerradas en los últimos 30 días
--   has_founder       BOOLEAN — si existe al menos un profile con role='founder'

CREATE OR REPLACE FUNCTION public.get_holding_dashboard_stats(
  p_holding_org_id UUID
)
RETURNS TABLE (
  business_org_id  UUID,
  mrr              NUMERIC,
  active_convs     BIGINT,
  closed_calls     BIGINT,
  has_founder      BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH thirty_days_ago AS (
    SELECT NOW() - INTERVAL '30 days' AS cutoff
  ),
  -- Negocios activos del holding
  biz AS (
    SELECT hb.business_org_id
    FROM public.holding_businesses hb
    WHERE hb.holding_org_id = p_holding_org_id
      AND hb.status = 'active'
  ),
  -- MRR: suma de total_amount por org
  client_mrr AS (
    SELECT
      c.organization_id,
      COALESCE(SUM(c.total_amount), 0) AS mrr
    FROM public.clients c
    WHERE c.organization_id IN (SELECT business_org_id FROM biz)
    GROUP BY c.organization_id
  ),
  -- Conversaciones activas en los últimos 30 días
  conv_count AS (
    SELECT
      cv.organization_id,
      COUNT(*) AS cnt
    FROM public.conversations cv
    CROSS JOIN thirty_days_ago t
    WHERE cv.organization_id IN (SELECT business_org_id FROM biz)
      AND cv.created_at >= t.cutoff
    GROUP BY cv.organization_id
  ),
  -- Closing calls cerradas en los últimos 30 días
  call_count AS (
    SELECT
      cc.organization_id,
      COUNT(*) AS cnt
    FROM public.closing_calls cc
    CROSS JOIN thirty_days_ago t
    WHERE cc.organization_id IN (SELECT business_org_id FROM biz)
      AND cc.status = 'closed'
      AND cc.scheduled_at >= t.cutoff
    GROUP BY cc.organization_id
  ),
  -- Founder: al menos un profile con role='founder' por org
  founder_check AS (
    SELECT
      p.organization_id,
      TRUE AS has_founder
    FROM public.profiles p
    WHERE p.organization_id IN (SELECT business_org_id FROM biz)
      AND p.role = 'founder'
    GROUP BY p.organization_id
  )
  SELECT
    b.business_org_id,
    COALESCE(m.mrr,  0)     AS mrr,
    COALESCE(c.cnt,  0)     AS active_convs,
    COALESCE(cl.cnt, 0)     AS closed_calls,
    COALESCE(f.has_founder, FALSE) AS has_founder
  FROM biz b
  LEFT JOIN client_mrr   m  ON m.organization_id  = b.business_org_id
  LEFT JOIN conv_count   c  ON c.organization_id  = b.business_org_id
  LEFT JOIN call_count   cl ON cl.organization_id = b.business_org_id
  LEFT JOIN founder_check f ON f.organization_id  = b.business_org_id;
$$;

-- Solo los usuarios autenticados pueden llamar esta función.
-- SECURITY DEFINER asegura que ve profiles sin pasar por RLS.
REVOKE ALL ON FUNCTION public.get_holding_dashboard_stats(UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.get_holding_dashboard_stats(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_holding_dashboard_stats IS
  'Devuelve métricas agregadas (MRR, conversaciones, closing calls, founder) '
  'para todos los negocios activos de un holding. '
  'Reemplaza el patrón N×4 queries del dashboard — 1 RPC en lugar de 28 llamadas.';
