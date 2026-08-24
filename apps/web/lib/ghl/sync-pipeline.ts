/**
 * Pipeline de sync GHL → closing_calls para una o todas las orgs.
 * Análogo a lib/calendly/sync-pipeline.ts.
 * Seguro para cron: nunca lanza, siempre devuelve resultado.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { listGHLAppointments } from "./client";
import { decryptGHLApiKey, getGHLIntegrationForOrg } from "./integration";
import { syncGHLAppointmentsForOrganization, type GHLSyncResult } from "./sync-appointments";

// Rango: últimos 90 días + próximos 90 días
function buildSyncRange() {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 90);
  const to = new Date(now);
  to.setDate(to.getDate() + 90);
  return {
    startTime: from.toISOString(),
    endTime: to.toISOString(),
  };
}

export async function syncGHLOrganizationSafe(
  organizationId: string
): Promise<GHLSyncResult & { organizationId: string }> {
  const empty = {
    organizationId,
    inserted: 0,
    updated: 0,
    skippedClosed: 0,
    skippedCancelled: 0,
    fetched: 0,
  };

  try {
    const row = await getGHLIntegrationForOrg(organizationId);
    if (!row?.default_calendar_id) return empty;

    const apiKey = decryptGHLApiKey(row.api_key_encrypted);
    const { startTime, endTime } = buildSyncRange();

    const appointments = await listGHLAppointments(
      apiKey,
      row.location_id,
      row.default_calendar_id,
      startTime,
      endTime
    );

    const admin = createAdminClient();
    const result = await syncGHLAppointmentsForOrganization(
      admin,
      organizationId,
      appointments
    );

    // Actualizar last_sync_at
    await admin
      .from("ghl_integrations")
      .update({ last_sync_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("organization_id", organizationId);

    console.info(
      `[ghl-sync] org=${organizationId} fetched=${result.fetched} inserted=${result.inserted} updated=${result.updated}`
    );

    return { organizationId, ...result };
  } catch (e) {
    console.error(`[ghl-sync] Error org=${organizationId}:`, e);
    return empty;
  }
}

export async function syncAllGHLOrganizationsSafe(): Promise<{
  synced: number;
  orgs: Array<GHLSyncResult & { organizationId: string }>;
  inserted: number;
  updated: number;
  fetched: number;
}> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("ghl_integrations")
    .select("organization_id")
    .not("default_calendar_id", "is", null);

  if (error) {
    console.error("[ghl-sync] Error listando orgs:", error);
    return { synced: 0, orgs: [], inserted: 0, updated: 0, fetched: 0 };
  }

  const orgIds = (data ?? []).map((r: { organization_id: string }) => r.organization_id);

  const results = await Promise.all(orgIds.map(syncGHLOrganizationSafe));

  return {
    synced: results.length,
    orgs: results,
    inserted: results.reduce((s, r) => s + r.inserted, 0),
    updated: results.reduce((s, r) => s + r.updated, 0),
    fetched: results.reduce((s, r) => s + r.fetched, 0),
  };
}
