import { assertUnipileConfig } from "./config";

type UnipileJson = Record<string, unknown>;

export class UnipileApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: string
  ) {
    super(message);
    this.name = "UnipileApiError";
  }
}

export async function unipileFetch<T = UnipileJson>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { dsn, accessToken } = assertUnipileConfig();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${dsn.replace(/\/$/, "")}${normalizedPath}`;

  // FormData define su propio content-type (boundary) — no pisarlo.
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  const res = await fetch(url, {
    ...init,
    headers: {
      "X-API-KEY": accessToken,
      accept: "application/json",
      ...(init?.body && !isFormData
        ? { "content-type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new UnipileApiError(
      `Unipile API ${res.status}: ${text.slice(0, 300)}`,
      res.status,
      text
    );
  }

  if (!text.trim()) return {} as T;
  return JSON.parse(text) as T;
}

const RATE_LIMIT_RETRY_MS = 400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function unipileFetchWithRateLimitRetry<T = UnipileJson>(
  path: string,
  init?: RequestInit
): Promise<T> {
  try {
    return await unipileFetch<T>(path, init);
  } catch (err) {
    if (err instanceof UnipileApiError && err.status === 429) {
      console.warn("[Unipile] rate limited, reintentando", {
        path,
        status: err.status,
        body: err.body?.slice(0, 300),
        retryMs: RATE_LIMIT_RETRY_MS,
      });
      await sleep(RATE_LIMIT_RETRY_MS);
      return unipileFetch<T>(path, init);
    }
    throw err;
  }
}

export type UnipileChatAttendee = {
  id: string;
  account_id?: string;
  provider_id?: string;
  name?: string;
  is_self?: number | boolean;
};

export async function getUnipileAttendeeById(
  attendeeId: string,
  accountId?: string
): Promise<UnipileChatAttendee | null> {
  try {
    const query = accountId
      ? `?account_id=${encodeURIComponent(accountId)}`
      : "";
    return await unipileFetchWithRateLimitRetry<UnipileChatAttendee>(
      `/api/v1/chat_attendees/${encodeURIComponent(attendeeId)}${query}`
    );
  } catch (err) {
    if (err instanceof UnipileApiError && err.status === 404) return null;
    throw err;
  }
}

export async function listUnipileChatAttendees(
  chatId: string
): Promise<UnipileChatAttendee[]> {
  const response = await unipileFetchWithRateLimitRetry<{ items?: UnipileChatAttendee[] }>(
    `/api/v1/chats/${encodeURIComponent(chatId)}/attendees`
  );
  return response.items ?? [];
}

export async function fetchUnipileAttendeePicture(
  attendeeId: string,
  accountId?: string
): Promise<{ contentType: string; buffer: ArrayBuffer } | null> {
  try {
    const { dsn, accessToken } = assertUnipileConfig();
    const query = accountId
      ? `?account_id=${encodeURIComponent(accountId)}`
      : "";
    const url = `${dsn.replace(/\/$/, "")}/api/v1/chat_attendees/${encodeURIComponent(attendeeId)}/picture${query}`;

    const res = await fetch(url, {
      headers: { "X-API-KEY": accessToken },
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();
    if (!buffer.byteLength) return null;

    return { contentType, buffer };
  } catch {
    return null;
  }
}

export type UnipileSendMessageResult = {
  object?: string;
  message_id?: string;
};

/**
 * Envía un mensaje a un chat de Unipile (Instagram / WhatsApp).
 * https://developer.unipile.com/docs/send-messages — POST /chats/{chat_id}/messages
 */
export async function sendUnipileChatMessage(options: {
  chatId: string;
  text: string;
  attachment?: { fileName: string; mimeType: string; data: Blob };
}): Promise<UnipileSendMessageResult> {
  const form = new FormData();
  form.append("text", options.text);
  if (options.attachment) {
    form.append(
      "attachments",
      new File([options.attachment.data], options.attachment.fileName, {
        type: options.attachment.mimeType,
      })
    );
  }

  return unipileFetchWithRateLimitRetry<UnipileSendMessageResult>(
    `/api/v1/chats/${encodeURIComponent(options.chatId)}/messages`,
    { method: "POST", body: form }
  );
}
