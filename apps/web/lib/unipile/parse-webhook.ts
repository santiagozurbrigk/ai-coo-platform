import { z } from "zod";
import {
  unipileEventWebhookSchema,
  unipileLegacyMessageWebhookSchema,
  unipileMessagePayloadSchema,
  type UnipileMessagePayload,
} from "./schemas";

export type ParsedUnipileMessage = {
  accountId: string;
  message: UnipileMessagePayload;
};

function isMessagePayload(value: unknown): value is UnipileMessagePayload {
  return unipileMessagePayloadSchema.safeParse(value).success;
}

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
}

/** Diagnóstico temporal — ver qué forma tiene el payload real de Unipile. */
export function diagnoseUnipileWebhookEnvelope(body: unknown): {
  accepted: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (!body || typeof body !== "object") {
    return {
      accepted: false,
      reasons: [`body no es objeto (tipo: ${body === null ? "null" : typeof body})`],
    };
  }

  const record = body as Record<string, unknown>;
  reasons.push(`top-level keys: ${Object.keys(record).join(", ") || "(ninguna)"}`);

  const eventParsed = unipileEventWebhookSchema.safeParse(body);
  if (eventParsed.success) {
    reasons.push("match: unipileEventWebhookSchema");
    return { accepted: true, reasons };
  }
  reasons.push(`unipileEventWebhookSchema: ${formatZodIssues(eventParsed.error)}`);

  const legacyParsed = unipileLegacyMessageWebhookSchema.safeParse(body);
  if (legacyParsed.success) {
    reasons.push("match: unipileLegacyMessageWebhookSchema");
    return { accepted: true, reasons };
  }
  reasons.push(
    `unipileLegacyMessageWebhookSchema: ${formatZodIssues(legacyParsed.error)}`
  );

  const messageParsed = unipileMessagePayloadSchema.safeParse(body);
  if (messageParsed.success) {
    reasons.push("match: unipileMessagePayloadSchema (mensaje en raíz)");
    return { accepted: true, reasons };
  }
  reasons.push(`unipileMessagePayloadSchema: ${formatZodIssues(messageParsed.error)}`);

  const accountId = record.account_id;
  if (typeof accountId === "string" && accountId.length > 0) {
    reasons.push("match: account_id en raíz");
    return { accepted: true, reasons };
  }
  reasons.push(
    `account_id en raíz ausente o inválido (valor: ${JSON.stringify(accountId)}, tipo: ${typeof accountId})`
  );

  if ("accountId" in record) {
    reasons.push(
      `encontrado accountId camelCase: ${JSON.stringify(record.accountId)}`
    );
  }
  if ("account" in record && record.account != null) {
    reasons.push(`encontrado campo account: ${JSON.stringify(record.account)}`);
  }
  if ("data" in record && record.data != null) {
    reasons.push(`encontrado campo data: ${JSON.stringify(record.data)}`);
  }
  if ("event" in record && record.event != null) {
    reasons.push(`encontrado campo event: ${JSON.stringify(record.event)}`);
  }

  return { accepted: false, reasons };
}

/** Forma mínima de un POST de Unipile (mensaje u otro evento de messaging). */
export function isUnipileWebhookEnvelope(body: unknown): boolean {
  return diagnoseUnipileWebhookEnvelope(body).accepted;
}

export function parseUnipileMessageWebhook(
  body: unknown
): ParsedUnipileMessage | null {
  const eventParsed = unipileEventWebhookSchema.safeParse(body);
  if (eventParsed.success) {
    const { type, account_id, payload } = eventParsed.data;
    if (type && type !== "message.new" && type !== "message_received") {
      return null;
    }
    if (payload && isMessagePayload(payload)) {
      const accountId = payload.account_id ?? account_id;
      if (!accountId) return null;
      return { accountId, message: payload };
    }
  }

  const legacyParsed = unipileLegacyMessageWebhookSchema.safeParse(body);
  if (legacyParsed.success) {
    const message = legacyParsed.data.message;
    const accountId =
      legacyParsed.data.account_id ?? message?.account_id ?? null;
    if (message && accountId && isMessagePayload(message)) {
      return { accountId, message };
    }
  }

  if (isMessagePayload(body)) {
    const message = body;
    if (message.account_id) {
      return { accountId: message.account_id, message };
    }
  }

  return null;
}

export function resolveUnipileLeadName(message: UnipileMessagePayload): string {
  const sender = message.sender;
  const fromSender =
    sender?.attendee_name?.trim() ||
    sender?.display_name?.trim() ||
    sender?.name?.trim();
  if (fromSender) return fromSender;

  if (message.sender_id?.trim()) {
    const id = message.sender_id.trim();
    if (id.length > 20) return `${id.slice(0, 8)}…`;
    return id;
  }

  return "Contacto";
}

export function resolveUnipileMessageText(message: UnipileMessagePayload): string {
  const text = message.text?.trim();
  if (text) return text;
  return "[Mensaje sin texto]";
}

export function shouldSkipUnipileMessage(message: UnipileMessagePayload): boolean {
  if (message.deleted) return true;
  if (message.hidden) return true;
  if (message.is_event) return true;
  return false;
}
