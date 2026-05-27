export type ParsedManyChatWebhook = {
  subscriberId: string;
  leadName: string;
  messageText: string;
  sender: "lead" | "team";
  timestamp: string;
};

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return null;
}

function pickRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function resolveLeadName(body: Record<string, unknown>): string {
  const first = pickString(body, ["first_name", "firstName"]);
  const last = pickString(body, ["last_name", "lastName"]);
  if (first || last) return `${first ?? ""} ${last ?? ""}`.trim();

  const name = pickString(body, ["name", "full_name", "fullName"]);
  if (name) return name;

  const nested = pickRecord(body.subscriber) ?? pickRecord(body.contact) ?? pickRecord(body.data);
  if (nested) return resolveLeadName(nested);

  return "Contacto ManyChat";
}

function resolveSubscriberId(body: Record<string, unknown>): string | null {
  const direct = pickString(body, [
    "subscriber_id",
    "subscriberId",
    "user_id",
    "userId",
    "contact_id",
    "contactId",
    "id",
  ]);
  if (direct) return direct;

  const nested = pickRecord(body.subscriber) ?? pickRecord(body.contact) ?? pickRecord(body.data);
  if (nested) return resolveSubscriberId(nested);

  return null;
}

function resolveMessageText(body: Record<string, unknown>): string | null {
  const direct = pickString(body, [
    "message",
    "text",
    "last_input_text",
    "lastInputText",
    "last_text_input",
    "body",
    "content",
  ]);
  if (direct) return direct;

  const nested = pickRecord(body.subscriber) ?? pickRecord(body.contact) ?? pickRecord(body.data);
  if (nested) return resolveMessageText(nested);

  return null;
}

function resolveSender(body: Record<string, unknown>): "lead" | "team" {
  const raw = pickString(body, ["sender", "from", "message_from", "direction"]);
  if (!raw) return "lead";
  const lower = raw.toLowerCase();
  if (
    lower.includes("bot") ||
    lower.includes("page") ||
    lower.includes("team") ||
    lower.includes("business") ||
    lower === "out"
  ) {
    return "team";
  }
  return "lead";
}

/** Acepta JSON flexible de External Request / webhooks de ManyChat. */
export function parseManyChatWebhookPayload(body: unknown): ParsedManyChatWebhook | null {
  const record = pickRecord(body);
  if (!record) return null;

  const subscriberId = resolveSubscriberId(record);
  const messageText = resolveMessageText(record);
  if (!subscriberId || !messageText) return null;

  return {
    subscriberId,
    leadName: resolveLeadName(record),
    messageText,
    sender: resolveSender(record),
    timestamp: new Date().toISOString(),
  };
}
