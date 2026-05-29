import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paths } from "@/routes";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieRaw = request.cookies.get("typeform_oauth")?.value;
  const redirectBase = `${paths.platform.integrations}?typeform=`;

  if (!code || !state || !cookieRaw) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  let cookie: { organizationId: string; state: string };
  try {
    cookie = JSON.parse(cookieRaw);
  } catch {
    return NextResponse.redirect(`${redirectBase}error`);
  }
  if (cookie.state !== state) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  const clientId = process.env.TYPEFORM_CLIENT_ID;
  const clientSecret = process.env.TYPEFORM_CLIENT_SECRET;
  const redirectUri = process.env.TYPEFORM_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  const tokenRes = await fetch("https://api.typeform.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${redirectBase}error`);
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const admin = createAdminClient();
  await admin.from("typeform_integrations").upsert(
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
    const { syncTypeformForOrganization } = await import("@/lib/typeform/sync");
    await syncTypeformForOrganization(cookie.organizationId);
  } catch (e) {
    console.error("[typeform/oauth/callback] sync inicial falló:", e);
  }

  const res = NextResponse.redirect(`${redirectBase}connected`);
  res.cookies.delete("typeform_oauth");
  return res;
}
