import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markMercadoPagoDisconnectedByMpUserId } from "@/lib/mercadopago/tokens";
import { verifyMercadoPagoWebhookSignature } from "@/lib/mercadopago/webhook-verify";
import { getRequestIp, rateLimitExceeded, webhookRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const { allowed, resetAt } = webhookRateLimit(`mercadopago:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  const url = new URL(request.url);
  const rawBody = await request.text();

  let body: Record<string, unknown> = {};
  if (rawBody.trim()) {
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  const dataId =
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    String(body.data && typeof body.data === "object" && "id" in body.data
      ? (body.data as { id?: string | number }).id
      : body.id ?? "");

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!secret) {
    console.error("[mercadopago/webhook] MERCADOPAGO_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });
  }

  if (
    !verifyMercadoPagoWebhookSignature({
      dataId,
      xSignature,
      xRequestId,
      secret,
    })
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topic = String(
    body.type ?? body.topic ?? url.searchParams.get("topic") ?? ""
  );
  const action = String(body.action ?? "");

  if (
    topic === "mp-connect" ||
    action === "application.deauthorized" ||
    action === "authorized.deauthorized"
  ) {
    const userId = String(
      body.user_id ??
        (body.data && typeof body.data === "object" && "user_id" in body.data
          ? (body.data as { user_id?: string | number }).user_id
          : "")
    );

    if (userId) {
      await markMercadoPagoDisconnectedByMpUserId(userId);
    }
  }

  if (topic === "payment" && dataId) {
    const admin = createAdminClient();
    const now = new Date().toISOString();
    await admin
      .from("mercadopago_integrations")
      .update({ last_sync_at: now, updated_at: now })
      .eq("status", "active");
  }

  return NextResponse.json({ ok: true });
}
