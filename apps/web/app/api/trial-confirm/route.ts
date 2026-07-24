import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { sendMetaLeadEvent } from "@/lib/meta/conversions-api";

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
  const utm_source = readOptionalString(payload.utm_source);
  const utm_medium = readOptionalString(payload.utm_medium);
  const utm_campaign = readOptionalString(payload.utm_campaign);
  const utm_content = readOptionalString(payload.utm_content);
  const pageUrl = readOptionalString(payload.page_url);

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!firstName || !phone) {
    return NextResponse.json(
      { error: "Completá los campos requeridos." },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const eventId = randomUUID();
  const admin = createAdminClient();

  const row = {
    email,
    source: "trial",
    first_name: firstName,
    last_name: lastName || "-",
    phone,
    instagram,
    monthly_revenue: "No especificado",
    team_size: "Solo yo",
    operational_pain: "Trial confirmado vía /prueba",
    why_now: "Completó formulario post-Calendly",
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
    console.error("[trial-confirm] save:", error.message);
    return NextResponse.json(
      { error: "No pudimos registrarte. Intentá de nuevo." },
      { status: 500 }
    );
  }

  void sendMetaLeadEvent({ email, request, eventId, pageUrl });

  return NextResponse.json({ ok: true, eventId });
}
