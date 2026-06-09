import {
  assertInstagramOAuthConfig,
  INSTAGRAM_GRAPH_VERSION,
} from "./config";

const GRAPH_BASE = `https://graph.facebook.com/${INSTAGRAM_GRAPH_VERSION}`;

type GraphErrorBody = {
  error?: { message?: string; type?: string; code?: number };
};

async function parseGraphJson<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => ({}))) as T & GraphErrorBody;
  if (!res.ok) {
    const msg =
      json.error?.message ??
      `Graph API error (${res.status})`;
    throw new Error(msg);
  }
  return json;
}

export async function exchangeCodeForShortLivedToken(code: string) {
  const { appId, appSecret, redirectUri } = assertInstagramOAuthConfig();

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    }),
  });

  const json = await parseGraphJson<{ access_token: string }>(res);
  if (!json.access_token) {
    throw new Error("No se recibió access_token de Meta");
  }
  return json.access_token;
}

export async function exchangeForLongLivedToken(shortToken: string) {
  const { appId, appSecret } = assertInstagramOAuthConfig();

  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortToken);

  const res = await fetch(url);
  const json = await parseGraphJson<{
    access_token: string;
    expires_in?: number;
  }>(res);

  if (!json.access_token) {
    throw new Error("No se pudo obtener long-lived token");
  }

  return {
    accessToken: json.access_token,
    expiresIn: Number(json.expires_in ?? 60 * 24 * 60 * 60),
  };
}

export async function fetchInstagramBusinessAccount(accessToken: string) {
  const pagesRes = await fetch(
    `${GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(accessToken)}`
  );
  const pagesData = await parseGraphJson<{
    data?: { id: string; name?: string }[];
  }>(pagesRes);

  const page = pagesData.data?.[0];
  if (!page?.id) {
    throw new Error(
      "No se encontró una página de Facebook vinculada. Conectá una página con cuenta Instagram Business."
    );
  }

  const igRes = await fetch(
    `${GRAPH_BASE}/${page.id}?fields=instagram_business_account&access_token=${encodeURIComponent(accessToken)}`
  );
  const igData = await parseGraphJson<{
    instagram_business_account?: { id: string };
  }>(igRes);

  const igAccountId = igData.instagram_business_account?.id;
  if (!igAccountId) {
    throw new Error(
      "La página de Facebook no tiene una cuenta Instagram Business vinculada."
    );
  }

  const igProfileRes = await fetch(
    `${GRAPH_BASE}/${igAccountId}?fields=username,name&access_token=${encodeURIComponent(accessToken)}`
  );
  const igProfile = await parseGraphJson<{ username?: string; name?: string }>(
    igProfileRes
  );

  return {
    pageId: page.id,
    instagramUserId: igAccountId,
    username: igProfile.username ?? null,
  };
}

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
  const url = new URL(`${GRAPH_BASE}/${instagramUserId}/media`);
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
  const metrics = ["reach", "impressions", "saved", "shares", "plays"];
  const url = new URL(`${GRAPH_BASE}/${mediaId}/insights`);
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
