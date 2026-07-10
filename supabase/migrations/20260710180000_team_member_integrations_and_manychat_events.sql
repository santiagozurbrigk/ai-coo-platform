-- Team member integrations (Fathom per user) + ManyChat CTA events

CREATE TABLE IF NOT EXISTS public.team_member_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  api_key TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id, integration_type)
);

CREATE INDEX IF NOT EXISTS team_member_integrations_org_type_idx
  ON public.team_member_integrations (organization_id, integration_type);

ALTER TABLE public.team_member_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own team member integrations" ON public.team_member_integrations;
CREATE POLICY "Users manage own team member integrations"
  ON public.team_member_integrations
  FOR ALL
  USING (
    user_id = auth.uid()
    AND organization_id = public.get_my_organization_id()
  )
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.get_my_organization_id()
  );

ALTER TABLE public.fathom_calls
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS fathom_calls_user_id_idx
  ON public.fathom_calls (user_id);

ALTER TABLE public.manychat_integrations
  ADD COLUMN IF NOT EXISTS cta_tags TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.manychat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  subscriber_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('cta_response', 'flow_triggered')),
  flow_name TEXT,
  tag TEXT,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS manychat_events_org_triggered_idx
  ON public.manychat_events (organization_id, triggered_at DESC);

CREATE INDEX IF NOT EXISTS manychat_events_org_type_idx
  ON public.manychat_events (organization_id, event_type);

ALTER TABLE public.manychat_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members read manychat events" ON public.manychat_events;
CREATE POLICY "Org members read manychat events"
  ON public.manychat_events
  FOR SELECT
  USING (organization_id = public.get_my_organization_id());

DROP POLICY IF EXISTS "Org members insert manychat events" ON public.manychat_events;
CREATE POLICY "Org members insert manychat events"
  ON public.manychat_events
  FOR INSERT
  WITH CHECK (organization_id = public.get_my_organization_id());
