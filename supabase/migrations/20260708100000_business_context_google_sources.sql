-- Fase 2: importar Google Docs y Sheets en business_context_documents
ALTER TABLE business_context_documents
  DROP CONSTRAINT IF EXISTS business_context_documents_source_check;

ALTER TABLE business_context_documents
  ADD CONSTRAINT business_context_documents_source_check
  CHECK (source IN ('manual', 'google_doc', 'google_sheet'));

ALTER TABLE business_context_documents
  ADD COLUMN IF NOT EXISTS external_source_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS business_context_documents_external_source_idx
  ON business_context_documents (organization_id, source, external_source_id)
  WHERE external_source_id IS NOT NULL;
