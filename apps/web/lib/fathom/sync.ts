import { FathomApiError, listFathomMeetings } from "@/lib/fathom/api";
import { ingestFathomWebhookCall } from "@/lib/fathom/process-call";
import { createAdminClient } from "@/lib/supabase/admin";

const INITIAL_SYNC_LOOKBACK_DAYS = 90;

export async function syncFathomMeetingsForOrganization(
  organizationId: string
): Promise<number> {
  const admin = createAdminClient();
  const { data: integration, error } = await admin
    .from("fathom_integrations")
    .select("api_key, last_sync_at, status")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!integration?.api_key || integration.status !== "connected") {
    throw new Error("Fathom no está conectado para esta organización.");
  }

  const createdAfter =
    integration.last_sync_at ??
    new Date(
      Date.now() - INITIAL_SYNC_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

  let meetings;
  try {
    meetings = await listFathomMeetings(integration.api_key, {
      createdAfter,
      includeTranscript: true,
    });
  } catch (e) {
    if (e instanceof FathomApiError) throw new Error(e.message);
    throw e;
  }

  let ingested = 0;
  for (const meeting of meetings) {
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
  }

  await admin
    .from("fathom_integrations")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("organization_id", organizationId);

  return ingested;
}

export async function syncAllFathomIntegrations(): Promise<{
  organizations: number;
  ingested: number;
}> {
  const admin = createAdminClient();
  const { data: integrations, error } = await admin
    .from("fathom_integrations")
    .select("organization_id")
    .eq("status", "connected")
    .not("api_key", "is", null);

  if (error) throw new Error(error.message);

  let ingested = 0;
  for (const row of integrations ?? []) {
    try {
      ingested += await syncFathomMeetingsForOrganization(row.organization_id);
    } catch (e) {
      console.error(
        "[syncAllFathomIntegrations]",
        row.organization_id,
        e
      );
    }
  }

  return { organizations: integrations?.length ?? 0, ingested };
}
