import { NextResponse } from "next/server";
import { getRequestIp, rateLimitExceeded, webhookRateLimit } from "@/lib/rate-limit";
import { getUnipileConfig } from "@/lib/unipile/config";
import { ensureUnipileMessagingWebhook } from "@/lib/unipile/ensure-webhook";
import { processUnipileMessageWebhook } from "@/lib/unipile/process-message";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function verifyUnipileWebhookAuth(req: Request): boolean {
  const { webhookSecret } = getUnipileConfig();
  if (!webhookSecret) return true;
  return req.headers.get("unipile-auth") === webhookSecret;
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  if (!verifyUnipileWebhookAuth(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ip = getRequestIp(req);
  const { allowed, resetAt } = webhookRateLimit(`unipile:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
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
