import { NextResponse } from "next/server";
import { sendWaitlistConfirmationEmail } from "@/lib/email/waitlist-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { trackUTMLeadCapture } from "@/lib/utm/track-lead";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const payload =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  const utm_source =
    typeof payload.utm_source === "string" ? payload.utm_source : null;
  const utm_medium =
    typeof payload.utm_medium === "string" ? payload.utm_medium : null;
  const utm_campaign =
    typeof payload.utm_campaign === "string" ? payload.utm_campaign : null;
  const utm_content =
    typeof payload.utm_content === "string" ? payload.utm_content : null;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Waitlist no disponible en este entorno" },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from("waitlist_leads").insert({
    email,
    source: "landing",
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
  });

  if (error) {
    if (error.code === "23505") {
      if (utm_campaign) {
        const orgId = process.env.NEXT_PUBLIC_UTM_ORGANIZATION_ID?.trim();
        if (orgId) {
          void trackUTMLeadCapture({
            organization_id: orgId,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            lead_identifier: email,
            lead_email: email,
          });
        }
      }
      return NextResponse.json({ ok: true });
    }
    console.error("[waitlist] insert:", error.message);
    return NextResponse.json(
      { error: "No pudimos registrarte. Intentá de nuevo." },
      { status: 500 }
    );
  }

  if (utm_campaign) {
    const orgId = process.env.NEXT_PUBLIC_UTM_ORGANIZATION_ID?.trim();
    if (orgId) {
      void trackUTMLeadCapture({
        organization_id: orgId,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        lead_identifier: email,
        lead_email: email,
      });
    }
  }

  void sendWaitlistConfirmationEmail(email);

  return NextResponse.json({ ok: true });
}
