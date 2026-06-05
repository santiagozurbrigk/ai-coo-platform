import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireOrganizationId } from "@/lib/auth/bootstrap";

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
  const challenge = base64UrlEncode(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge: challenge };
}

export async function GET() {
  const clientId = process.env.FATHOM_CLIENT_ID;
  const redirectUri = process.env.FATHOM_REDIRECT_URI;
  const authBase =
    process.env.FATHOM_AUTH_BASE?.trim() ?? "https://fathom.video/oauth/authorize";

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Faltan FATHOM_CLIENT_ID / FATHOM_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const organizationId = await requireOrganizationId();
  const state = crypto.randomBytes(18).toString("hex");
  const { codeVerifier, codeChallenge } = createPkce();

  const authUrl = new URL(authBase);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("code_challenge", codeChallenge);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set(
    "fathom_oauth",
    JSON.stringify({ organizationId, state, codeVerifier }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    }
  );
  return res;
}
