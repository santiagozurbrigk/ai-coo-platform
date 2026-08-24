-- metric_snapshots: almacena valores de métricas históricas ingresados manualmente / importados desde Excel
-- Formato ancho → largo: cada columna del Excel (salvo la fecha) es una fila con metric_key + value

CREATE TABLE IF NOT EXISTS public.metric_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- Período al que corresponde el valor (se trunca al primer día del periodo para unificar)
  period date NOT NULL,
  -- Nombre de la métrica tal como viene en el Excel (ej: "Revenue", "Leads", "Inversión Ads")
  metric_key text NOT NULL,
  value numeric NOT NULL,
  -- Fuente del dato ('import' para importaciones desde Excel, 'manual' para entrada directa)
  source text NOT NULL DEFAULT 'import',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Clave única: no puede haber dos valores para la misma org, período y métrica
  UNIQUE (organization_id, period, metric_key)
);

-- RLS
ALTER TABLE public.metric_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can manage their metric snapshots"
  ON public.metric_snapshots
  FOR ALL
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());

-- Índices
CREATE INDEX IF NOT EXISTS metric_snapshots_org_period_idx
  ON public.metric_snapshots (organization_id, period DESC);

CREATE INDEX IF NOT EXISTS metric_snapshots_org_key_idx
  ON public.metric_snapshots (organization_id, metric_key, period DESC);
