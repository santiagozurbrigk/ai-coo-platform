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
  const { allowed, resetAt } = webhookRateLimit(`fathom:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  const rawBody = await request.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orgIdHeader = request.headers.get("x-organization-id");
  const fathomCallId = String(
    body.recording_id ?? body.call_id ?? body.id ?? ""
  );
  const title = String(body.title ?? body.meeting_title ?? "Llamada Fathom");

  if (!fathomCallId) {
    return NextResponse.json({ error: "Missing call id" }, { status: 400 });
  }

  const admin = createAdminClient();
  let organizationId = orgIdHeader ?? "";

  if (!organizationId) {
    const webhookSecret =
      request.headers.get("x-fathom-signature") ??
      request.headers.get("fathom-signature");
    const globalSecret = process.env.FATHOM_WEBHOOK_SECRET;

    const { data: integrations } = await admin
      .from("fathom_integrations")
      .select("organization_id, webhook_secret");

    const match = (integrations ?? []).find((i) => {
      const secret = i.webhook_secret ?? globalSecret;
      return secret && verifySignature(rawBody, webhookSecret, secret);
    });
    organizationId = match?.organization_id ?? "";
  }

  if (!organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
