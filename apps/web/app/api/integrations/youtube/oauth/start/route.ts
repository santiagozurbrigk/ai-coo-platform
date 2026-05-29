import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createGooglePkce, getGoogleEnv, googleAuthUrl } from "@/lib/google/oauth";

export const runtime = "nodejs";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export async function GET() {
  const env = getGoogleEnv();
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;
  if (!env || !redirectUri) {
    return NextResponse.json({ error: "Faltan env Google/YouTube" }, { status: 500 });
  }

  const organizationId = await requireOrganizationId();
  const state = crypto.randomBytes(18).toString("hex");
  const { codeVerifier, codeChallenge } = createGooglePkce();

  const res = NextResponse.redirect(
    googleAuthUrl({
      clientId: env.clientId,
      redirectUri,
      scopes: SCOPES,
      state,
      codeChallenge,
    })
  );

  res.cookies.set(
    "youtube_oauth",
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
