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

  const res = await fetch(url, {
    ...init,
    headers: {
      "X-API-KEY": accessToken,
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
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
