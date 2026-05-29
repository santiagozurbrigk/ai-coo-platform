import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import { processPendingFathomCalls } from "@/lib/fathom/process-call";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Procesar llamadas Fathom cuyo delay de 30 min ya venció. Invocable por cron Vercel. */
export async function POST(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const processed = await processPendingFathomCalls(50);
  return NextResponse.json({ ok: true, processed });
}

export async function GET(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const processed = await processPendingFathomCalls(50);
  return NextResponse.json({ ok: true, processed });
}
