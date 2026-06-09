export const INSTAGRAM_GRAPH_VERSION = "v19.0";

/** Scopes del nuevo sistema Meta (casos de uso) — modo desarrollo. */
export const INSTAGRAM_OAUTH_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
] as const;

/** Cadena lista para el parámetro `scope` del OAuth dialog. */
export const INSTAGRAM_SCOPES = INSTAGRAM_OAUTH_SCOPES.join(",");

/** Endpoint OAuth de Instagram (no usar facebook.com/dialog/oauth). */
export const INSTAGRAM_OAUTH_AUTHORIZE_URL =
  "https://www.instagram.com/oauth/authorize";

export function getInstagramOAuthConfig() {
  const appId = process.env.INSTAGRAM_APP_ID?.trim();
  const appSecret = process.env.INSTAGRAM_APP_SECRET?.trim();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI?.trim();

  return { appId, appSecret, redirectUri };
}

export function assertInstagramOAuthConfig() {
  const config = getInstagramOAuthConfig();
  const missing = [
    !config.appId && "INSTAGRAM_APP_ID",
    !config.appSecret && "INSTAGRAM_APP_SECRET",
    !config.redirectUri && "INSTAGRAM_REDIRECT_URI",
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
  }
  return config as {
    appId: string;
    appSecret: string;
    redirectUri: string;
  };
}
