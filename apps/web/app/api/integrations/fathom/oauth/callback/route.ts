import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
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

    if (!code || !state || !isSupabaseConfigured()) {
      return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
    }

    const cookieStore = await cookies();
    const cookieRaw = cookieStore.get("fathom_oauth")?.value;
    if (!cookieRaw) {
      return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
    }

    let cookie: OAuthCookie;
    try {
      cookie = JSON.parse(cookieRaw) as OAuthCookie;
    } catch {
      return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
    }

    if (cookie.state !== state) {
      return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
    }

    const clientId = process.env.FATHOM_CLIENT_ID;
    const clientSecret = process.env.FATHOM_CLIENT_SECRET;
    const redirectUri = process.env.FATHOM_REDIRECT_URI;
    const tokenUrl =
      process.env.FATHOM_TOKEN_URL?.trim() ??
      "https://fathom.video/external/v1/oauth2/token";

    if (!clientId || !clientSecret || !redirectUri) {
      return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
    }

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier: cookie.codeVerifier,
      }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("[fathom/oauth/callback] Token failed:", tokenRes.status, body);
      return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    const admin = createAdminClient();
    const { error: upsertError } = await admin.from("fathom_integrations").upsert(
      {
        organization_id: cookie.organizationId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        webhook_secret: process.env.FATHOM_WEBHOOK_SECRET ?? null,
        status: "connected",
        last_sync_at: new Date().toISOString(),
      },
      { onConflict: "organization_id" }
    );

    if (upsertError) {
      console.error("[fathom/oauth/callback] DB upsert:", upsertError.message);
      return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
    }

    return integrationsOAuthRedirect(origin, "fathom", "connected", "fathom_oauth");
  } catch (e) {
    console.error("[fathom/oauth/callback] Error:", e);
    return integrationsOAuthRedirect(origin, "fathom", "error", "fathom_oauth");
  }
}
