import { NextResponse } from "next/server";
import { processManyChatWebhookForOrganization } from "@/lib/manychat/process-webhook";
import { getManyChatIntegrationByWebhookToken } from "@/lib/manychat/integration";
import { parseManyChatWebhookPayload } from "@/lib/manychat/parse-webhook";
import { getRequestIp, webhookRateLimit, rateLimitExceeded } from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  const ip = getRequestIp(req);
  const { allowed, resetAt } = webhookRateLimit(`manychat:${ip}`);
  if (!allowed) return rateLimitExceeded(resetAt);

  const { token } = await context.params;
  if (!token?.trim()) {
    return NextResponse.json({ error: "Token de webhook inválido" }, { status: 400 });
  }

  const integration = await getManyChatIntegrationByWebhookToken(token.trim());
  if (!integration) {
    return NextResponse.json({ error: "Webhook no reconocido" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = parseManyChatWebhookPayload(body);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "Payload incompleto. Incluye subscriber_id y message (o last_input_text) en el External Request.",
      },
      { status: 400 }
    );
  }

  try {
    await processManyChatWebhookForOrganization(integration.organization_id, parsed);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al procesar webhook" },
      { status: 500 }
    );
  }
}
