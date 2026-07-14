import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createGooglePkce, getGoogleEnv, googleAuthUrl } from "@/lib/google/oauth";
import { GOOGLE_UNIFIED_SCOPES, GOOGLE_FORMS_DRIVE_SCOPES } from "@/lib/google/scopes";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const env = getGoogleEnv();
  const redirectUri = process.env.GOOGLE_FORMS_REDIRECT_URI;
  if (!env || !redirectUri) {
    return NextResponse.json({ error: "Faltan env Google Forms" }, { status: 500 });
  }

  const organizationId = await requireOrganizationId();
  const state = crypto.randomBytes(18).toString("hex");
  const { codeVerifier, codeChallenge } = createGooglePkce();

  // youtube=0 means the user explicitly opted out of YouTube scopes
  const includeYoutube = request.nextUrl.searchParams.get("youtube") !== "0";
  const scopes = includeYoutube ? [...GOOGLE_UNIFIED_SCOPES] : [...GOOGLE_FORMS_DRIVE_SCOPES];

  const res = NextResponse.redirect(
    googleAuthUrl({
      clientId: env.clientId,
      redirectUri,
      scopes,
      state,
      codeChallenge,
    })
  );

  res.cookies.set(
    "google_forms_oauth",
    JSON.stringify({ organizationId, state, codeVerifier, includeYoutube }),
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
