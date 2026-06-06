import { FathomApiError, listFathomMeetings, type FathomMeetingRecord } from "@/lib/fathom/api";
import {
  getFathomIntegrationDiagnostics,
} from "@/lib/fathom/diagnostics";
import { createAdminClient } from "@/lib/supabase/admin";

const INITIAL_SYNC_LOOKBACK_DAYS = 90;

function buildFathomCallRow(organizationId: string, meeting: FathomMeetingRecord) {
  const recordingStart =
    meeting.recording_start_time ?? meeting.scheduled_start_time ?? meeting.callDate;
  const recordingEnd = meeting.recording_end_time;

  let durationSeconds: number | null = meeting.durationSeconds ?? null;
  if (recordingEnd && recordingStart) {
    durationSeconds = Math.round(
      (new Date(recordingEnd).getTime() - new Date(recordingStart).getTime()) / 1000
    );
  }

  let transcript: string | null = null;
  if (meeting.transcriptRaw != null) {
    transcript =
      typeof meeting.transcriptRaw === "string"
        ? meeting.transcriptRaw
        : JSON.stringify(meeting.transcriptRaw);
  } else if (meeting.transcript) {
    transcript = meeting.transcript;
  }

  const processedAfter = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return {
    organization_id: organizationId,
    fathom_call_id: String(meeting.recording_id ?? meeting.id),
    title: meeting.title || meeting.meeting_title || "Sin título",
    raw_title: meeting.meeting_title || meeting.title,
    fathom_url: meeting.url ?? null,
    call_date: recordingStart ?? new Date().toISOString(),
    duration_seconds: durationSeconds,
    transcript,
    status: "pending" as const,
    processed_after: processedAfter,
    association_candidates: [] as unknown[],
    ai_next_steps: [] as string[],
    ai_problems_detected: [] as string[],
  };
}

async function upsertFathomCallFromMeeting(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  meeting: FathomMeetingRecord
): Promise<boolean> {
  const recordingId = meeting.recording_id ?? meeting.id;
  console.log("[Fathom:sync] Upserting meeting:", recordingId);

  const row = buildFathomCallRow(organizationId, meeting);

  const { error } = await admin.from("fathom_calls").upsert(row, {
    onConflict: "organization_id,fathom_call_id",
  });

  if (error) {
    console.error("[Fathom:sync] INSERT ERROR:", JSON.stringify(error));
    console.log("[Fathom:sync] Upsert result:", error.message);
    return false;
  }

  console.log("[Fathom:sync] Upsert result:", "OK");
  console.log("[Fathom:sync] Inserted:", recordingId, row.title);
  return true;
}

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

  const lookbackIso = new Date(
    Date.now() - INITIAL_SYNC_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { count: existingCallsCount } = await admin
    .from("fathom_calls")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  // Incremental solo si ya hay calls ingestadas; si no, lookback completo.
  // Evita el caso connect→last_sync_at=now→created_after excluye todo.
  const useIncremental =
    Boolean(integration.last_sync_at) && (existingCallsCount ?? 0) > 0;
  const createdAfter = useIncremental ? integration.last_sync_at! : lookbackIso;

  console.log("[Fathom:sync] Date filter:", {
    organizationId,
    createdAfter,
    last_sync_at: integration.last_sync_at,
    existingCalls: existingCallsCount ?? 0,
    mode: useIncremental ? "incremental" : "lookback",
    lookbackDays: INITIAL_SYNC_LOOKBACK_DAYS,
  });

  console.log("[Fathom:sync] Calling Fathom API...", {
    organizationId,
    createdAfter,
    apiKeyLength: integration.api_key.trim().length,
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
    console.error("[Fathom:sync] listFathomMeetings failed:", e);
    if (e instanceof FathomApiError) throw new Error(e.message);
    throw e;
  }

  console.log("[Fathom:sync] Meetings received:", meetings?.length);

  if (!meetings?.length) {
    console.log(
      "[Fathom:sync] No meetings to upsert — insert loop skipped (check Date filter or mapFathomMeeting)"
    );
  }

  let ingested = 0;
  for (const meeting of meetings) {
    console.log("[Fathom] Inserting call:", {
      organization_id: organizationId,
      title: meeting.title,
      recording_id: meeting.recording_id ?? meeting.id,
      call_date:
        meeting.recording_start_time ??
        meeting.scheduled_start_time ??
        meeting.callDate,
    });
    const ok = await upsertFathomCallFromMeeting(admin, organizationId, meeting);
    if (ok) ingested++;
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
  orgResults: Array<{
    organizationId: string;
    ingested: number;
    error?: string;
  }>;
}> {
  console.log("[Fathom:sync] syncAllFathomIntegrations called");

  const diagnostics = await getFathomIntegrationDiagnostics();
  if (diagnostics.queryError) {
    throw new Error(diagnostics.queryError);
  }

  const orgs = diagnostics.rows.filter(
    (r) => r.status === "connected" && r.has_key
  );
  const organizationIds = orgs.map((r) => r.organization_id);

  console.log(
    "[Fathom:sync] Orgs from DB:",
    orgs.length,
    orgs.map((o) => o.organization_id)
  );

  if (organizationIds.length === 0) {
    console.log("[Fathom:sync] Early return: zero eligible orgs, skipping all fetches");
    return { organizations: 0, ingested: 0, skippedOrgs: [], orgResults: [] };
  }

  let ingested = 0;
  const skippedOrgs: string[] = [];
  const orgResults: Array<{
    organizationId: string;
    ingested: number;
    error?: string;
  }> = [];

  for (const organizationId of organizationIds) {
    console.log("[Fathom:sync] Processing org:", organizationId);
    try {
      const orgIngested = await syncFathomMeetingsForOrganization(organizationId, {
        debug: options?.debug,
      });
      ingested += orgIngested;
      orgResults.push({ organizationId, ingested: orgIngested });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error("[Fathom:sync] Org sync failed:", organizationId, error, e);
      skippedOrgs.push(organizationId);
      orgResults.push({ organizationId, ingested: 0, error });
    }
  }

  const result = {
    organizations: organizationIds.length,
    ingested,
    skippedOrgs,
    orgResults,
  };
  console.log("[Fathom:sync] syncAllFathomIntegrations done:", JSON.stringify(result));
  return result;
}
