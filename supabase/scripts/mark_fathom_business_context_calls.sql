-- Llamadas Fathom sin cliente → visibles en Base de conocimiento como "Contexto de negocio".
-- No requiere call_type: la UI filtra por client_id IS NULL.
-- Opcional: marcar call_type existente para reporting interno.

UPDATE public.fathom_calls
SET call_type = 'other'
WHERE organization_id = '46cce98c-6d4c-4e4d-94a7-7cc24ae1104d'
  AND client_id IS NULL;
