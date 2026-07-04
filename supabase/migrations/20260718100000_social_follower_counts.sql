-- Contadores de audiencia para métricas de overview de Marketing.

ALTER TABLE public.instagram_integrations
  ADD COLUMN IF NOT EXISTS followers_count integer,
  ADD COLUMN IF NOT EXISTS followers_delta integer;

ALTER TABLE public.youtube_integrations
  ADD COLUMN IF NOT EXISTS subscriber_count integer,
  ADD COLUMN IF NOT EXISTS subscriber_delta integer;
