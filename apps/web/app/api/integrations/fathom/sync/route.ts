import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import { syncAllFathomIntegrations } from "@/lib/fathom/sync";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Sincroniza reuniones de Fathom vía API key. Invocable por cron o manualmente con CRON_SECRET. */
async function runSync(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const result = await syncAllFathomIntegrations();
  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  return runSync(request);
}

export async function GET(request: Request) {
  return runSync(request);
}
