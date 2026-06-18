import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processInstagramMessage } from "@/lib/instagram/process-message";
import type { InstagramMessaging } from "@/lib/instagram/process-message";
import { verifyInstagramWebhookSignature } from "@/lib/instagram/verify-webhook-signature";

// NOTA: Este webhook funciona solo en modo Live de Meta (post App Review).
// En modo Development, usar el polling via /api/integrations/instagram/poll.
// El polling corre cada 5 minutos y trae todos los mensajes completos.

type InstagramWebhookEntry = {
  id: string;
  time?: number;
  messaging?: InstagramMessaging[];
  messages?: unknown;
  [key: string]: unknown;
};

type InstagramWebhookBody = {
  object?: string;
  entry?: InstagramWebhookEntry[];
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN
  ) {
    console.log("[Instagram Webhook] Verificación exitosa");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!verifyInstagramWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as InstagramWebhookBody;

    if (body.object !== "instagram") {
      console.log("[Instagram Webhook] Objeto ignorado:", body.object ?? "unknown");
      return NextResponse.json({ ok: true });
    }

    const entryCount = body.entry?.length ?? 0;
    let processedMessages = 0;
    let skippedIntegrations = 0;
    let errors = 0;

    for (const entry of body.entry ?? []) {
      const igAccountId = entry.id;

      const supabase = createAdminClient();
      const { data: integration, error } = await supabase
        .from("instagram_integrations")
        .select("organization_id, instagram_user_id")
        .eq("instagram_user_id", igAccountId)
        .maybeSingle();

      if (error) {
        errors += 1;
        console.error(
          "[Instagram Webhook] Error buscando integración:",
          { igAccountId, code: error.code }
        );
        continue;
      }

      if (!integration) {
        skippedIntegrations += 1;
        continue;
      }

      for (const messaging of entry.messaging ?? []) {
        if (!messaging.message) continue;

        try {
          await processInstagramMessage({
            organizationId: integration.organization_id,
            igAccountId,
            messaging,
          });
          processedMessages += 1;
        } catch (err) {
          errors += 1;
          console.error("[Instagram Webhook] Error procesando mensaje:", {
            igAccountId,
            organizationId: integration.organization_id,
            error: err instanceof Error ? err.message : "unknown",
          });
        }
      }
    }

    console.log("[Instagram Webhook] Procesado:", {
      entries: entryCount,
      processedMessages,
      skippedIntegrations,
      errors,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Instagram Webhook] Error general:", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
