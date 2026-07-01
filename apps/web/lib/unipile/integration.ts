import { createAdminClient } from "@/lib/supabase/admin";
import type { UnipileProvider } from "./config";

export type UnipileIntegrationRow = {
  id: string;
  organization_id: string;
  unipile_account_id: string;
  provider: UnipileProvider;
  display_name: string | null;
  status: "connected" | "disconnected" | "error";
  connected_at: string;
};

export async function getUnipileIntegrationByAccountId(
  accountId: string
): Promise<UnipileIntegrationRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("unipile_integrations")
    .select("*")
    .eq("unipile_account_id", accountId)
    .eq("status", "connected")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as UnipileIntegrationRow | null) ?? null;
}

export async function getUnipileIntegrationForOrg(
  organizationId: string,
  provider: UnipileProvider
): Promise<UnipileIntegrationRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("unipile_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("provider", provider)
    .eq("status", "connected")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as UnipileIntegrationRow | null) ?? null;
}

export function encodeUnipileHostedName(
  organizationId: string,
  provider: UnipileProvider
): string {
  return `org:${organizationId}:provider:${provider}`;
}

export function decodeUnipileHostedName(name: string): {
  organizationId: string;
  provider: UnipileProvider;
} | null {
  const match = /^org:([^:]+):provider:(instagram|whatsapp)$/.exec(name.trim());
  if (!match) return null;
  return {
    organizationId: match[1],
    provider: match[2] as UnipileProvider,
  };
}
