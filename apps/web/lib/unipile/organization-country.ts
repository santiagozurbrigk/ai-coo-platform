import { createAdminClient } from "@/lib/supabase/admin";
import type { UnipileProvider } from "./config";
import { isUnipileProxyCountryCode } from "./proxy-countries";

export async function getOrganizationProxyCountry(
  organizationId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("country")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const country = (data?.country as string | null)?.trim().toLowerCase() ?? "";
  if (!country || !isUnipileProxyCountryCode(country)) {
    return null;
  }

  return country;
}

/**
 * Config de proxy automático para Hosted Auth (Unipile).
 * @see https://developer.unipile.com/v2.0/docs/proxys — `config.{provider}.auto_proxy_config.country`
 */
export function buildUnipileHostedAuthProxyConfig(
  provider: UnipileProvider,
  country: string
): Record<string, unknown> {
  return {
    config: {
      [provider]: {
        auto_proxy_config: {
          country,
        },
      },
    },
  };
}
