-- Análisis IA de conversaciones ManyChat (scoring con Claude Haiku)

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ai_engagement_score INTEGER CHECK (ai_engagement_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ai_intent_score INTEGER CHECK (ai_intent_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ai_qualification_score INTEGER CHECK (ai_qualification_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ai_label TEXT CHECK (ai_label IN ('hot', 'warm', 'cold', 'unqualified')),
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_detected_objections JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_booking_signals JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_ghosting_signals JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS ai_recommended_action TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_link_id UUID REFERENCES public.utm_links (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_video_title TEXT,
  ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS conversations_ai_label_idx
  ON public.conversations (organization_id, ai_label)
  WHERE ai_label IS NOT NULL;

CREATE INDEX IF NOT EXISTS conversations_last_analyzed_at_idx
  ON public.conversations (organization_id, last_analyzed_at)
  WHERE last_analyzed_at IS NOT NULL;
