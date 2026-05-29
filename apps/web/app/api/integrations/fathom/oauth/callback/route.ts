import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paths } from "@/routes";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieRaw = request.cookies.get("fathom_oauth")?.value;

  const redirectBase = `${paths.platform.integrations}?fathom=`;

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

  const clientId = process.env.FATHOM_CLIENT_ID;
  const clientSecret = process.env.FATHOM_CLIENT_SECRET;
  const redirectUri = process.env.FATHOM_REDIRECT_URI;
  const tokenUrl =
    process.env.FATHOM_TOKEN_URL?.trim() ??
    "https://fathom.video/external/v1/oauth2/token";

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${redirectBase}error`);
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
    return NextResponse.redirect(`${redirectBase}error`);
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  const admin = createAdminClient();
  await admin.from("fathom_integrations").upsert(
    {
      organization_id: cookie.organizationId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      token_expires_at: expiresAt,
      webhook_secret: process.env.FATHOM_WEBHOOK_SECRET ?? null,
      status: "connected",
      last_sync_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" }
  );

  const res = NextResponse.redirect(`${redirectBase}connected`);
  res.cookies.delete("fathom_oauth");
  return res;
}
