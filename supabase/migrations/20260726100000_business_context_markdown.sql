-- Add content_markdown column to business_context_documents.
--
-- content_text  = plain text, source of truth for RAG / embeddings (unchanged)
-- content_markdown = rich Markdown preserved from source (Google Docs export,
--                    .md file uploads). NULL for documents imported before this
--                    migration; those can be refreshed via the "Re-sincronizar"
--                    button in the document viewer.

ALTER TABLE public.business_context_documents
  ADD COLUMN IF NOT EXISTS content_markdown TEXT;

COMMENT ON COLUMN public.business_context_documents.content_markdown IS
  'Rich Markdown content from source (Google Docs text/markdown export, .md files). '
  'NULL for older documents or PDFs. Does not replace content_text (used for RAG).';
