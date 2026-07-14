import { createAdminClient } from "@/lib/supabase/admin";

type GoogleTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

function tokenExpiresAt(expiresIn?: number): string | null {
  return expiresIn
    ? new Date(Date.now() + expiresIn * 1000).toISOString()
    : null;
}

/** Guarda tokens en Forms y YouTube (misma conexión Google unificada). */
export async function persistUnifiedGoogleTokens(
  organizationId: string,
  tokens: GoogleTokens
): Promise<{ formsError?: string; youtubeError?: string }> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const base = {
    organization_id: organizationId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    token_expires_at: tokenExpiresAt(tokens.expires_in),
    granted_scopes: tokens.scope ?? null,
    status: "connected",
    last_sync_at: now,
  };

  const [formsRes, youtubeRes] = await Promise.all([
    admin.from("google_forms_integrations").upsert(base, {
      onConflict: "organization_id",
    }),
    admin.from("youtube_integrations").upsert(base, {
      onConflict: "organization_id",
    }),
  ]);

  return {
    formsError: formsRes.error?.message,
    youtubeError: youtubeRes.error?.message,
  };
}
