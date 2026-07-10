-- Tabla principal de piezas de contenido
CREATE TABLE public.content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('reel', 'story', 'post', 'carousel', 'youtube', 'brief')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('zernio', 'manual', 'ai_generated')),

  platform_post_id TEXT,
  platform_post_url TEXT,
  platform TEXT,
  published_at TIMESTAMPTZ,

  title TEXT,
  caption TEXT,
  hashtags TEXT[],
  thumbnail_url TEXT,

  drive_file_id TEXT,
  drive_file_name TEXT,
  drive_file_url TEXT,

  transcript TEXT,
  analysis JSONB,
  analysis_generated_at TIMESTAMPTZ,

  variants_of UUID REFERENCES public.content_pieces(id) ON DELETE SET NULL,
  brief JSONB,

  metrics JSONB,
  metrics_updated_at TIMESTAMPTZ,

  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'scheduled', 'published', 'archived')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX content_pieces_org_idx ON public.content_pieces(organization_id);
CREATE INDEX content_pieces_type_idx ON public.content_pieces(organization_id, type);
CREATE INDEX content_pieces_status_idx ON public.content_pieces(organization_id, status);
CREATE INDEX content_pieces_variants_idx ON public.content_pieces(variants_of) WHERE variants_of IS NOT NULL;
CREATE UNIQUE INDEX content_pieces_platform_post_unique ON public.content_pieces(organization_id, platform_post_id) WHERE platform_post_id IS NOT NULL;

CREATE TRIGGER set_content_pieces_updated_at
  BEFORE UPDATE ON public.content_pieces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_pieces_org_isolation" ON public.content_pieces
  USING (organization_id = public.get_my_organization_id())
  WITH CHECK (organization_id = public.get_my_organization_id());
