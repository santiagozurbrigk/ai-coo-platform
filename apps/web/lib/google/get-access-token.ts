import { createAdminClient } from "@/lib/supabase/admin";
import { refreshGoogleAccessToken } from "@/lib/google/refresh-token";

type GoogleIntegrationRow = {
  organization_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
};

async function resolveAccessToken(
  integration: GoogleIntegrationRow
): Promise<string | null> {
  if (!integration.access_token) return null;

  const expiresAt = integration.token_expires_at
    ? new Date(integration.token_expires_at).getTime()
    : null;

  if (
    expiresAt &&
    expiresAt < Date.now() + 60_000 &&
    integration.refresh_token
  ) {
    const refreshed = await refreshGoogleAccessToken(integration.refresh_token);
    if (!refreshed) return integration.access_token;

    const admin = createAdminClient();
    await admin
      .from("google_forms_integrations")
      .update({
        access_token: refreshed.access_token,
        token_expires_at: refreshed.expires_in
          ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
          : null,
      })
      .eq("organization_id", integration.organization_id);

    return refreshed.access_token;
  }

  return integration.access_token;
}

/** Token OAuth de Google (Forms/YouTube/Drive) para la org, con refresh automático. */
export async function getGoogleAccessTokenForOrganization(
  organizationId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("google_forms_integrations")
    .select("organization_id, access_token, refresh_token, token_expires_at")
    .eq("organization_id", organizationId)
    .eq("status", "connected")
    .maybeSingle();

  if (!data?.access_token) return null;
  return resolveAccessToken(data as GoogleIntegrationRow);
}
