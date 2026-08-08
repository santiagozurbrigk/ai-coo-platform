/**
 * OAuth start para closers individuales.
 * Cada closer conecta su propio Calendly desde /settings.
 * El token queda en team_member_integrations (integration_type='calendly').
 */
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/bootstrap";
import crypto from "crypto";

export const runtime = "nodejs";

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createPkce() {
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlEncode(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge };
}

export async function GET() {
  const calendlyClientId = process.env.CALENDLY_CLIENT_ID;
  const calendlyClientSecret = process.env.CALENDLY_CLIENT_SECRET;
  const redirectUri = process.env.CALENDLY_CLOSER_REDIRECT_URI ?? process.env.CALENDLY_REDIRECT_URI;
  const calendlyAuthBase = process.env.CALENDLY_AUTH_BASE ?? "https://auth.calendly.com";

  if (!calendlyClientId || !calendlyClientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Faltan env vars: CALENDLY_CLIENT_ID / CALENDLY_CLIENT_SECRET / CALENDLY_CLOSER_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const profile = await getCurrentProfile();
  if (!profile?.id || !profile?.organization_id) {
    return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });
  }

  const state = crypto.randomBytes(18).toString("hex");
  const { codeVerifier, codeChallenge } = createPkce();

  const authUrl = new URL(`${calendlyAuthBase}/oauth/authorize`);
  authUrl.searchParams.set("client_id", calendlyClientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set(
    "scope",
    "users:read scheduled_events:read"
  );
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("code_challenge", codeChallenge);

  const res = NextResponse.redirect(authUrl.toString());

  // Cookie con profileId + organizationId para validar en callback
  res.cookies.set(
    "calendly_closer_oauth",
    JSON.stringify({
      profileId: profile.id,
      organizationId: profile.organization_id,
      state,
      codeVerifier,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60, // 10 minutos
    }
  );

  return res;
}
