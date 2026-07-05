-- Tabla para persistir posiciones de nodos en el grafo visual del módulo Producto

CREATE TABLE IF NOT EXISTS public.business_graph_node_positions (
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  node_key        TEXT NOT NULL,
  x               DOUBLE PRECISION NOT NULL DEFAULT 0,
  y               DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT business_graph_node_positions_pkey PRIMARY KEY (organization_id, node_key)
);

CREATE INDEX IF NOT EXISTS business_graph_node_positions_org_idx
  ON public.business_graph_node_positions (organization_id);

ALTER TABLE public.business_graph_node_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org graph positions" ON public.business_graph_node_positions;
CREATE POLICY "Users read org graph positions"
  ON public.business_graph_node_positions FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org graph positions" ON public.business_graph_node_positions;
CREATE POLICY "Users insert org graph positions"
  ON public.business_graph_node_positions FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org graph positions" ON public.business_graph_node_positions;
CREATE POLICY "Users update org graph positions"
  ON public.business_graph_node_positions FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org graph positions" ON public.business_graph_node_positions;
CREATE POLICY "Users delete org graph positions"
  ON public.business_graph_node_positions FOR DELETE
  USING (organization_id = public.get_my_organization_id());
