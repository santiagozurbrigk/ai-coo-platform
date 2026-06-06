import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/integrations/cron-auth";
import { probeFathomListEndpoint } from "@/lib/fathom/api";
import { processPendingFathomCalls } from "@/lib/fathom/process-call";
import { syncAllFathomIntegrations } from "@/lib/fathom/sync";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Cron Fathom:
 * 1. Sync desde API (GET /external/v1/meetings — documentado en developers.fathom.ai)
 * 2. Procesar llamadas pending cuyo delay de 30 min ya venció
 */
async function runFathomProcess(request: Request) {
  const unauthorized = assertCronAuthorized(request);
  if (unauthorized) return unauthorized;

  const admin = createAdminClient();
  const { data: sampleIntegration } = await admin
    .from("fathom_integrations")
    .select("organization_id, api_key, status")
    .eq("status", "connected")
    .not("api_key", "is", null)
    .limit(1)
    .maybeSingle();

  let probe: Awaited<ReturnType<typeof probeFathomListEndpoint>> | null = null;

  if (sampleIntegration?.api_key) {
    console.log("[Fathom:process] Probing documented list endpoint for org", {
      organizationId: sampleIntegration.organization_id,
      apiKeyLength: sampleIntegration.api_key.length,
      apiKeyPrefix: sampleIntegration.api_key.slice(0, 8),
    });
    probe = await probeFathomListEndpoint(
      sampleIntegration.api_key,
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
    console.log(
      "[Fathom:process] Sin integración conectada con api_key — omitiendo probe"
    );
  }

  let sync = { organizations: 0, ingested: 0 };
  try {
    sync = await syncAllFathomIntegrations({ debug: true });
    console.log("[Fathom:process] Sync complete:", sync);
  } catch (e) {
    console.error("[Fathom:process] Sync error:", e);
  }

  const processed = await processPendingFathomCalls(50);
  console.log("[Fathom:process] Pending processed:", processed);

  return NextResponse.json({
    ok: true,
    processed,
    sync,
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
