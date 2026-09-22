ALTER TABLE business_context_documents
  ADD COLUMN IF NOT EXISTS index_error TEXT;
