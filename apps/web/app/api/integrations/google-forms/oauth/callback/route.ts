import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeGoogleCode, getGoogleEnv } from "@/lib/google/oauth";
import { paths } from "@/routes";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieRaw = request.cookies.get("google_forms_oauth")?.value;
  const redirectBase = `${paths.platform.integrations}?google_forms=`;

  if (!code || !state || !cookieRaw) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  let cookie: { organizationId: string; state: string; codeVerifier: string };
  try {
    cookie = JSON.parse(cookieRaw);
  } catch {
    return NextResponse.redirect(`${redirectBase}error`);
  }
  if (cookie.state !== state) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  const env = getGoogleEnv();
  const redirectUri = process.env.GOOGLE_FORMS_REDIRECT_URI;
  if (!env || !redirectUri) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  try {
    const tokens = await exchangeGoogleCode({
      code,
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      redirectUri,
      codeVerifier: cookie.codeVerifier,
    });

    const admin = createAdminClient();
    await admin.from("google_forms_integrations").upsert(
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

    try {
      const { syncGoogleFormsForOrganization } = await import(
        "@/lib/google-forms/sync"
      );
      await syncGoogleFormsForOrganization(cookie.organizationId);
    } catch (e) {
      console.error("[google-forms/oauth/callback] sync inicial falló:", e);
    }

    const res = NextResponse.redirect(`${redirectBase}connected`);
    res.cookies.delete("google_forms_oauth");
    return res;
  } catch {
    return NextResponse.redirect(`${redirectBase}error`);
  }
}
