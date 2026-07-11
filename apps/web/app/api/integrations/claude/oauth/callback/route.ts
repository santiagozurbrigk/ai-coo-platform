import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  invalidateOrgCredentialCache,
  isAnthropicOAuthConfigured,
  saveOAuthTokensForOrg,
} from "@/lib/ai/credential-resolver";
import { paths } from "@/routes/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OAuthCookie = {
  organizationId: string;
  state: string;
  codeVerifier: string;
};

function redirectToSettings(
  origin: string,
  result: "success" | "error",
  reason?: string
) {
  const url = new URL(paths.platform.settingsTab("ia"), origin);
  url.searchParams.set("claude_oauth", result);
  if (reason) url.searchParams.set("claude_oauth_reason", reason);
  return NextResponse.redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (!isAnthropicOAuthConfigured()) {
    return redirectToSettings(origin, "error", "not_configured");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return redirectToSettings(origin, "error", "missing_params");
  }

  const cookieStore = await cookies();
  const cookieRaw = cookieStore.get("claude_oauth")?.value;
  if (!cookieRaw) {
    return redirectToSettings(origin, "error", "missing_cookie");
  }

  let cookie: OAuthCookie;
  try {
    cookie = JSON.parse(cookieRaw) as OAuthCookie;
  } catch {
    return redirectToSettings(origin, "error", "invalid_cookie");
  }

  if (cookie.state !== state) {
    return redirectToSettings(origin, "error", "state_mismatch");
  }

  const tokenUrl =
    process.env.ANTHROPIC_OAUTH_TOKEN_URL?.trim() ??
    "https://console.anthropic.com/oauth/token";

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.ANTHROPIC_OAUTH_REDIRECT_URI!.trim(),
      client_id: process.env.ANTHROPIC_OAUTH_CLIENT_ID!.trim(),
      client_secret: process.env.ANTHROPIC_OAUTH_CLIENT_SECRET!.trim(),
      code_verifier: cookie.codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    console.error("[claude/oauth/callback] Token exchange failed:", tokenRes.status);
    return redirectToSettings(origin, "error", "token_exchange");
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!tokens.access_token) {
    return redirectToSettings(origin, "error", "no_access_token");
  }

  await saveOAuthTokensForOrg(cookie.organizationId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    expiresAt: tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null,
  });

  invalidateOrgCredentialCache(cookie.organizationId);

  const res = redirectToSettings(origin, "success");
  res.cookies.set("claude_oauth", "", { path: "/", maxAge: 0 });
  return res;
}
