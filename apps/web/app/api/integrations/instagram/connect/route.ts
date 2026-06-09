import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import {
  assertInstagramOAuthConfig,
  INSTAGRAM_GRAPH_VERSION,
  INSTAGRAM_OAUTH_SCOPES,
} from "@/lib/instagram/config";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { appId, redirectUri } = assertInstagramOAuthConfig();
    const organizationId = await requireOrganizationId();
    const state = crypto.randomBytes(18).toString("hex");

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: INSTAGRAM_OAUTH_SCOPES.join(","),
      response_type: "code",
      state,
    });

    const res = NextResponse.redirect(
      `https://www.facebook.com/${INSTAGRAM_GRAPH_VERSION}/dialog/oauth?${params}`
    );

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
          err instanceof Error ? err.message : "No se pudo iniciar OAuth de Instagram",
      },
      { status: 500 }
    );
  }
}
