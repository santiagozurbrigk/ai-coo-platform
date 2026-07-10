ALTER TABLE public.content_pieces
  ADD COLUMN IF NOT EXISTS sales_attributed JSONB;

CREATE INDEX IF NOT EXISTS content_pieces_sales_attributed_gin_idx
  ON public.content_pieces
  USING GIN (sales_attributed);
