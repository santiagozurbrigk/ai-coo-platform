CREATE TABLE business_context_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('meetings', 'frameworks', 'training', 'sales', 'operations')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual')),
  -- source queda fijo en 'manual' por ahora; en Fase 2 se ampliará
  -- el CHECK para google_docs / google_sheets cuando se integren
  content_text TEXT,
  -- texto plano: cuerpo de la nota escrita o texto extraído del PDF
  storage_path TEXT,
  -- path en Supabase Storage si es un PDF subido
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'indexed', 'error')),
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE business_context_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own org documents" ON business_context_documents
  FOR ALL USING (organization_id = get_my_organization_id())
  WITH CHECK (organization_id = get_my_organization_id());

CREATE INDEX business_context_documents_org_idx
  ON business_context_documents(organization_id, created_at DESC);
