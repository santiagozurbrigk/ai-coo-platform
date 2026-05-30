import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeGoogleCode, getGoogleEnv } from "@/lib/google/oauth";
import { integrationsOAuthRedirect } from "@/lib/integrations/oauth-redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

type OAuthCookie = {
  organizationId: string;
  state: string;
  codeVerifier: string;
};

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");

    if (!code || !state) {
      return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
    }

    if (!isSupabaseConfigured()) {
      return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
    }

    const cookieStore = await cookies();
    const cookieRaw = cookieStore.get("google_forms_oauth")?.value;
    if (!cookieRaw) {
      return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
    }

    let cookie: OAuthCookie;
    try {
      cookie = JSON.parse(cookieRaw) as OAuthCookie;
    } catch {
      return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
    }

    if (cookie.state !== state) {
      return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
    }

    const env = getGoogleEnv();
    const redirectUri = process.env.GOOGLE_FORMS_REDIRECT_URI;
    if (!env || !redirectUri) {
      return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
    }

    const tokens = await exchangeGoogleCode({
      code,
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      redirectUri,
      codeVerifier: cookie.codeVerifier,
    });

    const admin = createAdminClient();
    const { error: upsertError } = await admin.from("google_forms_integrations").upsert(
      {
        organization_id: cookie.organizationId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        status: "connected",
        last_sync_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" }
    );

    if (upsertError) {
      console.error("[google-forms/oauth/callback] DB upsert:", upsertError.message);
      return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
    }

    try {
      const { syncGoogleFormsForOrganization } = await import(
        "@/lib/google-forms/sync"
      );
      await syncGoogleFormsForOrganization(cookie.organizationId);
    } catch (e) {
      console.error("[google-forms/oauth/callback] sync inicial falló:", e);
    }

    return integrationsOAuthRedirect(
      origin,
      "google_forms",
      "connected",
      "google_forms_oauth"
    );
  } catch (e) {
    console.error("[google-forms/oauth/callback] Error:", e);
    return integrationsOAuthRedirect(origin, "google_forms", "error", "google_forms_oauth");
  }
}
