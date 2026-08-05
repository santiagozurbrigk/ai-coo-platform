-- Bucket público para persistir thumbnails de contenido (especialmente historias de Instagram)
-- Las historias de Instagram expiran a las 24hs; guardamos el thumbnail antes de que desaparezca.

-- Crear el bucket si no existe (idempotente vía DO block)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'content-thumbnails',
    'content-thumbnails',
    true,             -- público: las URLs son accesibles sin autenticación (thumbnails de contenido publicado)
    5242880,          -- 5MB por archivo
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Política: solo el service role puede subir/eliminar (lo hace el servidor en sync)
-- La lectura es pública por la configuración del bucket (public = true)

DROP POLICY IF EXISTS "Service role manages content thumbnails" ON storage.objects;
CREATE POLICY "Service role manages content thumbnails"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'content-thumbnails')
  WITH CHECK (bucket_id = 'content-thumbnails');

-- Lectura pública (permite que next/image sirva las imágenes directamente)
DROP POLICY IF EXISTS "Public read content thumbnails" ON storage.objects;
CREATE POLICY "Public read content thumbnails"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'content-thumbnails');
