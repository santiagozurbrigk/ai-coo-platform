-- Corrige UTMs creados con content_assets.id (UUID) en vez de external_id de YouTube.
-- Sin esto, content-sales-rank no puede unir ventas con el video de origen.

UPDATE public.utm_links ul
SET youtube_video_id = ca.external_id
FROM public.content_assets ca
WHERE ul.youtube_video_id = ca.id::text
  AND ca.platform = 'youtube'
  AND ca.external_id IS NOT NULL
  AND ca.external_id <> ul.youtube_video_id;
