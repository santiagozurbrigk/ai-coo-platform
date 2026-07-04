-- Enriquecimiento IA del inbox + foto de perfil Unipile

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS lead_unipile_attendee_id TEXT,
  ADD COLUMN IF NOT EXISTS ai_tag TEXT,
  ADD COLUMN IF NOT EXISTS ai_pain_point TEXT,
  ADD COLUMN IF NOT EXISTS ai_funnel_stage TEXT,
  ADD COLUMN IF NOT EXISTS ai_link_shared BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_whatsapp_number_shared BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_booking_link_shared BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_cross_channel_source TEXT,
  ADD COLUMN IF NOT EXISTS ai_cross_channel_summary TEXT;

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_ai_tag_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_ai_tag_check CHECK (
    ai_tag IS NULL
    OR ai_tag IN (
      'muy-calificado',
      'calificado',
      'descalificado',
      'muy-descalificado',
      'agendado',
      'closeado',
      'no-closeado'
    )
  );

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_ai_funnel_stage_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_ai_funnel_stage_check CHECK (
    ai_funnel_stage IS NULL
    OR ai_funnel_stage IN (
      'primer_contacto',
      'calificando',
      'manejo_objeciones',
      'propuesta_agendamiento_enviada',
      'agendado',
      'no_show',
      'cerrado',
      'perdido_sin_respuesta'
    )
  );

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_ai_cross_channel_source_check;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_ai_cross_channel_source_check CHECK (
    ai_cross_channel_source IS NULL
    OR ai_cross_channel_source = 'instagram'
  );

CREATE INDEX IF NOT EXISTS conversations_lead_unipile_attendee_id_idx
  ON public.conversations (organization_id, lead_unipile_attendee_id)
  WHERE lead_unipile_attendee_id IS NOT NULL;
