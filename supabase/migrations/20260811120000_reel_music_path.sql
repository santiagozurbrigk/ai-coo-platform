-- TRIAL-3: Música personalizable por org en Trial Reels
-- Cada organización puede tener su propio track de fondo para la variante "music".
-- El path apunta a un archivo en el bucket trial-reels: {org-id}/music/background.mp3

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS reel_music_path TEXT DEFAULT NULL;

COMMENT ON COLUMN organizations.reel_music_path IS
  'Ruta en Supabase Storage (bucket trial-reels) del track de música personalizado. Ej: {org-id}/music/background.mp3. Si es NULL se usa el archivo por defecto en el worker.';
