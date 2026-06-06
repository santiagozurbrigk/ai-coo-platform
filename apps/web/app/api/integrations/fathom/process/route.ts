import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import { probeFathomListEndpoint } from "@/lib/fathom/api";
import { getFathomIntegrationDiagnostics } from "@/lib/fathom/diagnostics";
import { processPendingFathomCalls } from "@/lib/fathom/process-call";
import { syncAllFathomIntegrations } from "@/lib/fathom/sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Cron Fathom:
 * 1. Sync desde API (GET /external/v1/meetings — documentado en developers.fathom.ai)
 * 2. Procesar llamadas pending cuyo delay de 30 min ya venció
 */
async function runFathomProcess(request: Request) {
  console.log("[Fathom:process] START - version 3");

  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) {
    console.log("[Fathom:process] Early return: unauthorized (CRON_SECRET mismatch)");
    return unauthorized;
  }

  console.log("[Fathom:process] Auth passed, starting sync...", {
    method: request.method,
    hasCronSecret: Boolean(process.env.CRON_SECRET?.trim()),
    supabaseConfigured: isSupabaseConfigured(),
  });

  if (!isSupabaseConfigured()) {
    console.log("[Fathom:process] Early return: Supabase not configured");
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  let adminOk = false;
  try {
    createAdminClient();
    adminOk = true;
  } catch (e) {
    console.error("[Fathom:process] Early return: admin client failed:", e);
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY no configurado." },
      { status: 500 }
    );
  }

  console.log("[Fathom:process] Admin client OK:", adminOk);

  const diagnostics = await getFathomIntegrationDiagnostics();

  const admin = createAdminClient();
  const { data: sampleIntegration, error: sampleError } = await admin
    .from("fathom_integrations")
    .select("organization_id, api_key, status")
    .eq("status", "connected")
    .not("api_key", "is", null)
    .neq("api_key", "")
    .limit(1)
    .maybeSingle();

  if (sampleError) {
    console.error("[Fathom:process] Sample integration query error:", sampleError.message);
  }

  let probe: Awaited<ReturnType<typeof probeFathomListEndpoint>> | null = null;

  if (sampleIntegration?.api_key?.trim()) {
    console.log("[Fathom:process] Probing documented list endpoint for org", {
      organizationId: sampleIntegration.organization_id,
      apiKeyLength: sampleIntegration.api_key.trim().length,
      apiKeyPrefix: sampleIntegration.api_key.trim().slice(0, 8),
    });
    probe = await probeFathomListEndpoint(
      sampleIntegration.api_key.trim(),
      "process-probe"
    );
    console.log("[Fathom:process] Probe summary:", {
      endpoint: probe.endpoint,
      status: probe.status,
      itemCount: probe.itemCount,
      topLevelKeys: probe.topLevelKeys,
      nextCursor: probe.nextCursor,
    });
  } else {
    console.log("[Fathom:process] Early return: probe skipped — no connected org with api_key", {
      sampleFound: Boolean(sampleIntegration),
      sampleStatus: sampleIntegration?.status,
      sampleKeyLength: sampleIntegration?.api_key?.length ?? 0,
      diagnostics,
    });
  }

  let sync: Awaited<ReturnType<typeof syncAllFathomIntegrations>> = {
    organizations: 0,
    ingested: 0,
    skippedOrgs: [],
    orgResults: [],
  };
  let syncError: string | undefined;

  try {
    sync = await syncAllFathomIntegrations({ debug: true });
    console.log("[Fathom:process] Sync result:", JSON.stringify(sync));
  } catch (e) {
    syncError = e instanceof Error ? e.message : String(e);
    console.error("[Fathom:process] Sync error:", syncError, e);
  }

  const processed = await processPendingFathomCalls(50);
  console.log("[Fathom:process] Pending processed:", processed);

  return NextResponse.json({
    ok: true,
    version: 3,
    processed,
    sync,
    syncError: syncError ?? null,
    diagnostics,
    probe: probe
      ? {
          endpoint: probe.endpoint,
          status: probe.status,
          itemCount: probe.itemCount,
          topLevelKeys: probe.topLevelKeys,
          nextCursor: probe.nextCursor,
          rawPreview: probe.rawPreview,
        }
      : null,
  });
}

export async function POST(request: Request) {
  return runFathomProcess(request);
}

export async function GET(request: Request) {
  return runFathomProcess(request);
}
