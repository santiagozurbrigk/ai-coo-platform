-- Add content_text to ai_brain_documents for storing extracted text
ALTER TABLE public.ai_brain_documents
  ADD COLUMN IF NOT EXISTS content_text TEXT;

CREATE INDEX IF NOT EXISTS ai_brain_documents_active_idx
  ON public.ai_brain_documents (status)
  WHERE status = 'active';
