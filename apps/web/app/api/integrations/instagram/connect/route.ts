import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import {
  getInstagramOAuthConfig,
  INSTAGRAM_AUTH_URL,
  INSTAGRAM_SCOPES,
} from "@/lib/instagram/config";

export const runtime = "nodejs";

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID?.trim();

  console.log("[Instagram OAuth] APP_ID:", appId);

  if (!appId) {
    return NextResponse.json(
      { error: "INSTAGRAM_APP_ID not configured" },
      { status: 500 }
    );
  }

  const { redirectUri, appSecret } = getInstagramOAuthConfig();
  if (!redirectUri || !appSecret) {
    const missing = [
      !appSecret && "INSTAGRAM_APP_SECRET",
      !redirectUri && "INSTAGRAM_REDIRECT_URI",
    ].filter(Boolean);
    console.log("[Instagram OAuth] missing env:", missing.join(", ") || "none");
    return NextResponse.json(
      { error: `Missing env: ${missing.join(", ")}` },
      { status: 500 }
    );
  }

  try {
    const organizationId = await requireOrganizationId();
    const state = crypto.randomBytes(18).toString("hex");

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: INSTAGRAM_SCOPES,
      response_type: "code",
      state,
    });

    const res = NextResponse.redirect(`${INSTAGRAM_AUTH_URL}?${params}`);

    res.cookies.set(
      "instagram_oauth",
      JSON.stringify({ organizationId, state }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 10 * 60,
      }
    );

    return res;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo iniciar OAuth de Instagram",
      },
      { status: 500 }
    );
  }
}
