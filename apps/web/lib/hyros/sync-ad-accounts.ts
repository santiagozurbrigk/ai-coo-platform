/**
 * lib/hyros/sync-ad-accounts.ts
 *
 * Trae las cuentas publicitarias conectadas a Hyros y las guarda.
 *
 * No es un lujo: el reporte de atribución **exige** el parámetro `ids`. Sin este
 * catálogo no se puede pedir ningún número.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { listHyrosAdAccounts } from "./client";
import { getHyrosCredentialsForOrg } from "./integration";

export type HyrosAdAccountSyncResult = {
  organizationId: string;
  adAccounts: number;
  skipped: number;
  error?: string;
};

export async function syncHyrosAdAccountsForOrg(
  organizationId: string
): Promise<HyrosAdAccountSyncResult> {
  const empty: HyrosAdAccountSyncResult = { organizationId, adAccounts: 0, skipped: 0 };

  try {
    const credentials = await getHyrosCredentialsForOrg(organizationId);
    if (!credentials) return { ...empty, error: "Hyros no configurado" };

    const accounts = await listHyrosAdAccounts(credentials);
    const admin = createAdminClient();
    const now = new Date().toISOString();

    let skipped = 0;
    const rows = accounts.flatMap((account) => {
      if (!account.id) {
        skipped += 1;
        return [];
      }
      return [
        {
          organization_id: organizationId,
          external_id: account.id,
          name: account.name ?? null,
          account_type: account.type ?? null,
          raw: account,
          synced_at: now,
        },
      ];
    });

    if (rows.length) {
      const { error } = await admin
        .from("hyros_ad_accounts")
        // `is_active` no va en el upsert: es una decisión del usuario sobre qué
        // cuentas entran en los totales, no un dato de la API.
        .upsert(rows, { onConflict: "organization_id,external_id" });
      if (error) return { ...empty, skipped, error: error.message };
    }

    await admin
      .from("hyros_integrations")
      .update({ ad_accounts_synced_at: now, last_error: null })
      .eq("organization_id", organizationId);

    return { organizationId, adAccounts: rows.length, skipped };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    const admin = createAdminClient();
    await admin
      .from("hyros_integrations")
      .update({ last_error: message })
      .eq("organization_id", organizationId);
    return { ...empty, error: message };
  }
}
