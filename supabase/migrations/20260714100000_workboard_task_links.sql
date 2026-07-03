-- Adjuntos y vínculos en tareas del workboard.
-- Bucket de Storage (crear manualmente en Supabase): workboard-task-attachments (privado).

ALTER TABLE public.workboard_tasks
  ADD COLUMN IF NOT EXISTS sop_id uuid REFERENCES public.sops (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS workboard_tasks_sop_id_idx
  ON public.workboard_tasks (organization_id, sop_id)
  WHERE sop_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.workboard_task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.workboard_tasks (id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workboard_task_attachments_task_idx
  ON public.workboard_task_attachments (task_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.workboard_task_documents (
  task_id uuid NOT NULL REFERENCES public.workboard_tasks (id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.business_context_documents (id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, document_id)
);

CREATE INDEX IF NOT EXISTS workboard_task_documents_org_idx
  ON public.workboard_task_documents (organization_id, task_id);

ALTER TABLE public.workboard_task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workboard_task_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read workboard_task_attachments" ON public.workboard_task_attachments;
CREATE POLICY "Org members read workboard_task_attachments"
  ON public.workboard_task_attachments FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members insert workboard_task_attachments" ON public.workboard_task_attachments;
CREATE POLICY "Org members insert workboard_task_attachments"
  ON public.workboard_task_attachments FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members delete workboard_task_attachments" ON public.workboard_task_attachments;
CREATE POLICY "Org members delete workboard_task_attachments"
  ON public.workboard_task_attachments FOR DELETE
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members read workboard_task_documents" ON public.workboard_task_documents;
CREATE POLICY "Org members read workboard_task_documents"
  ON public.workboard_task_documents FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members insert workboard_task_documents" ON public.workboard_task_documents;
CREATE POLICY "Org members insert workboard_task_documents"
  ON public.workboard_task_documents FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members delete workboard_task_documents" ON public.workboard_task_documents;
CREATE POLICY "Org members delete workboard_task_documents"
  ON public.workboard_task_documents FOR DELETE
  USING (organization_id = public.get_my_organization_id());
