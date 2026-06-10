import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import {
  assertStripeOAuthConfig,
  STRIPE_OAUTH_URL,
} from "@/lib/stripe/config";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { clientId, redirectUri } = assertStripeOAuthConfig();
    const organizationId = await requireOrganizationId();
    const state = crypto.randomBytes(18).toString("hex");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: "read_only",
      redirect_uri: redirectUri,
      state,
    });

    const res = NextResponse.redirect(`${STRIPE_OAUTH_URL}?${params}`);

    res.cookies.set(
      "stripe_oauth",
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
            : "No se pudo iniciar OAuth de Stripe",
      },
      { status: 500 }
    );
  }
}
