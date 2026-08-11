-- Trial Reels: tabla de jobs de variaciones automáticas de reels
-- Workflow: pending → processing → preview_ready → publishing → done | failed

-- ─── Storage bucket ───────────────────────────────────────────────────────────
-- El bucket 'trial-reels' almacena el video fuente y las 5 variantes por job.
-- Privado por defecto — se accede vía signed URLs (TTL 7 días para preview, 1h para publicar).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trial-reels',
  'trial-reels',
  false,
  524288000, -- 500 MB
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: solo service role puede escribir, las orgs pueden leer sus propios archivos
-- (acceso controlado en server actions vía admin client)



CREATE TABLE reel_variation_jobs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_piece_id uuid        NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,

  -- Estado del job completo
  -- pending        = recién creado, esperando worker
  -- processing     = worker procesando variantes
  -- preview_ready  = todas las variantes listas, esperando revisión del usuario
  -- publishing     = publicando variantes en Zernio con delay entre ellas
  -- done           = todas las variantes incluidas fueron publicadas
  -- failed         = error irrecuperable en el worker
  status          TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','preview_ready','publishing','done','failed')),

  delay_hours     INTEGER     NOT NULL DEFAULT 2 CHECK (delay_hours >= 0 AND delay_hours <= 72),

  -- Array de objetos variante. Cada uno:
  -- {
  --   type:          'speed_up'|'speed_down'|'music'|'subtitles'|'color'
  --   storage_path:  text (path en Supabase Storage, bucket 'trial-reels')
  --   preview_url:   text (URL firmada o pública)
  --   description:   text (caption editable por el usuario)
  --   hashtags:      text[] (hashtags editables)
  --   included:      boolean (el usuario puede excluir variantes)
  --   status:        'processing'|'ready'|'published'|'failed'
  --   zernio_post_id: text|null
  --   published_at:   text|null (ISO timestamp)
  --   error:          text|null
  -- }
  variations      JSONB       NOT NULL DEFAULT '[]'::jsonb,

  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE reel_variation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can select own jobs"
  ON reel_variation_jobs FOR SELECT
  USING (organization_id = public.get_my_organization_id());

CREATE POLICY "org members can insert own jobs"
  ON reel_variation_jobs FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());

CREATE POLICY "org members can update own jobs"
  ON reel_variation_jobs FOR UPDATE
  USING (organization_id = public.get_my_organization_id());

-- Índices
CREATE INDEX idx_rvj_org_status  ON reel_variation_jobs (organization_id, status);
CREATE INDEX idx_rvj_source_piece ON reel_variation_jobs (source_piece_id);

-- Trigger updated_at (usa la función set_updated_at ya existente en el proyecto)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER reel_variation_jobs_updated_at
  BEFORE UPDATE ON reel_variation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
