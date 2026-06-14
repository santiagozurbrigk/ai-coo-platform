export const INSTAGRAM_GRAPH_VERSION = "v19.0";

/**
 * Scopes Instagram Graph API v18+ (Meta deprecó instagram_basic).
 * Lectura de media + insights hacia content_assets; pages_* para /me/accounts.
 */
export const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

export const INSTAGRAM_OAUTH_AUTHORIZE_URL = `https://www.facebook.com/${INSTAGRAM_GRAPH_VERSION}/dialog/oauth`;

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
