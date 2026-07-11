import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isAnthropicOAuthConfigured } from "@/lib/ai/credential-resolver";
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
  const challenge = base64UrlEncode(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge: challenge };
}

export async function GET() {
  if (!isAnthropicOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "OAuth de Claude no está habilitado en este entorno. Usá API key en Settings → IA.",
      },
      { status: 503 }
    );
  }

  const clientId = process.env.ANTHROPIC_OAUTH_CLIENT_ID!.trim();
  const redirectUri = process.env.ANTHROPIC_OAUTH_REDIRECT_URI!.trim();
  const authorizeUrl =
    process.env.ANTHROPIC_OAUTH_AUTHORIZE_URL?.trim() ??
    "https://console.anthropic.com/oauth/authorize";

  const organizationId = await requireOrganizationId();
  const state = crypto.randomBytes(18).toString("hex");
  const { codeVerifier, codeChallenge } = createPkce();

  const authUrl = new URL(authorizeUrl);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set(
    "scope",
    process.env.ANTHROPIC_OAUTH_SCOPES ?? "user:profile user:inference"
  );
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("code_challenge", codeChallenge);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set(
    "claude_oauth",
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
