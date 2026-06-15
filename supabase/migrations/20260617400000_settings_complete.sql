-- Settings: campos de organización + preferencias de notificaciones por usuario

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,

  email_weekly_report BOOLEAN DEFAULT true,
  email_new_conversation BOOLEAN DEFAULT false,
  email_booking_confirmed BOOLEAN DEFAULT true,
  email_sale_closed BOOLEAN DEFAULT true,
  email_sop_suggestion BOOLEAN DEFAULT true,

  inapp_new_conversation BOOLEAN DEFAULT true,
  inapp_booking_confirmed BOOLEAN DEFAULT true,
  inapp_sale_closed BOOLEAN DEFAULT true,
  inapp_ghosting_alert BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, organization_id)
);

CREATE INDEX IF NOT EXISTS notification_preferences_profile_org_idx
  ON public.notification_preferences (profile_id, organization_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_preferences" ON public.notification_preferences;
CREATE POLICY "own_preferences" ON public.notification_preferences
  FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
