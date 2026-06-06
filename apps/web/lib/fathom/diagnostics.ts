import { createAdminClient } from "@/lib/supabase/admin";

export type FathomIntegrationDiagnosticRow = {
  organization_id: string;
  status: string | null;
  has_key: boolean;
  key_length: number;
  last_sync_at: string | null;
};

export type FathomIntegrationDiagnostics = {
  totalRows: number;
  eligibleForSync: number;
  rows: FathomIntegrationDiagnosticRow[];
  queryError?: string;
};

function rowHasUsableApiKey(apiKey: string | null | undefined): boolean {
  return typeof apiKey === "string" && apiKey.trim().length > 0;
}

export async function getFathomIntegrationDiagnostics(): Promise<FathomIntegrationDiagnostics> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("fathom_integrations")
    .select("organization_id, status, api_key, last_sync_at");

  if (error) {
    console.error("[Fathom] Diagnostics query error:", error.message);
    return {
      totalRows: 0,
      eligibleForSync: 0,
      rows: [],
      queryError: error.message,
    };
  }

  const rows: FathomIntegrationDiagnosticRow[] = (data ?? []).map((row) => ({
    organization_id: row.organization_id,
    status: row.status ?? null,
    has_key: rowHasUsableApiKey(row.api_key),
    key_length: row.api_key?.trim().length ?? 0,
    last_sync_at: row.last_sync_at ?? null,
  }));

  const eligibleForSync = rows.filter(
    (r) => r.status === "connected" && r.has_key
  ).length;

  console.log("[Fathom] Orgs found (total rows):", rows.length);
  console.log("[Fathom] Orgs eligible for sync (connected + api_key):", eligibleForSync);
  for (const row of rows) {
    console.log("[Fathom] Integration row:", row);
  }

  return {
    totalRows: rows.length,
    eligibleForSync,
    rows,
    queryError: undefined,
  };
}

export function isEligibleFathomIntegration(row: {
  status?: string | null;
  api_key?: string | null;
}): boolean {
  return row.status === "connected" && rowHasUsableApiKey(row.api_key);
}

export async function listEligibleFathomOrganizationIds(): Promise<string[]> {
  const diagnostics = await getFathomIntegrationDiagnostics();
  if (diagnostics.queryError) {
    throw new Error(diagnostics.queryError);
  }

  if (diagnostics.eligibleForSync === 0) {
    console.log(
      "[Fathom] Early return: no orgs with status=connected and non-empty api_key"
    );
    return [];
  }

  return diagnostics.rows
    .filter((r) => r.status === "connected" && r.has_key)
    .map((r) => r.organization_id);
}
