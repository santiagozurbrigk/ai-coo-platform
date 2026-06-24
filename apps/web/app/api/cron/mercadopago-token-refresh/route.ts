import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import { refreshAllMercadoPagoTokens } from "@/lib/mercadopago/tokens";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  try {
    const result = await refreshAllMercadoPagoTokens();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/mercadopago-token-refresh] Error:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
