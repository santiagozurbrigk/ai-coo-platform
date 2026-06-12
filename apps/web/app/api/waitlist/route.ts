import { NextResponse } from "next/server";
import { sendWaitlistConfirmationEmail } from "@/lib/email/waitlist-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";

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
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true });
    }
    console.error("[waitlist] insert:", error.message);
    return NextResponse.json(
      { error: "No pudimos registrarte. Intentá de nuevo." },
      { status: 500 }
    );
  }

  void sendWaitlistConfirmationEmail(email);

  return NextResponse.json({ ok: true });
}
