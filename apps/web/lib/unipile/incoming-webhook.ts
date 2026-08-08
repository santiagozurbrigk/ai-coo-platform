import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  getRequestIp,
  rateLimitExceeded,
  unipileWebhookRateLimit,
} from "@/lib/rate-limit";
import { ensureUnipileMessagingWebhook } from "@/lib/unipile/ensure-webhook";
import {
  diagnoseUnipileWebhookEnvelope,
  isUnipileWebhookEnvelope,
} from "@/lib/unipile/parse-webhook";
import {
  isUnipileHostedAuthNotify,
  processUnipileHostedAuthNotify,
} from "@/lib/unipile/process-hosted-auth";
import { processUnipileMessageWebhook } from "@/lib/unipile/process-message";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function verifyUnipileSecret(req: Request): boolean {
  const secret = process.env.UNIPILE_WEBHOOK_SECRET;
  if (!secret) return false;
  const headerToken = req.headers.get("x-unipile-secret") ?? req.headers.get("x-webhook-secret");
  if (!headerToken) return false;
  try {
    const expected = Buffer.from(secret);
    const received = Buffer.from(headerToken);
    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export async function handleUnipileIncomingWebhook(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  // Verificar secret compartido si está configurado
  if (process.env.UNIPILE_WEBHOOK_SECRET && !verifyUnipileSecret(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ip = getRequestIp(req);
  const { allowed, resetAt } = await unipileWebhookRateLimit(`unipile:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (isUnipileHostedAuthNotify(body)) {
    try {
      const result = await processUnipileHostedAuthNotify(body);
      return NextResponse.json(result);
    } catch (err) {
      console.error("[Unipile Hosted Auth] Error:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Error al procesar hosted auth",
        },
        { status: 500 }
      );
    }
  }

  console.log(
    "[Unipile] webhook recibido, event:",
    (body as { event?: string })?.event ?? "(sin event)"
  );

  const envelope = diagnoseUnipileWebhookEnvelope(body);
  console.log("[Unipile] envelope diagnosis:", envelope.reasons.join(" | "));

  if (!isUnipileWebhookEnvelope(body)) {
    console.log(
      "[Unipile] payload ignorado, reason: no pasó isUnipileWebhookEnvelope()"
    );
    console.log(
      "[Unipile] payload ignorado, detalle:",
      envelope.reasons.join(" | ")
    );
    return NextResponse.json({ ok: true, ignored: true });
  }

  console.log("[Unipile] payload aceptado, procesando mensaje");

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
