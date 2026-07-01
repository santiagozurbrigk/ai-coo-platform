import {
  getAppBaseUrl,
  UNIPILE_HOSTED_PROVIDERS,
  type UnipileProvider,
} from "./config";
import { unipileFetch } from "./client";
import { encodeUnipileHostedName } from "./integration";
import {
  buildUnipileHostedAuthProxyConfig,
  getOrganizationProxyCountry,
} from "./organization-country";

type HostedAuthResponse = {
  url?: string;
  object?: string;
};

export async function createUnipileHostedAuthLink(params: {
  organizationId: string;
  provider: UnipileProvider;
  webhookSecret?: string;
}): Promise<string> {
  const baseUrl = getAppBaseUrl();
  const expiresOn = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const notifySecret = params.webhookSecret?.trim();
  const notifyUrl = notifySecret
    ? `${baseUrl}/api/integrations/unipile/callback?secret=${encodeURIComponent(notifySecret)}`
    : `${baseUrl}/api/integrations/unipile/callback`;

  const proxyCountry = await getOrganizationProxyCountry(params.organizationId);

  const body: Record<string, unknown> = {
    type: "create",
    providers: [UNIPILE_HOSTED_PROVIDERS[params.provider]],
    api_url: process.env.UNIPILE_DSN?.trim(),
    expiresOn,
    notify_url: notifyUrl,
    name: encodeUnipileHostedName(params.organizationId, params.provider),
    success_redirect_url: `${baseUrl}/integrations?unipile=success&provider=${params.provider}`,
    failure_redirect_url: `${baseUrl}/integrations?unipile=error&provider=${params.provider}`,
  };

  if (proxyCountry) {
    Object.assign(
      body,
      buildUnipileHostedAuthProxyConfig(params.provider, proxyCountry)
    );
  }

  const response = await unipileFetch<HostedAuthResponse>(
    "/api/v1/hosted/accounts/link",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

  if (!response.url) {
    throw new Error("Unipile no devolvió URL de autorización");
  }

  return response.url;
}

export async function fetchUnipileAccount(accountId: string): Promise<{
  displayName: string | null;
}> {
  try {
    const account = await unipileFetch<{
      name?: string;
      username?: string;
      connection_params?: { im?: { phone_number?: string } };
    }>(`/api/v1/accounts/${encodeURIComponent(accountId)}`);

    const displayName =
      account.name?.trim() ||
      account.username?.trim() ||
      account.connection_params?.im?.phone_number?.trim() ||
      null;

    return { displayName };
  } catch {
    return { displayName: null };
  }
}

export async function disconnectUnipileAccount(accountId: string): Promise<void> {
  await unipileFetch(`/api/v1/accounts/${encodeURIComponent(accountId)}`, {
    method: "DELETE",
  });
}
