const MANYCHAT_API_BASE = "https://api.manychat.com";

type ManyChatApiResponse<T> = {
  status?: string;
  data?: T;
  message?: string;
  details?: unknown;
};

export type ManyChatPageInfo = {
  id?: number | string;
  name?: string;
};

export type ManyChatSubscriber = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  name?: string;
  status?: string;
  last_interaction?: string;
  ig_username?: string;
  last_text_input?: string;
};

async function manyChatFetch<T>(
  apiToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const resp = await fetch(`${MANYCHAT_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = (await resp.json().catch(() => null)) as ManyChatApiResponse<T> | null;

  if (!resp.ok || json?.status === "error") {
    const detailMessages = (
      json?.details as { messages?: Array<{ message?: string }> } | undefined
    )?.messages;
    const firstDetail = detailMessages?.[0]?.message;
    const message =
      firstDetail ??
      json?.message ??
      `ManyChat API error (${resp.status})`;
    throw new Error(message);
  }

  return (json?.data ?? json) as T;
}

export async function fetchManyChatPageInfo(apiToken: string): Promise<ManyChatPageInfo> {
  return manyChatFetch<ManyChatPageInfo>(apiToken, "/fb/page/getInfo");
}

export async function fetchManyChatSubscriber(
  apiToken: string,
  subscriberId: string
): Promise<ManyChatSubscriber> {
  const params = new URLSearchParams({ subscriber_id: subscriberId });
  return manyChatFetch<ManyChatSubscriber>(
    apiToken,
    `/fb/subscriber/getInfo?${params}`
  );
}

function isEmailInput(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhoneInput(value: string): boolean {
  return /^\+?[\d\s().-]{8,}$/.test(value);
}

function isNumericSubscriberId(value: string): boolean {
  return /^\d+$/.test(value);
}

function firstSubscriberFromLookup(
  data: ManyChatSubscriber | ManyChatSubscriber[] | null | undefined
): ManyChatSubscriber | null {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

async function findSubscriberBySystemField(
  apiToken: string,
  field: "email" | "phone",
  value: string
): Promise<ManyChatSubscriber | null> {
  const params = new URLSearchParams({ [field]: value });
  const data = await manyChatFetch<ManyChatSubscriber | ManyChatSubscriber[]>(
    apiToken,
    `/fb/subscriber/findBySystemField?${params}`
  );
  return firstSubscriberFromLookup(data);
}

/** Acepta subscriber ID numérico, email o teléfono (SMS). */
export async function resolveManyChatSubscriber(
  apiToken: string,
  input: string
): Promise<ManyChatSubscriber> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Indica un subscriber ID, email o teléfono.");
  }

  if (isEmailInput(trimmed)) {
    const found = await findSubscriberBySystemField(apiToken, "email", trimmed);
    if (!found?.id) {
      throw new Error(
        "No encontramos un contacto con ese email en ManyChat. Si es solo WhatsApp, usa el subscriber ID numérico ({{user_id}} en External Request)."
      );
    }
    return fetchManyChatSubscriber(apiToken, String(found.id));
  }

  if (isPhoneInput(trimmed)) {
    const normalized = trimmed.replace(/\s/g, "");
    const found = await findSubscriberBySystemField(apiToken, "phone", normalized);
    if (!found?.id) {
      throw new Error(
        "No encontramos un contacto con ese teléfono (campo SMS). Prueba con el subscriber ID numérico."
      );
    }
    return fetchManyChatSubscriber(apiToken, String(found.id));
  }

  if (!isNumericSubscriberId(trimmed)) {
    throw new Error(
      "El subscriber ID debe ser numérico (ej. el valor de {{user_id}}). Un email va en el mismo campo y lo buscamos automáticamente."
    );
  }

  return fetchManyChatSubscriber(apiToken, trimmed);
}
