export const INSTAGRAM_GRAPH_VERSION = "v19.0";

export const INSTAGRAM_OAUTH_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_insights",
  "instagram_manage_comments",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
] as const;

export function getInstagramOAuthConfig() {
  const appId = process.env.INSTAGRAM_APP_ID?.trim();
  const appSecret = process.env.INSTAGRAM_APP_SECRET?.trim();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI?.trim();

  return { appId, appSecret, redirectUri };
}

export function assertInstagramOAuthConfig() {
  const config = getInstagramOAuthConfig();
  if (!config.appId || !config.appSecret || !config.redirectUri) {
    throw new Error(
      "Faltan INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET o INSTAGRAM_REDIRECT_URI"
    );
  }
  return config as {
    appId: string;
    appSecret: string;
    redirectUri: string;
  };
}
