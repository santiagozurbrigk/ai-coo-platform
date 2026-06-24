import crypto from "crypto";
import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import {
  assertMercadoPagoOAuthConfig,
  MP_OAUTH_AUTHORIZE_URL,
} from "@/lib/mercadopago/config";
import { createPkcePair } from "@/lib/mercadopago/pkce";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { clientId, redirectUri } = assertMercadoPagoOAuthConfig();
    const organizationId = await requireOrganizationId();
    const state = crypto.randomBytes(18).toString("hex");
    const { codeVerifier, codeChallenge } = createPkcePair();

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      platform_id: "mp",
      state,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const res = NextResponse.redirect(`${MP_OAUTH_AUTHORIZE_URL}?${params}`);

    res.cookies.set(
      "mercadopago_oauth",
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
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo iniciar OAuth de Mercado Pago",
      },
      { status: 500 }
    );
  }
}
