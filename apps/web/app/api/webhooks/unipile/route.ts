import { NextResponse } from "next/server";
import {
  getRequestIp,
  rateLimitExceeded,
  unipileWebhookRateLimit,
} from "@/lib/rate-limit";
import { ensureUnipileMessagingWebhook } from "@/lib/unipile/ensure-webhook";
import { isUnipileWebhookEnvelope } from "@/lib/unipile/parse-webhook";
import { processUnipileMessageWebhook } from "@/lib/unipile/process-message";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const ip = getRequestIp(req);
  const { allowed, resetAt } = unipileWebhookRateLimit(`unipile:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isUnipileWebhookEnvelope(body)) {
    console.warn("[Unipile Webhook] Payload no reconocido, ignorado");
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    await ensureUnipileMessagingWebhook();
    await processUnipileMessageWebhook(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Unipile Webhook] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar webhook" },
      { status: 500 }
    );
  }
}
