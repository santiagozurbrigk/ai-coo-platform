import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { sendWaitlistConfirmationEmail } from "@/lib/email/waitlist-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { trackUTMLeadCapture } from "@/lib/utm/track-lead";
import { sendMetaLeadEvent } from "@/lib/meta/conversions-api";
import {
  MONTHLY_REVENUE_OPTIONS,
  TEAM_SIZE_OPTIONS,
} from "@/types/waitlist";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(value: unknown): string | null {
  const trimmed = readString(value);
  return trimmed.length > 0 ? trimmed : null;
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

  const email = readString(payload.email).toLowerCase();
  const firstName = readString(payload.first_name);
  const lastName = readString(payload.last_name);
  const phone = readString(payload.phone);
  const instagram = readOptionalString(payload.instagram);
  const monthlyRevenue = readString(payload.monthly_revenue);
  const teamSize = readString(payload.team_size);
  const operationalPain = readString(payload.operational_pain);
  const whyNow = readString(payload.why_now);

  const utm_source = readOptionalString(payload.utm_source);
  const utm_medium = readOptionalString(payload.utm_medium);
  const utm_campaign = readOptionalString(payload.utm_campaign);
  const utm_content = readOptionalString(payload.utm_content);
  const pageUrl = readOptionalString(payload.page_url);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !monthlyRevenue ||
    !teamSize ||
    !operationalPain ||
    !whyNow
  ) {
    return NextResponse.json(
      { error: "Completá todos los campos del formulario." },
      { status: 400 }
    );
  }

  if (
    !(MONTHLY_REVENUE_OPTIONS as readonly string[]).includes(monthlyRevenue)
  ) {
    return NextResponse.json(
      { error: "Seleccioná un rango de facturación válido." },
      { status: 400 }
    );
  }

  if (!(TEAM_SIZE_OPTIONS as readonly string[]).includes(teamSize)) {
    return NextResponse.json(
      { error: "Seleccioná un tamaño de equipo válido." },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Waitlist no disponible en este entorno" },
      { status: 503 }
    );
  }

  const eventId = randomUUID();
  const admin = createAdminClient();

  const row = {
    email,
    source: "landing",
    first_name: firstName,
    last_name: lastName,
    phone,
    instagram,
    monthly_revenue: monthlyRevenue,
    team_size: teamSize,
    operational_pain: operationalPain,
    why_now: whyNow,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
  };

  const { data: existing } = await admin
    .from("waitlist_leads")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { error } = existing
    ? await admin.from("waitlist_leads").update(row).eq("email", email)
    : await admin.from("waitlist_leads").insert(row);

  if (error) {
    console.error("[waitlist] save:", error.message);
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

  if (!existing) {
    void sendWaitlistConfirmationEmail(email);
  }

  void sendMetaLeadEvent({ email, request, eventId, pageUrl });

  return NextResponse.json({ ok: true, eventId });
}
