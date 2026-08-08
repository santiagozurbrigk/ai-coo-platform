-- Agrega 'google' como fuente válida para content_pieces
-- Usado por el sync de YouTube via OAuth de Google (Ecosistema Google)
ALTER TABLE public.content_pieces
  DROP CONSTRAINT IF EXISTS content_pieces_source_check;

ALTER TABLE public.content_pieces
  ADD CONSTRAINT content_pieces_source_check
  CHECK (source IN ('zernio', 'manual', 'ai_generated', 'google'));
