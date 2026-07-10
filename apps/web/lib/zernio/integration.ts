import { createZernioClient, type ZernioClient } from "@/lib/zernio/client";
import { decrypt, encrypt } from "@/lib/security/encryption";
import { createAdminClient } from "@/lib/supabase/admin";

export type ZernioConnectedAccount = {
  accountId: string;
  platform: string;
  username?: string;
  avatarUrl?: string;
};

export type ZernioChannelStatus = {
  hasInstagram: boolean;
  hasWhatsapp: boolean;
};

export type ZernioIntegrationRow = {
  id: string;
  organization_id: string;
  zernio_profile_id: string;
  connected_accounts: ZernioConnectedAccount[];
  api_key: string | null;
  account_name: string | null;
  webhook_secret: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function storeApiKey(apiKey: string): string {
  try {
    return encrypt(apiKey);
  } catch {
    return apiKey;
  }
}

export function readStoredApiKey(stored: string): string {
  try {
    return decrypt(stored);
  } catch {
    return stored;
  }
}

export function getZernioChannelStatus(
  accounts: ZernioConnectedAccount[]
): ZernioChannelStatus {
  const platforms = new Set(
    accounts.map((account) => account.platform.toLowerCase())
  );
  return {
    hasInstagram: platforms.has("instagram"),
    hasWhatsapp: platforms.has("whatsapp"),
  };
}

export function formatZernioChannelsLabel(status: ZernioChannelStatus): string {
  const parts: string[] = [];
  parts.push(
    status.hasInstagram ? "Instagram Direct" : "Instagram: pendiente en Zernio"
  );
  parts.push(
    status.hasWhatsapp
      ? "WhatsApp"
      : "WhatsApp: no configurado en Zernio"
  );
  return parts.join(" · ");
}

export async function getZernioIntegrationForOrg(
  organizationId: string
): Promise<ZernioIntegrationRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("zernio_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    connected_accounts: (data.connected_accounts as ZernioConnectedAccount[]) ?? [],
    api_key: (data.api_key as string | null) ?? null,
    account_name: (data.account_name as string | null) ?? null,
  } as ZernioIntegrationRow;
}

export async function getZernioApiKeyForOrganization(
  organizationId: string
): Promise<string | null> {
  const row = await getZernioIntegrationForOrg(organizationId);
  if (row?.api_key) {
    return readStoredApiKey(row.api_key);
  }
  return process.env.ZERNIO_API_KEY?.trim() ?? null;
}

export async function getZernioClientForOrganization(
  organizationId: string
): Promise<ZernioClient> {
  const apiKey = await getZernioApiKeyForOrganization(organizationId);
  if (!apiKey) {
    throw new Error("Zernio no está conectado");
  }
  return createZernioClient(apiKey);
}

export { storeApiKey as encryptZernioApiKey };

export async function findZernioOrgByAccountId(
  accountId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("zernio_integrations")
    .select("organization_id, connected_accounts")
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const accounts = (row.connected_accounts as ZernioConnectedAccount[]) ?? [];
    if (accounts.some((a) => a.accountId === accountId)) {
      return row.organization_id as string;
    }
  }

  return null;
}

export async function findZernioOrgByProfileId(
  profileId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("zernio_integrations")
    .select("organization_id")
    .eq("zernio_profile_id", profileId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.organization_id as string | undefined) ?? null;
}

export function mapZernioAccountToConnected(account: {
  _id: string;
  platform: string;
  username?: string;
  displayName?: string;
  profilePictureUrl?: string;
}): ZernioConnectedAccount {
  return {
    accountId: account._id,
    platform: account.platform,
    username: account.username ?? account.displayName,
    avatarUrl: account.profilePictureUrl,
  };
}

export function resolveZernioAccountName(
  accounts: ZernioConnectedAccount[],
  fallback?: string | null
): string {
  const instagram = accounts.find(
    (account) => account.platform.toLowerCase() === "instagram"
  );
  const primary = instagram ?? accounts[0];
  return (
    primary?.username ??
    fallback ??
    "Cuenta Zernio"
  );
}

export function resolveZernioProfileId(
  accounts: Array<{ profileId?: string; profile?: string }>,
  organizationId: string
): string {
  return (
    accounts.find((account) => account.profileId)?.profileId ??
    accounts.find((account) => account.profile)?.profile ??
    organizationId
  );
}
