-- Agente: soporte para documentos descargables, thinking y canvas
-- agent_messages: columnas para contenido extendido

ALTER TABLE public.agent_messages
  ADD COLUMN IF NOT EXISTS thinking_content TEXT,
  ADD COLUMN IF NOT EXISTS canvas_content TEXT;

-- Bucket privado para documentos generados por el agente (por organización)
-- Se crea si no existe; no falla si ya existe.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-documents',
  'agent-documents',
  false,
  52428800, -- 50 MB
  ARRAY[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/pdf',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS para el bucket agent-documents
-- Los miembros de la org pueden subir y leer sus propios documentos

DROP POLICY IF EXISTS "Org members insert agent documents" ON storage.objects;
CREATE POLICY "Org members insert agent documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'agent-documents'
    AND (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );

DROP POLICY IF EXISTS "Org members select agent documents" ON storage.objects;
CREATE POLICY "Org members select agent documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'agent-documents'
    AND (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );

DROP POLICY IF EXISTS "Org members delete agent documents" ON storage.objects;
CREATE POLICY "Org members delete agent documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'agent-documents'
    AND (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );
