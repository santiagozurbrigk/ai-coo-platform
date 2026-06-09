export const INSTAGRAM_GRAPH_VERSION = "v19.0";

/** Scopes mínimos compatibles con el nuevo sistema Meta en modo desarrollo. */
export const INSTAGRAM_SCOPES = "instagram_basic,pages_show_list";

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
