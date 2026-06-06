import { FathomApiError, listFathomMeetings } from "@/lib/fathom/api";
import {
  getFathomIntegrationDiagnostics,
} from "@/lib/fathom/diagnostics";
import { ingestFathomWebhookCall } from "@/lib/fathom/process-call";
import { createAdminClient } from "@/lib/supabase/admin";

const INITIAL_SYNC_LOOKBACK_DAYS = 90;

export async function syncFathomMeetingsForOrganization(
  organizationId: string,
  options?: { debug?: boolean }
): Promise<number> {
  console.log("[Fathom] syncFathomMeetingsForOrganization start:", organizationId);

  const admin = createAdminClient();
  const { data: integration, error } = await admin
    .from("fathom_integrations")
    .select("api_key, last_sync_at, status")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("[Fathom] Early return: DB error loading integration:", error.message);
    throw new Error(error.message);
  }

  if (!integration) {
    console.log("[Fathom] Early return: no fathom_integrations row for org", organizationId);
    throw new Error("Fathom no está conectado para esta organización.");
  }

  if (!integration.api_key?.trim()) {
    console.log("[Fathom] Early return: api_key null or empty for org", {
      organizationId,
      status: integration.status,
      apiKeyLength: integration.api_key?.length ?? 0,
    });
    throw new Error("Fathom no tiene API key configurada.");
  }

  if (integration.status !== "connected") {
    console.log("[Fathom] Early return: status is not connected", {
      organizationId,
      status: integration.status,
    });
    throw new Error("Fathom no está conectado para esta organización.");
  }

  const createdAfter =
    integration.last_sync_at ??
    new Date(
      Date.now() - INITIAL_SYNC_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

  console.log("[Fathom] Calling listFathomMeetings (external fetch)", {
    organizationId,
    createdAfter,
    apiKeyLength: integration.api_key.trim().length,
    apiKeyPrefix: integration.api_key.trim().slice(0, 8),
  });

  let meetings;
  try {
    meetings = await listFathomMeetings(integration.api_key.trim(), {
      createdAfter,
      includeTranscript: true,
      debug: options?.debug,
      debugContext: `sync:${organizationId.slice(0, 8)}`,
    });
  } catch (e) {
    console.error("[Fathom] listFathomMeetings failed:", e);
    if (e instanceof FathomApiError) throw new Error(e.message);
    throw e;
  }

  console.log("[Fathom] listFathomMeetings returned", meetings.length, "meetings");

  let ingested = 0;
  for (const meeting of meetings) {
    console.log("[Fathom] Inserting call:", {
      organization_id: organizationId,
      title: meeting.title,
      recording_id: meeting.id,
      call_date: meeting.callDate,
    });
    try {
      await ingestFathomWebhookCall({
        organizationId,
        fathomCallId: meeting.id,
        title: meeting.title,
        transcript: meeting.transcript,
        summary: meeting.summary,
        durationSeconds: meeting.durationSeconds,
        callDate: meeting.callDate,
        fathomUrl: meeting.url,
      });
      ingested++;
    } catch (e) {
      console.error("[Fathom] ingest failed for meeting", meeting.id, e);
    }
  }

  console.log("[Fathom] sync complete:", { organizationId, ingested, total: meetings.length });

  if (ingested > 0) {
    await admin
      .from("fathom_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("organization_id", organizationId);
  } else {
    console.log("[Fathom] last_sync_at unchanged — no calls ingested");
  }

  return ingested;
}

export async function syncAllFathomIntegrations(options?: {
  debug?: boolean;
}): Promise<{
  organizations: number;
  ingested: number;
  skippedOrgs: string[];
}> {
  const diagnostics = await getFathomIntegrationDiagnostics();
  if (diagnostics.queryError) {
    throw new Error(diagnostics.queryError);
  }

  const organizationIds = diagnostics.rows
    .filter((r) => r.status === "connected" && r.has_key)
    .map((r) => r.organization_id);

  console.log("[Fathom] syncAllFathomIntegrations orgs to sync:", organizationIds.length);

  if (organizationIds.length === 0) {
    console.log("[Fathom] Early return: syncAll — zero eligible orgs, skipping all fetches");
    return { organizations: 0, ingested: 0, skippedOrgs: [] };
  }

  let ingested = 0;
  const skippedOrgs: string[] = [];

  for (const organizationId of organizationIds) {
    try {
      ingested += await syncFathomMeetingsForOrganization(organizationId, {
        debug: options?.debug,
      });
    } catch (e) {
      console.error("[syncAllFathomIntegrations]", organizationId, e);
      skippedOrgs.push(organizationId);
    }
  }

  return { organizations: organizationIds.length, ingested, skippedOrgs };
}
