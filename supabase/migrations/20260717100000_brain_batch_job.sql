-- Add batch_job_id to track Anthropic Batch API processing for Brain documents
ALTER TABLE public.ai_brain_documents
  ADD COLUMN IF NOT EXISTS batch_job_id TEXT,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT;

CREATE INDEX IF NOT EXISTS ai_brain_documents_batch_job_idx
  ON public.ai_brain_documents (batch_job_id)
  WHERE batch_job_id IS NOT NULL;
