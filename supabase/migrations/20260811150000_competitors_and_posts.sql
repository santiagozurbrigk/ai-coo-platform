-- Tabla de competidores
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instagram_handle TEXT,
  website TEXT,
  notes TEXT,
  last_analysis_at TIMESTAMPTZ,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS competitors_org_idx ON competitors(organization_id);

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_competitors" ON competitors FOR SELECT
  USING (organization_id = get_my_organization_id());
CREATE POLICY "org_insert_competitors" ON competitors FOR INSERT
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_update_competitors" ON competitors FOR UPDATE
  USING (organization_id = get_my_organization_id())
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_delete_competitors" ON competitors FOR DELETE
  USING (organization_id = get_my_organization_id());

-- Tabla de posts de competidores
CREATE TABLE IF NOT EXISTS competitor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_id TEXT,
  platform TEXT NOT NULL DEFAULT 'instagram',
  post_type TEXT,
  caption TEXT,
  posted_at TIMESTAMPTZ,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  post_url TEXT,
  ai_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS competitor_posts_competitor_idx ON competitor_posts(competitor_id);
CREATE UNIQUE INDEX IF NOT EXISTS competitor_posts_external_idx
  ON competitor_posts(competitor_id, external_id)
  WHERE external_id IS NOT NULL;

ALTER TABLE competitor_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_competitor_posts" ON competitor_posts FOR SELECT
  USING (organization_id = get_my_organization_id());
CREATE POLICY "org_insert_competitor_posts" ON competitor_posts FOR INSERT
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_update_competitor_posts" ON competitor_posts FOR UPDATE
  USING (organization_id = get_my_organization_id())
  WITH CHECK (organization_id = get_my_organization_id());
CREATE POLICY "org_delete_competitor_posts" ON competitor_posts FOR DELETE
  USING (organization_id = get_my_organization_id());
