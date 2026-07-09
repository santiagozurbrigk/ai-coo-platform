import { createAdminClient } from "@/lib/supabase/admin";

export type ZernioConnectedAccount = {
  accountId: string;
  platform: string;
  username?: string;
  avatarUrl?: string;
};

export type ZernioIntegrationRow = {
  id: string;
  organization_id: string;
  zernio_profile_id: string;
  connected_accounts: ZernioConnectedAccount[];
  webhook_secret: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

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
  } as ZernioIntegrationRow;
}

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
