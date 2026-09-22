import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { ingestFathomWebhookCall } from "@/lib/fathom/process-call";
import { getRequestIp, rateLimitExceeded, webhookRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return signature === expected;
  }
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const { allowed, resetAt } = await webhookRateLimit(`fathom:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  const rawBody = await request.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fathomCallId = String(
    body.recording_id ?? body.call_id ?? body.id ?? ""
  );
  const title = String(body.title ?? body.meeting_title ?? "Llamada Fathom");

  if (!fathomCallId) {
    return NextResponse.json({ error: "Missing call id" }, { status: 400 });
  }

  const webhookSecret =
    request.headers.get("x-fathom-signature") ??
    request.headers.get("fathom-signature");
  const globalSecret = process.env.FATHOM_WEBHOOK_SECRET;

  const admin = createAdminClient();
  const { data: integrations, error: integrationsError } = await admin
    .from("fathom_integrations")
    .select("organization_id, webhook_secret");
  if (integrationsError) {
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }

  const matches = (integrations ?? []).filter((i) => {
    const secret = i.webhook_secret ?? globalSecret;
    return secret && verifySignature(rawBody, webhookSecret, secret);
  });

  if (matches.length === 0) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /*
   * ⚠️ Ruta legacy: `connectFathomWithApiKey` guarda el mismo
   * FATHOM_WEBHOOK_SECRET en todas las orgs, así que una firma válida puede
   * servir para varias. Antes se tomaba la primera (`.find`) y la llamada —con
   * su transcript— terminaba en otra organización. Si la firma no identifica a
   * una sola org, se rechaza: la ruta por miembro `/webhook/[token]` es la que
   * atribuye bien.
   */
  if (matches.length > 1) {
    console.warn(
      "[fathom/webhook] firma válida para varias orgs; se rechaza (usar /webhook/[token])",
      { candidates: matches.length }
    );
    return NextResponse.json(
      { error: "Ambiguous signature: use the per-member webhook URL" },
      { status: 409 }
    );
  }

  const organizationId = matches[0].organization_id as string;

  await ingestFathomWebhookCall({
    organizationId,
    fathomCallId,
    title,
    transcript: typeof body.transcript === "string" ? body.transcript : undefined,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    durationSeconds:
      typeof body.duration_seconds === "number"
        ? body.duration_seconds
        : undefined,
    callDate:
      typeof body.recorded_at === "string" ? body.recorded_at : undefined,
    fathomUrl: typeof body.url === "string" ? body.url : undefined,
  });

  return NextResponse.json({ ok: true });
}
