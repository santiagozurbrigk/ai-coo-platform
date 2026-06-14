import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processInstagramMessage } from "@/lib/instagram/process-message";
import type { InstagramMessaging } from "@/lib/instagram/process-message";

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
    const body = (await req.json()) as {
      object?: string;
      entry?: Array<{
        id: string;
        messaging?: InstagramMessaging[];
      }>;
    };

    if (body.object !== "instagram") {
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    for (const entry of body.entry ?? []) {
      const igAccountId = entry.id;

      const { data: integration } = await supabase
        .from("instagram_integrations")
        .select("organization_id, instagram_user_id")
        .eq("instagram_user_id", igAccountId)
        .maybeSingle();

      if (!integration) continue;

      for (const messaging of entry.messaging ?? []) {
        if (messaging.message) {
          await processInstagramMessage({
            organizationId: integration.organization_id,
            igAccountId,
            messaging,
          }).catch((err) => {
            console.error("[Instagram Webhook] Error procesando mensaje:", err);
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Instagram Webhook] Error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
