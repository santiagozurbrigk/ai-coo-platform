import { applyClientMatchToCall } from "@/lib/fathom/apply-call-match";
import { isManualFathomLink } from "@/lib/fathom/client-matcher";
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
    // ⭐ Las señales con las que se clasifica. Venían en la respuesta de la API
    // desde siempre y el parser las descartaba; sin ellas, lo único que quedaba
    // para decidir qué era una llamada era el título, vacío en el 86% de los
    // casos.
    calendar_invitees: meeting.calendar_invitees ?? [],
    meeting_type: meeting.meeting_type ?? null,
    status: "pending" as const,
    processed_after: processedAfter,
    association_candidates: [] as unknown[],
    ai_next_steps: [] as string[],
    ai_problems_detected: [] as string[],
  };
}

/**
 * ⭐ El único upsert de llamadas de Fathom.
 *
 * Lo usan el sync por organización y el sync por miembro. Antes eran dos
 * implementaciones distintas del mismo guardado, y la del miembro quedó atrás:
 * no guardaba `calendar_invitees` —la señal de la que cuelga toda la
 * identificación— y devolvía a "pendiente" llamadas ya procesadas en cada
 * corrida.
 */
export async function upsertFathomCallFromMeeting(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  meeting: FathomMeetingRecord
): Promise<boolean> {
  const recordingId = meeting.recording_id ?? meeting.id;
  console.log("[Fathom:sync] Upserting meeting:", recordingId);

  const row = buildFathomCallRow(organizationId, meeting);
  const callTitle = row.title;

  const { data: existing, error: existingError } = await admin
    .from("fathom_calls")
    .select("id, client_id, association_confidence, status")
    .eq("organization_id", organizationId)
    .eq("fathom_call_id", row.fathom_call_id)
    .maybeSingle();

  if (existingError) {
    console.error("[Fathom:sync] Existing call lookup error:", existingError.message);
    return false;
  }

  const manualLink = isManualFathomLink(
    existing?.client_id,
    existing?.association_confidence
  );

  const syncFields = {
    title: row.title,
    raw_title: row.raw_title,
    fathom_url: row.fathom_url,
    call_date: row.call_date,
    duration_seconds: row.duration_seconds,
    transcript: row.transcript,
    // Se refrescan en cada sync: el tipo se puede asignar en Fathom después de
    // la llamada, igual que el título.
    calendar_invitees: row.calendar_invitees,
    meeting_type: row.meeting_type,
  };

  let callId: string;

  if (existing) {
    const { error } = await admin
      .from("fathom_calls")
      .update(syncFields)
      .eq("id", existing.id);

    if (error) {
      console.error("[Fathom:sync] UPDATE ERROR:", JSON.stringify(error));
      console.log("[Fathom:sync] Upsert result:", error.message);
      return false;
    }

    callId = existing.id;
    console.log("[Fathom:sync] Upsert result: OK (updated title/metadata)");
  } else {
    const { data, error } = await admin
      .from("fathom_calls")
      .insert({
        ...syncFields,
        organization_id: organizationId,
        fathom_call_id: row.fathom_call_id,
        status: "pending",
        processed_after: row.processed_after,
        association_candidates: row.association_candidates,
        ai_next_steps: row.ai_next_steps,
        ai_problems_detected: row.ai_problems_detected,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Fathom:sync] INSERT ERROR:", JSON.stringify(error));
      console.log("[Fathom:sync] Upsert result:", error.message);
      return false;
    }

    callId = data.id;
    console.log("[Fathom:sync] Upsert result: OK (inserted)");
  }

  if (!manualLink) {
    await applyClientMatchToCall(admin, callId, organizationId, callTitle);
  } else {
    console.log("[Fathom:sync] Skipping auto-match — manual link preserved", {
      callId,
      clientId: existing?.client_id,
    });
  }

  console.log("[Fathom:sync] Inserted:", recordingId, callTitle);
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
      hasApiKey: false,
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
