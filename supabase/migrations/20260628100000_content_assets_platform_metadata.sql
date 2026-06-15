-- Métricas nativas por plataforma (YouTube / Instagram) en JSONB

ALTER TABLE public.content_assets
  ADD COLUMN IF NOT EXISTS platform_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
