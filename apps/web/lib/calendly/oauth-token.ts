import { createAdminClient } from "@/lib/supabase/admin";

const NO_WEBHOOK_SIGNING_KEY = "__no_webhook__";

export { NO_WEBHOOK_SIGNING_KEY };

type CalendlyIntegrationRow = {
  organization_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  calendly_org_uri: string | null;
  webhook_subscription_uri: string | null;
  webhook_signing_key: string;
};

function isWebhookPlanDenied(details: unknown): boolean {
  if (!details || typeof details !== "object") return false;
  const d = details as Record<string, unknown>;
  const title = String(d.title ?? "").toLowerCase();
  const message = String(d.message ?? "").toLowerCase();
  return (
    title.includes("permission") ||
    message.includes("upgrade") ||
    message.includes("standard")
  );
}

export function isCalendlyWebhookUnavailable(signingKey: string | null | undefined): boolean {
  return !signingKey || signingKey === NO_WEBHOOK_SIGNING_KEY;
}

export function isCalendlyWebhookPlanError(details: unknown): boolean {
  return isWebhookPlanDenied(details);
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const clientId = process.env.CALENDLY_CLIENT_ID;
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET;
  const tokenUrl =
    process.env.CALENDLY_AUTH_TOKEN ?? "https://auth.calendly.com/oauth/token";

  if (!clientId || !clientSecret) {
    throw new Error("Faltan CALENDLY_CLIENT_ID / CALENDLY_CLIENT_SECRET");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const json = await resp.json().catch(() => null);
  if (!resp.ok || !json?.access_token) {
    throw new Error(
      json?.message ?? json?.error ?? "No se pudo renovar el token de Calendly"
    );
  }

  return {
    access_token: String(json.access_token),
    refresh_token: String(json.refresh_token ?? refreshToken),
    expires_in: Number(json.expires_in ?? 7200),
  };
}

export async function getCalendlyIntegrationForOrganization(
  organizationId: string
): Promise<CalendlyIntegrationRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("calendly_integrations")
    .select(
      "organization_id, access_token, refresh_token, token_expires_at, calendly_org_uri, webhook_subscription_uri, webhook_signing_key"
    )
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CalendlyIntegrationRow | null) ?? null;
}

/** Devuelve access token válido; renueva y persiste si expiró. */
export async function getValidCalendlyAccessToken(
  organizationId: string
): Promise<{ accessToken: string; orgUri: string; webhookEnabled: boolean }> {
  const row = await getCalendlyIntegrationForOrganization(organizationId);
  if (!row?.access_token) {
    throw new Error("Calendly no está conectado para esta organización.");
  }
  if (!row.calendly_org_uri) {
    throw new Error("Falta calendly_org_uri en la integración.");
  }

  const expiresAt = row.token_expires_at
    ? new Date(row.token_expires_at).getTime()
    : 0;
  const needsRefresh = !expiresAt || expiresAt < Date.now() + 60_000;

  let accessToken = row.access_token;
  if (needsRefresh && row.refresh_token) {
    const refreshed = await refreshAccessToken(row.refresh_token);
    accessToken = refreshed.access_token;
    const tokenExpiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000
    ).toISOString();

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("calendly_integrations")
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
  }

  return {
    accessToken,
    orgUri: row.calendly_org_uri,
    webhookEnabled: !isCalendlyWebhookUnavailable(row.webhook_signing_key),
  };
}
