CREATE TABLE IF NOT EXISTS zernio_conversation_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  participant_name TEXT,
  platform TEXT,
  ai_tag TEXT,
  ai_status TEXT,
  ai_qualification TEXT,
  ai_sentiment TEXT,
  ai_pain_point TEXT,
  ai_recommended_action TEXT,
  ai_ghosting_risk TEXT,
  ai_summary TEXT,
  agenda_sent BOOLEAN DEFAULT FALSE,
  is_scheduled BOOLEAN DEFAULT FALSE,
  link_sent BOOLEAN DEFAULT FALSE,
  message_count INT DEFAULT 0,
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, conversation_id)
);

ALTER TABLE zernio_conversation_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can select zernio analysis"
  ON zernio_conversation_analysis FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
