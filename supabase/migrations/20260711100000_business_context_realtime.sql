-- Habilitar Supabase Realtime para actualizar status de indexación en la UI.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'business_context_documents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.business_context_documents;
  END IF;
END $$;
