import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt, encrypt } from "@/lib/security/encryption";
import {
  assertMercadoPagoOAuthConfig,
  MP_OAUTH_TOKEN_URL,
} from "@/lib/mercadopago/config";

type MercadoPagoIntegrationRow = {
  organization_id: string;
  mp_user_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
  status: string;
};

type OAuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user_id?: number;
  public_key?: string;
  live_mode?: boolean;
  error?: string;
  message?: string;
};

const REFRESH_BUFFER_MS = 14 * 24 * 60 * 60 * 1000;

function isExpiringSoon(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() - Date.now() < REFRESH_BUFFER_MS;
}

async function exchangeRefreshToken(
  refreshToken: string
): Promise<OAuthTokenResponse> {
  const { clientId, clientSecret } = assertMercadoPagoOAuthConfig();

  const res = await fetch(MP_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  return (await res.json().catch(() => ({}))) as OAuthTokenResponse;
}

async function persistRefreshedTokens(
  organizationId: string,
  tokenData: OAuthTokenResponse,
  existingRefresh?: string | null
): Promise<void> {
  if (!tokenData.access_token) {
    throw new Error(tokenData.message ?? tokenData.error ?? "Refresh falló");
  }

  const expiresIn = Number(tokenData.expires_in ?? 15_552_000);
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const refreshToken = tokenData.refresh_token ?? existingRefresh ?? null;
  const now = new Date().toISOString();

  const admin = createAdminClient();
  const { error } = await admin
    .from("mercadopago_integrations")
    .update({
      access_token_encrypted: encrypt(tokenData.access_token),
      refresh_token_encrypted: refreshToken ? encrypt(refreshToken) : null,
      token_expires_at: tokenExpiresAt,
      public_key: tokenData.public_key ?? null,
      livemode: Boolean(tokenData.live_mode),
      status: "active",
      updated_at: now,
    })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) throw new Error(error.message);
}

export async function getActiveMercadoPagoCredentials(
  organizationId: string
): Promise<{ accessToken: string; mpUserId: string } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("mercadopago_integrations")
    .select(
      "organization_id, mp_user_id, access_token_encrypted, refresh_token_encrypted, token_expires_at, status"
    )
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .maybeSingle();

  if (!data?.access_token_encrypted) return null;

  const row = data as MercadoPagoIntegrationRow;

  try {
    let accessToken = decrypt(row.access_token_encrypted);

    if (isExpiringSoon(row.token_expires_at) && row.refresh_token_encrypted) {
      const refreshToken = decrypt(row.refresh_token_encrypted);
      const refreshed = await exchangeRefreshToken(refreshToken);
      await persistRefreshedTokens(organizationId, refreshed, refreshToken);
      accessToken = refreshed.access_token!;
    }

    return { accessToken, mpUserId: row.mp_user_id };
  } catch (err) {
    console.error("[mercadopago] token error:", err);
    await admin
      .from("mercadopago_integrations")
      .update({
        status: "error",
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);
    return null;
  }
}

export async function refreshAllMercadoPagoTokens(): Promise<{
  refreshed: number;
  failed: number;
}> {
  const admin = createAdminClient();
  const threshold = new Date(Date.now() + REFRESH_BUFFER_MS).toISOString();

  const { data: rows } = await admin
    .from("mercadopago_integrations")
    .select(
      "organization_id, refresh_token_encrypted, token_expires_at, status"
    )
    .eq("status", "active")
    .not("refresh_token_encrypted", "is", null)
    .lte("token_expires_at", threshold);

  let refreshed = 0;
  let failed = 0;

  for (const row of rows ?? []) {
    if (!row.refresh_token_encrypted) continue;
    try {
      const refreshToken = decrypt(row.refresh_token_encrypted);
      const tokenData = await exchangeRefreshToken(refreshToken);
      await persistRefreshedTokens(
        row.organization_id as string,
        tokenData,
        refreshToken
      );
      refreshed++;
    } catch (err) {
      failed++;
      console.error(
        `[mercadopago] refresh failed for org ${row.organization_id}:`,
        err
      );
    }
  }

  return { refreshed, failed };
}

export async function markMercadoPagoDisconnectedByMpUserId(
  mpUserId: string
): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  await admin
    .from("mercadopago_integrations")
    .update({ status: "disconnected", updated_at: now })
    .eq("mp_user_id", mpUserId)
    .eq("status", "active");
}
