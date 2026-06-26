CREATE TABLE executive_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly')),
  week_label TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  risks JSONB NOT NULL DEFAULT '[]',
  bottlenecks JSONB NOT NULL DEFAULT '[]',
  recommendations JSONB NOT NULL DEFAULT '[]',
  departments JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE executive_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own org executive reports" ON executive_reports
  FOR SELECT USING (organization_id = get_my_organization_id());

CREATE INDEX executive_reports_org_period_idx
  ON executive_reports(organization_id, period, period_start DESC);
