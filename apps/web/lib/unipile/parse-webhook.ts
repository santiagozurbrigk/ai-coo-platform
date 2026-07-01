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
