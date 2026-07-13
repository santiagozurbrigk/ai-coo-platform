import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Redirect alias: Calendly tiene registrado /api/integrations/calendly/callback
 * pero el handler real vive en /oauth/callback. Este route reenvía manteniendo
 * todos los query params (code, state, error).
 */
export async function GET(request: NextRequest) {
  const target = new URL(
    "/api/integrations/calendly/oauth/callback",
    request.nextUrl.origin
  );
  // Copiar todos los query params que envía Calendly
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return NextResponse.redirect(target);
}
