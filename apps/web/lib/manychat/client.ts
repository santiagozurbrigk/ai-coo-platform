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
    const message =
      json?.message ??
      (typeof json?.details === "object" &&
      json.details &&
      "messages" in (json.details as object)
        ? JSON.stringify((json.details as { messages?: unknown }).messages)
        : null) ??
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
