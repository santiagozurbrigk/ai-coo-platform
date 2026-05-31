import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCalendlyEventsForOrganization } from "@/lib/calendly/sync-events";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CalendlyWebhookBody, CalendlyWebhookInviteePayload } from "@/types/calendly";

export const runtime = "nodejs";

function parseCalendlySignature(headerValue: string) {
  const parts = headerValue.split(",");
  if (parts.length < 2) return null;
  const t = parts[0]?.split("=")[1];
  const v1 = parts[1]?.split("=")[1]?.toLowerCase();
  if (!t || !v1) return null;
  return { timestamp: t, v1 };
}

function verifyCalendlySignature(
  bodyText: string,
  signatureHeader: string,
  secret: string
) {
  const parsed = parseCalendlySignature(signatureHeader);
  if (!parsed) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parsed.timestamp}.${bodyText}`)
    .digest("hex");

  if (expected.length !== parsed.v1.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected.toLowerCase(), "utf8"),
    Buffer.from(parsed.v1, "utf8")
  );
}

function uriFromField(
  field: string | { uri?: string } | undefined
): string | null {
  if (!field) return null;
  if (typeof field === "string") return field;
  return field.uri ?? null;
}

function extractStartTime(payload: CalendlyWebhookInviteePayload): string | null {
  const nested = payload.scheduled_event?.start_time;
  if (nested) return nested;

  const eventField = payload.event;
  if (eventField && typeof eventField === "object" && "start_time" in eventField) {
    const start = eventField.start_time;
    if (start) return start;
  }

  return payload.start_time ?? null;
}

function extractInviteeName(payload: CalendlyWebhookInviteePayload): string | null {
  if (payload.name) return String(payload.name);

  const first = payload.first_name ?? payload.firstName;
  const last = payload.last_name ?? payload.lastName;
  if (first || last) return `${first ?? ""} ${last ?? ""}`.trim();

  return null;
}

function extractEventId(payload: CalendlyWebhookInviteePayload): string | null {
  return (
    payload.uri ??
    uriFromField(payload.invitee) ??
    (typeof payload.event === "string" ? payload.event : payload.event?.uri) ??
    uriFromField(payload.routing_form_submission) ??
    null
  );
}

function extractQuestionsAndAnswers(payload: CalendlyWebhookInviteePayload) {
  const qas = payload.questions_and_answers;
  if (!Array.isArray(qas)) return [];
  const mapped = qas.map((qa) => {
    const question = qa?.question ?? null;
    const answer = qa?.answer ?? null;
    if (!question || answer == null) return null;
    return { question: String(question), answer: String(answer) };
  });

  return mapped.filter(
    (v): v is { question: string; answer: string } => v != null
  );
}

function mapStatusHint(
  eventType: string
): "scheduled" | "no_show" | "not_closed" {
  if (eventType === "invitee.created") return "scheduled";
  if (eventType === "invitee_no_show.created") return "no_show";
  if (eventType === "invitee.canceled") return "no_show";
  if (eventType === "invitee_no_show.deleted") return "scheduled";
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
      req.headers.get("calendly-webhook-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Falta header de firma de Calendly" },
        { status: 400 }
      );
    }

    const body = JSON.parse(bodyText) as CalendlyWebhookBody;
    const eventType = String(body.event ?? "");
    const payload: CalendlyWebhookInviteePayload = body.payload ?? {};

    const supabase = createAdminClient();
    const { data: integrations } = await supabase
      .from("calendly_integrations")
      .select("organization_id, webhook_signing_key");

    const list = (integrations ?? []) as {
      organization_id: string;
      webhook_signing_key: string;
    }[];

    let matchedOrgId: string | null = null;
    for (const int of list) {
      if (
        int.webhook_signing_key &&
        verifyCalendlySignature(bodyText, signature, int.webhook_signing_key)
      ) {
        matchedOrgId = int.organization_id;
        break;
      }
    }

    if (!matchedOrgId) {
      return NextResponse.json({ error: "Firma de Calendly inválida" }, { status: 401 });
    }

    const eventId = extractEventId(payload);
    const startTime = extractStartTime(payload) ?? new Date().toISOString();
    const inviteeName = extractInviteeName(payload);
    if (!eventId || !inviteeName) {
      return NextResponse.json(
        { error: "Payload incompleto para sincronizar" },
        { status: 400 }
      );
    }

    const questionsAndAnswers = extractQuestionsAndAnswers(payload);

    const admin = createAdminClient();
    await syncCalendlyEventsForOrganization(admin, matchedOrgId, [
      {
        eventId,
        startTime,
        inviteeName,
        inviteeEmail: payload.email,
        url: payload.uri,
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
