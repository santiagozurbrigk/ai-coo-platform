import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireOrganizationId } from "@/lib/auth/bootstrap";

export const runtime = "nodejs";

export async function GET() {
  const clientId = process.env.TYPEFORM_CLIENT_ID;
  const redirectUri = process.env.TYPEFORM_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Faltan env Typeform" }, { status: 500 });
  }

  const organizationId = await requireOrganizationId();
  const state = crypto.randomBytes(18).toString("hex");
  const authUrl = new URL("https://api.typeform.com/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", "forms:read responses:read");
  authUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set(
    "typeform_oauth",
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
}
