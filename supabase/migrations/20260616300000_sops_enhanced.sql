-- SOPs: campos de IA, versionado y metadatos operativos

ALTER TABLE public.sops
  ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
  ADD COLUMN IF NOT EXISTS additional_context TEXT,
  ADD COLUMN IF NOT EXISTS generated_by_ai BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_model TEXT,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS author_user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;

-- created_by (text) se conserva para compatibilidad con el agente ('agent' | 'user')

CREATE TABLE IF NOT EXISTS public.sop_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sop_id UUID NOT NULL REFERENCES public.sops (id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  change_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sop_id, version)
);

CREATE INDEX IF NOT EXISTS sop_versions_sop_id_idx
  ON public.sop_versions (sop_id, version DESC);

ALTER TABLE public.sop_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read org sop_versions" ON public.sop_versions;
CREATE POLICY "Users read org sop_versions"
  ON public.sop_versions FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users insert org sop_versions" ON public.sop_versions;
CREATE POLICY "Users insert org sop_versions"
  ON public.sop_versions FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Users update org sop_versions" ON public.sop_versions;
CREATE POLICY "Users update org sop_versions"
  ON public.sop_versions FOR UPDATE
  USING (organization_id = public.get_my_organization_id());
