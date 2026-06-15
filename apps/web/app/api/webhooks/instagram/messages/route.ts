import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processInstagramMessage } from "@/lib/instagram/process-message";
import type { InstagramMessaging } from "@/lib/instagram/process-message";

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
    const body = (await req.json()) as InstagramWebhookBody;

    console.log(
      "[Instagram Webhook] Body recibido:",
      JSON.stringify(body, null, 2)
    );

    if (body.object !== "instagram") {
      console.log("[Instagram Webhook] Objeto no es instagram:", body.object);
      return NextResponse.json({ ok: true });
    }

    for (const entry of body.entry ?? []) {
      console.log(
        "[Instagram Webhook] Entry:",
        JSON.stringify(entry, null, 2)
      );

      const igAccountId = entry.id;
      console.log("[Instagram Webhook] igAccountId:", igAccountId);

      const supabase = createAdminClient();
      const { data: integration, error } = await supabase
        .from("instagram_integrations")
        .select("organization_id, instagram_user_id")
        .eq("instagram_user_id", igAccountId)
        .maybeSingle();

      console.log("[Instagram Webhook] Integration encontrada:", integration);
      console.log("[Instagram Webhook] Error integración:", error);

      if (!integration) {
        console.log(
          "[Instagram Webhook] No se encontró integración para igAccountId:",
          igAccountId
        );
        continue;
      }

      console.log("[Instagram Webhook] entry.messaging:", entry.messaging);
      console.log("[Instagram Webhook] entry.messages:", entry.messages);
      console.log(
        "[Instagram Webhook] Todas las keys del entry:",
        Object.keys(entry)
      );

      for (const messaging of entry.messaging ?? []) {
        console.log(
          "[Instagram Webhook] Procesando messaging:",
          JSON.stringify(messaging, null, 2)
        );

        if (messaging.message) {
          await processInstagramMessage({
            organizationId: integration.organization_id,
            igAccountId,
            messaging,
          }).catch((err) => {
            console.error(
              "[Instagram Webhook] Error en processInstagramMessage:",
              err
            );
          });
        } else {
          console.log(
            "[Instagram Webhook] messaging sin campo message:",
            Object.keys(messaging)
          );
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Instagram Webhook] Error general:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
