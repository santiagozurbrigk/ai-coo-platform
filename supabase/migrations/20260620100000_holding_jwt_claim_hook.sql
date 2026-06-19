-- Holding: JWT claim active_business_org_id vía Auth Hook + get_my_organization_id()

CREATE TABLE IF NOT EXISTS public.holding_active_sessions (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  business_org_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  set_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.holding_active_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_all" ON public.holding_active_sessions;
CREATE POLICY "deny_all"
  ON public.holding_active_sessions
  FOR ALL
  USING (false);

-- Auth Hook lee estas tablas (no pasa RLS del rol authenticated)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON TABLE public.holding_active_sessions TO supabase_auth_admin;
GRANT SELECT ON TABLE public.holding_businesses TO supabase_auth_admin;
GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims JSONB;
  active_business_id UUID;
  user_id UUID;
BEGIN
  claims := event->'claims';
  user_id := (event->>'user_id')::UUID;

  IF user_id IS NULL THEN
    RETURN event;
  END IF;

  SELECT has.business_org_id
  INTO active_business_id
  FROM public.holding_active_sessions has
  INNER JOIN public.profiles p ON p.id = has.profile_id
  INNER JOIN public.holding_businesses hb
    ON hb.holding_org_id = p.organization_id
   AND hb.business_org_id = has.business_org_id
   AND hb.status = 'active'
  WHERE has.profile_id = user_id
  LIMIT 1;

  IF active_business_id IS NOT NULL THEN
    claims := jsonb_set(
      claims,
      '{active_business_org_id}',
      to_jsonb(active_business_id::TEXT)
    );
    event := jsonb_set(event, '{claims}', claims);
  END IF;

  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) FROM authenticated, anon, public;

CREATE OR REPLACE FUNCTION public.get_my_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT (auth.jwt() ->> 'active_business_org_id')::UUID
      WHERE NULLIF(auth.jwt() ->> 'active_business_org_id', '') IS NOT NULL
    ),
    (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  )
$$;

REVOKE ALL ON FUNCTION public.get_my_organization_id() FROM public;
GRANT EXECUTE ON FUNCTION public.get_my_organization_id() TO authenticated;

-- MANUAL (Dashboard): Authentication → Hooks → Custom Access Token Hook
-- → Postgres function → public.custom_access_token_hook
-- La migración sola NO activa el hook; sin eso el claim no se agrega al JWT.
