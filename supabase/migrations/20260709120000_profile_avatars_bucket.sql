-- Avatares de perfil (públicos por URL, path: {organization_id}/{user_id}.{ext})

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Org members insert avatars" ON storage.objects;
CREATE POLICY "Org members insert avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );

DROP POLICY IF EXISTS "Org members update avatars" ON storage.objects;
CREATE POLICY "Org members update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = public.get_my_organization_id()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );

DROP POLICY IF EXISTS "Org members delete avatars" ON storage.objects;
CREATE POLICY "Org members delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = public.get_my_organization_id()::text
  );
