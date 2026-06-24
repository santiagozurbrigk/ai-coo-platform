export const MP_OAUTH_AUTHORIZE_URL =
  "https://auth.mercadopago.com/authorization";
export const MP_OAUTH_TOKEN_URL = "https://api.mercadopago.com/oauth/token";
export const MP_API_BASE_URL = "https://api.mercadopago.com";

export function getMercadoPagoOAuthConfig() {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID?.trim();
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET?.trim();
  const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI?.trim();

  return { clientId, clientSecret, redirectUri };
}

export function assertMercadoPagoOAuthConfig() {
  const config = getMercadoPagoOAuthConfig();
  const missing = [
    !config.clientId && "MERCADOPAGO_CLIENT_ID",
    !config.clientSecret && "MERCADOPAGO_CLIENT_SECRET",
    !config.redirectUri && "MERCADOPAGO_REDIRECT_URI",
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
  }

  return config as {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
}
