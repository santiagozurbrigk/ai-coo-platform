export const STRIPE_OAUTH_URL = "https://connect.stripe.com/oauth/authorize";
export const STRIPE_TOKEN_URL = "https://connect.stripe.com/oauth/token";

export function getStripeOAuthConfig() {
  const clientId = process.env.STRIPE_CLIENT_ID?.trim();
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const redirectUri = process.env.STRIPE_REDIRECT_URI?.trim();

  return { clientId, secretKey, redirectUri };
}

export function assertStripeOAuthConfig() {
  const config = getStripeOAuthConfig();
  const missing = [
    !config.clientId && "STRIPE_CLIENT_ID",
    !config.secretKey && "STRIPE_SECRET_KEY",
    !config.redirectUri && "STRIPE_REDIRECT_URI",
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
  }

  return config as {
    clientId: string;
    secretKey: string;
    redirectUri: string;
  };
}

export function getStripeClient(accessToken: string) {
  return {
    baseUrl: "https://api.stripe.com/v1",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
}
