-- Tabla de propuestas de cambio al modelo mental del negocio generadas por el Agente IA.
-- Las propuestas requieren aprobación explícita del usuario antes de aplicarse.

CREATE TABLE IF NOT EXISTS public.agent_graph_proposals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id  UUID NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  -- Set after the assistant message is persisted (allows correlating card ↔ message)
  message_id       UUID,
  entity_type      TEXT NOT NULL CHECK (
    entity_type IN ('customer_avatar', 'product', 'value_ladder_step', 'sales_framework', 'value_proposition')
  ),
  action           TEXT NOT NULL CHECK (action IN ('create', 'update')),
  -- Null for 'create'; the existing row UUID for 'update'
  entity_id        UUID,
  payload          JSONB NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_graph_proposals_org_conv_idx
  ON public.agent_graph_proposals (organization_id, conversation_id);

CREATE INDEX IF NOT EXISTS agent_graph_proposals_message_idx
  ON public.agent_graph_proposals (message_id)
  WHERE message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_graph_proposals_status_idx
  ON public.agent_graph_proposals (organization_id, status)
  WHERE status = 'pending';

ALTER TABLE public.agent_graph_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org graph proposals" ON public.agent_graph_proposals;
CREATE POLICY "Users read org graph proposals"
  ON public.agent_graph_proposals FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org graph proposals" ON public.agent_graph_proposals;
CREATE POLICY "Users insert org graph proposals"
  ON public.agent_graph_proposals FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org graph proposals" ON public.agent_graph_proposals;
CREATE POLICY "Users update org graph proposals"
  ON public.agent_graph_proposals FOR UPDATE
  USING (organization_id = public.get_my_organization_id());
