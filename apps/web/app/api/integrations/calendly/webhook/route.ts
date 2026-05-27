import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCalendlyEventsForOrganizationAdminAction } from "@/app/calendly/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

function parseCalendlySignature(headerValue: string) {
  // Formato: t=1693597064,v1=5mEzn...
  const parts = headerValue.split(",");
  if (parts.length < 2) return null;
  const t = parts[0]?.split("=")[1];
  const v1 = parts[1]?.split("=")[1]?.toLowerCase();
  if (!t || !v1) return null;
  return { timestamp: t, v1 };
}

function verifyCalendlySignature(bodyText: string, signatureHeader: string, secret: string) {
  const parsed = parseCalendlySignature(signatureHeader);
  if (!parsed) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parsed.timestamp}.${bodyText}`)
    .digest("hex");

  // timingSafeEqual exige el mismo tamaño.
  if (expected.length !== parsed.v1.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected.toLowerCase(), "utf8"),
    Buffer.from(parsed.v1, "utf8")
  );
}

function extractStartTime(payload: any): string | null {
  // Estructura común:
  // payload.scheduled_event.start_time o payload.event.start_time
  return (
    payload?.scheduled_event?.start_time ??
    payload?.event?.start_time ??
    payload?.start_time ??
    payload?.event?.start_time ??
    null
  );
}

function extractInviteeName(payload: any): string | null {
  const name = payload?.name ?? null;
  if (name) return String(name);

  const first = payload?.first_name ?? payload?.firstName;
  const last = payload?.last_name ?? payload?.lastName;
  if (first || last) return `${first ?? ""} ${last ?? ""}`.trim();

  return null;
}

function extractEventId(payload: any): string | null {
  // En invitee.created normalmente payload.uri es el invitee canon.
  return (
    payload?.uri ??
    payload?.invitee?.uri ??
    payload?.event?.uri ??
    payload?.routing_form_submission?.uri ??
    null
  );
}

function extractQuestionsAndAnswers(payload: any) {
  const qas = payload?.questions_and_answers;
  if (!Array.isArray(qas)) return [];
  const mapped = qas.map((qa: any) => {
    const question = qa?.question ?? null;
    const answer = qa?.answer ?? null;
    if (!question || answer == null) return null;
    return { question: String(question), answer: String(answer) };
  });

  return mapped.filter(
    (v): v is { question: string; answer: string } => v != null
  );
}

function mapStatusHint(eventType: string): "scheduled" | "no_show" | "not_closed" {
  if (eventType === "invitee.created") return "scheduled";
  if (eventType === "invitee_no_show.created") return "no_show";
  if (eventType === "invitee.canceled") return "no_show";
  if (eventType === "invitee_no_show.deleted") return "scheduled";
  if (eventType === "routing_form_submission.created") return "scheduled";
  return "scheduled";
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }

  try {
    const bodyText = await req.text();
    const signature =
      req.headers.get("Calendly-Webhook-Signature") ??
      req.headers.get("calendly-webhook-signature") ??
      req.headers.get("Calendly-Webhook-Signature");

    if (!signature) {
      return NextResponse.json({ error: "Falta header de firma de Calendly" }, { status: 400 });
    }

    const body = JSON.parse(bodyText);
    const eventType = String(body?.event ?? "");
    const payload = body?.payload ?? {};

    const supabase = createAdminClient();
    const { data: integrations } = await supabase
      .from("calendly_integrations")
      .select("organization_id, webhook_signing_key");

    const list = (integrations ?? []) as { organization_id: string; webhook_signing_key: string }[];

    let matchedOrgId: string | null = null;
    for (const int of list) {
      if (int.webhook_signing_key && verifyCalendlySignature(bodyText, signature, int.webhook_signing_key)) {
        matchedOrgId = int.organization_id;
        break;
      }
    }

    if (!matchedOrgId) {
      return NextResponse.json({ error: "Firma de Calendly inválida" }, { status: 401 });
    }

    const eventId = extractEventId(payload) ?? extractEventId(body?.payload);
    const startTime = extractStartTime(payload) ?? new Date().toISOString();
    const inviteeName = extractInviteeName(payload);
    if (!eventId || !inviteeName) {
      return NextResponse.json({ error: "Payload incompleto para sincronizar" }, { status: 400 });
    }

    const questionsAndAnswers = extractQuestionsAndAnswers(payload);

    await syncCalendlyEventsForOrganizationAdminAction(matchedOrgId, [
      {
        eventId,
        startTime,
        inviteeName,
        inviteeEmail: payload?.email,
        url: payload?.uri ?? null,
        questionsAndAnswers,
        statusHint: mapStatusHint(eventType),
      },
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 }
    );
  }
}

