-- Guión default para análisis profundo + métricas YouTube CTA

CREATE OR REPLACE FUNCTION public.get_active_sales_script(org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  script_sections JSONB;
BEGIN
  SELECT sections INTO script_sections
  FROM public.sales_scripts
  WHERE organization_id = org_id AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF script_sections IS NULL OR script_sections = '[]'::jsonb THEN
    script_sections := '[
      {"id": "apertura", "name": "Apertura y rapport", "description": "Presentación, conexión con el lead, establecer agenda de la llamada", "weight": 15, "order": 1},
      {"id": "diagnostico", "name": "Diagnóstico", "description": "Preguntas para entender la situación, el dolor y el objetivo del lead", "weight": 25, "order": 2},
      {"id": "presentacion", "name": "Presentación de la solución", "description": "Mostrar cómo el producto resuelve el problema específico del lead, precio con contexto", "weight": 25, "order": 3},
      {"id": "objeciones", "name": "Manejo de objeciones", "description": "Escuchar, validar y responder objeciones de forma empática y efectiva", "weight": 20, "order": 4},
      {"id": "cta", "name": "CTA y cierre", "description": "Pedir el cierre de forma directa, confirmar compromiso, próximos pasos claros", "weight": 15, "order": 5}
    ]'::jsonb;
  END IF;

  RETURN script_sections;
END;
$$;

REVOKE ALL ON FUNCTION public.get_active_sales_script(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_sales_script(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_active_sales_script(UUID) TO authenticated;

ALTER TABLE public.content_assets
  ADD COLUMN IF NOT EXISTS cta_minute INTEGER,
  ADD COLUMN IF NOT EXISTS retention_at_cta_pct NUMERIC(5, 2);

CREATE UNIQUE INDEX IF NOT EXISTS call_analyses_fathom_call_id_key
  ON public.call_analyses (fathom_call_id)
  WHERE fathom_call_id IS NOT NULL;
