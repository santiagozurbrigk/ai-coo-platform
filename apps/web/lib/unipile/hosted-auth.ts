import {
  getAppBaseUrl,
  normalizeUnipileApiUrl,
  UNIPILE_HOSTED_PROVIDERS,
  type UnipileProvider,
} from "./config";
import { unipileFetch } from "./client";
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
}): Promise<string> {
  const baseUrl = getAppBaseUrl();
  const expiresOn = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const notifyUrl = `${baseUrl}/api/integrations/unipile/webhook`;

  const proxyCountry = await getOrganizationProxyCountry(params.organizationId);
  const apiUrl = normalizeUnipileApiUrl(process.env.UNIPILE_DSN?.trim() ?? "");

  const body: Record<string, unknown> = {
    type: "create",
    providers: [UNIPILE_HOSTED_PROVIDERS[params.provider]],
    api_url: apiUrl,
    expiresOn,
    notify_url: notifyUrl,
    name: params.organizationId,
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

function mapUnipileAccountType(
  accountType: string | undefined
): UnipileProvider | null {
  const normalized = accountType?.trim().toUpperCase();
  if (normalized === UNIPILE_HOSTED_PROVIDERS.instagram) return "instagram";
  if (normalized === UNIPILE_HOSTED_PROVIDERS.whatsapp) return "whatsapp";
  return null;
}

export async function fetchUnipileAccount(accountId: string): Promise<{
  displayName: string | null;
  provider: UnipileProvider | null;
}> {
  try {
    const account = await unipileFetch<{
      name?: string;
      username?: string;
      type?: string;
      provider?: string;
      connection_params?: { im?: { phone_number?: string } };
    }>(`/api/v1/accounts/${encodeURIComponent(accountId)}`);

    const displayName =
      account.name?.trim() ||
      account.username?.trim() ||
      account.connection_params?.im?.phone_number?.trim() ||
      null;

    const provider = mapUnipileAccountType(account.type ?? account.provider);

    return { displayName, provider };
  } catch {
    return { displayName: null, provider: null };
  }
}

export async function disconnectUnipileAccount(accountId: string): Promise<void> {
  await unipileFetch(`/api/v1/accounts/${encodeURIComponent(accountId)}`, {
    method: "DELETE",
  });
}
