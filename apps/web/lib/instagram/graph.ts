import {
  assertInstagramOAuthConfig,
  INSTAGRAM_GRAPH_URL,
  INSTAGRAM_TOKEN_URL,
} from "./config";

type GraphErrorBody = {
  error?: { message?: string; type?: string; code?: number };
  error_message?: string;
};

async function parseGraphJson<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as T & GraphErrorBody;
  if (!res.ok) {
    const msg =
      json.error?.message ??
      json.error_message ??
      `Instagram API error (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

export async function exchangeCodeForShortLivedToken(code: string) {
  const { appId, appSecret, redirectUri } = assertInstagramOAuthConfig();

  const res = await fetch(INSTAGRAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  const json = await parseGraphJson<{
    access_token?: string;
    user_id?: string | number;
    data?: { access_token: string; user_id: string | number }[];
  }>(res);

  const accessToken =
    json.access_token ?? json.data?.[0]?.access_token ?? null;
  if (!accessToken) {
    throw new Error("No se recibió access_token de Instagram");
  }

  return accessToken;
}

export async function exchangeForLongLivedToken(shortToken: string) {
  const { appSecret } = assertInstagramOAuthConfig();

  const url = new URL("https://graph.instagram.com/access_token");
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortToken);

  const res = await fetch(url);
  const json = await parseGraphJson<{
    access_token: string;
    expires_in?: number;
    token_type?: string;
  }>(res);

  if (!json.access_token) {
    throw new Error("No se pudo obtener long-lived token");
  }

  return {
    accessToken: json.access_token,
    expiresIn: Number(json.expires_in ?? 60 * 24 * 60 * 60),
  };
}

export async function fetchInstagramProfile(accessToken: string) {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/me`);
  url.searchParams.set("fields", "user_id,username,account_type,name");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url);
  const profile = await parseGraphJson<{
    user_id?: string;
    id?: string;
    username?: string;
    account_type?: string;
  }>(res);

  const instagramUserId = profile.user_id ?? profile.id;
  if (!instagramUserId) {
    throw new Error("No se pudo obtener el ID de la cuenta Instagram");
  }

  return {
    pageId: null as string | null,
    instagramUserId,
    username: profile.username ?? null,
  };
}

/** @deprecated Usar fetchInstagramProfile — alias temporal */
export const fetchInstagramBusinessAccount = fetchInstagramProfile;

export type InstagramMediaItem = {
  id: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
};

export async function fetchInstagramMedia(
  instagramUserId: string,
  accessToken: string,
  limit = 50
) {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/${instagramUserId}/media`);
  url.searchParams.set(
    "fields",
    "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count"
  );
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url);
  const json = await parseGraphJson<{ data?: InstagramMediaItem[] }>(res);
  return json.data ?? [];
}

export async function fetchMediaInsights(
  mediaId: string,
  accessToken: string
): Promise<Record<string, number>> {
  const metrics = ["reach", "views", "saved", "shares", "likes", "comments"];
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/${mediaId}/insights`);
  url.searchParams.set("metric", metrics.join(","));
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url);
  if (!res.ok) {
    return {};
  }

  const json = (await res.json().catch(() => ({}))) as {
    data?: { name: string; values?: { value?: number }[] }[];
  };

  const out: Record<string, number> = {};
  for (const insight of json.data ?? []) {
    out[insight.name] = Number(insight.values?.[0]?.value ?? 0);
  }
  return out;
}
