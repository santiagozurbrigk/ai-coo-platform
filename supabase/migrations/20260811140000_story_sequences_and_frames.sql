-- Tabla de secuencias de historias
CREATE TABLE IF NOT EXISTS story_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT CHECK (goal IN ('AUTORIDAD', 'VENTA', 'NUTRICION', 'ATRACCION')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'partial')),
  account_id TEXT,
  scheduled_at TIMESTAMPTZ,
  ai_insights TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS story_sequences_org_idx ON story_sequences(organization_id);

ALTER TABLE story_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_story_sequences" ON story_sequences FOR SELECT
  USING (organization_id = get_my_organization_id());
CREATE POLICY "org_insert_story_sequences" ON story_sequences FOR INSERT
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_update_story_sequences" ON story_sequences FOR UPDATE
  USING (organization_id = get_my_organization_id())
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_delete_story_sequences" ON story_sequences FOR DELETE
  USING (organization_id = get_my_organization_id());

-- Tabla de frames de historias
CREATE TABLE IF NOT EXISTS story_frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES story_sequences(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video', 'text')),
  caption TEXT,
  cta_url TEXT,
  cta_label TEXT,
  drive_file_id TEXT,
  drive_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'publishing', 'published', 'failed')),
  zernio_post_id TEXT,
  published_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS story_frames_sequence_id_idx ON story_frames(sequence_id);
CREATE INDEX IF NOT EXISTS story_frames_org_idx ON story_frames(organization_id);

ALTER TABLE story_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_story_frames" ON story_frames FOR SELECT
  USING (organization_id = get_my_organization_id());
CREATE POLICY "org_insert_story_frames" ON story_frames FOR INSERT
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_update_story_frames" ON story_frames FOR UPDATE
  USING (organization_id = get_my_organization_id())
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_delete_story_frames" ON story_frames FOR DELETE
  USING (organization_id = get_my_organization_id());
