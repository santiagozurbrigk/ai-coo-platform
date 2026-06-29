-- business_context_note / business_context_document were missing from the
-- rag_documents.source_type CHECK — upserts failed silently in older code
-- and still block RAG indexing until this constraint is expanded.

ALTER TABLE public.rag_documents
  DROP CONSTRAINT IF EXISTS rag_documents_source_type_check;

ALTER TABLE public.rag_documents
  ADD CONSTRAINT rag_documents_source_type_check
  CHECK (source_type IN (
    'fathom_call',
    'sop',
    'sales_framework',
    'weekly_input',
    'agent_conversation',
    'product_context',
    'manual',
    'business_context_note',
    'business_context_document'
  ));
