-- Adjuntos para SOPs (mismo patrón que workboard / business context).

CREATE TABLE IF NOT EXISTS public.sop_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  sop_id UUID REFERENCES public.sops (id) ON DELETE CASCADE,
  draft_id TEXT,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sop_attachments_org_sop_idx
  ON public.sop_attachments (organization_id, sop_id);

CREATE INDEX IF NOT EXISTS sop_attachments_draft_idx
  ON public.sop_attachments (organization_id, draft_id)
  WHERE draft_id IS NOT NULL;

ALTER TABLE public.sop_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org sop_attachments" ON public.sop_attachments;
CREATE POLICY "Users read org sop_attachments"
  ON public.sop_attachments FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org sop_attachments" ON public.sop_attachments;
CREATE POLICY "Users insert org sop_attachments"
  ON public.sop_attachments FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users delete org sop_attachments" ON public.sop_attachments;
CREATE POLICY "Users delete org sop_attachments"
  ON public.sop_attachments FOR DELETE
  USING (organization_id = public.get_my_organization_id());
