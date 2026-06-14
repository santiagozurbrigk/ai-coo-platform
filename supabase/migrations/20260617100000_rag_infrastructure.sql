-- Infraestructura RAG: pgvector + documentos + chunks

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,

  source_type TEXT NOT NULL CHECK (source_type IN (
    'fathom_call',
    'sop',
    'sales_framework',
    'weekly_input',
    'agent_conversation',
    'product_context',
    'manual'
  )),
  source_id TEXT,

  title TEXT NOT NULL,
  content TEXT NOT NULL,

  department TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,

  embedding_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (embedding_status IN ('pending', 'processing', 'done', 'error')),
  embedded_at TIMESTAMPTZ,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, source_type, source_id)
);

CREATE TABLE IF NOT EXISTS public.rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.rag_documents (id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,

  embedding vector(1536),

  source_type TEXT,
  title TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
  ON public.rag_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS rag_chunks_org_idx
  ON public.rag_chunks (organization_id);

CREATE INDEX IF NOT EXISTS rag_documents_org_source_idx
  ON public.rag_documents (organization_id, source_type);

CREATE OR REPLACE FUNCTION public.search_rag_chunks(
  query_embedding vector(1536),
  org_id UUID,
  match_count INTEGER DEFAULT 5,
  source_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  title TEXT,
  source_type TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.document_id,
    rc.content,
    rc.title,
    rc.source_type,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM public.rag_chunks rc
  WHERE
    rc.organization_id = org_id
    AND (source_types IS NULL OR rc.source_type = ANY(source_types))
    AND rc.embedding IS NOT NULL
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

REVOKE ALL ON FUNCTION public.search_rag_chunks(vector, UUID, INTEGER, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_rag_chunks(vector, UUID, INTEGER, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_rag_chunks(vector, UUID, INTEGER, TEXT[]) TO service_role;

ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY rag_documents_select ON public.rag_documents
  FOR SELECT USING (organization_id = public.get_my_organization_id());

CREATE POLICY rag_documents_insert ON public.rag_documents
  FOR INSERT WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY rag_documents_update ON public.rag_documents
  FOR UPDATE USING (organization_id = public.get_my_organization_id());

CREATE POLICY rag_documents_delete ON public.rag_documents
  FOR DELETE USING (organization_id = public.get_my_organization_id());

CREATE POLICY rag_chunks_select ON public.rag_chunks
  FOR SELECT USING (organization_id = public.get_my_organization_id());

CREATE POLICY rag_chunks_insert ON public.rag_chunks
  FOR INSERT WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY rag_chunks_update ON public.rag_chunks
  FOR UPDATE USING (organization_id = public.get_my_organization_id());

CREATE POLICY rag_chunks_delete ON public.rag_chunks
  FOR DELETE USING (organization_id = public.get_my_organization_id());
