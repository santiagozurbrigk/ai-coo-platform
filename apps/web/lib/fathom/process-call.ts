import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeFathomTranscript } from "@/lib/fathom/analyze-transcript";
import { associateCallWithClients } from "@/lib/fathom/associate";
import { fetchFathomMeetingTitle } from "@/lib/fathom/api";

export type FathomCallRow = {
  id: string;
  organization_id: string;
  fathom_call_id: string;
  title: string;
  raw_title: string | null;
  transcript: string | null;
  status: string;
  client_id: string | null;
  fathom_url: string | null;
  processed_after: string | null;
};

export async function processPendingFathomCalls(limit = 20): Promise<number> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: pending, error } = await admin
    .from("fathom_calls")
    .select("*")
    .eq("status", "pending")
    .lte("processed_after", now)
    .order("processed_after", { ascending: true })
    .limit(limit);

  if (error || !pending?.length) return 0;

  let processed = 0;
  for (const call of pending as FathomCallRow[]) {
    try {
      await processSingleFathomCall(call);
      processed++;
    } catch (e) {
      console.error("[processPendingFathomCalls]", call.id, e);
    }
  }
  return processed;
}

export async function processSingleFathomCall(call: FathomCallRow): Promise<void> {
  const admin = createAdminClient();

  await admin
    .from("fathom_calls")
    .update({ status: "processing" })
    .eq("id", call.id);

  let title = call.title;
  const { data: integration } = await admin
    .from("fathom_integrations")
    .select("api_key")
    .eq("organization_id", call.organization_id)
    .maybeSingle();

  if (integration?.api_key) {
    const updatedTitle = await fetchFathomMeetingTitle(
      integration.api_key,
      call.fathom_call_id
    );
    if (updatedTitle) title = updatedTitle;
  }

  const { data: clients } = await admin
    .from("clients")
    .select("id, name, nickname")
    .eq("organization_id", call.organization_id);

  const association = associateCallWithClients(
    title,
    (clients ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      nickname: c.nickname ?? null,
    }))
  );

  if (association.status === "unmatched") {
    await admin
      .from("fathom_calls")
      .update({
        title,
        raw_title: call.raw_title ?? call.title,
        status: "unmatched",
        processed_at: new Date().toISOString(),
      })
      .eq("id", call.id);
    return;
  }

  if (association.status === "pending_review") {
    await admin
      .from("fathom_calls")
      .update({
        title,
        raw_title: call.raw_title ?? call.title,
        status: "pending_review",
        association_candidates: association.candidates,
        processed_at: new Date().toISOString(),
      })
      .eq("id", call.id);
    return;
  }

  await finalizeAssociatedCall({
    callId: call.id,
    organizationId: call.organization_id,
    clientId: association.clientId,
    title,
    rawTitle: call.raw_title ?? call.title,
    transcript: call.transcript,
    fathomUrl: call.fathom_url,
    confidence: association.confidence,
  });
}

export async function finalizeAssociatedCall(params: {
  callId: string;
  organizationId: string;
  clientId: string;
  title: string;
  rawTitle: string;
  transcript: string | null;
  fathomUrl: string | null;
  confidence: number;
}): Promise<void> {
  const admin = createAdminClient();

  const { data: client } = await admin
    .from("clients")
    .select("name")
    .eq("id", params.clientId)
    .single();

  const { data: previousCalls } = await admin
    .from("fathom_calls")
    .select("title, ai_situation_summary, call_date")
    .eq("organization_id", params.organizationId)
    .eq("client_id", params.clientId)
    .eq("status", "associated")
    .order("call_date", { ascending: false })
    .limit(3);

  const previousSummary = (previousCalls ?? [])
    .map(
      (c) =>
        `${c.title}: ${c.ai_situation_summary ?? "sin resumen"}`
    )
    .join("\n");

  let analysis = null;
  if (params.transcript?.trim()) {
    analysis = await analyzeFathomTranscript({
      organizationId: params.organizationId,
      clientName: client?.name ?? "Cliente",
      transcript: params.transcript,
      previousCallsSummary: previousSummary,
    });
  }

  const nextSteps = analysis?.next_steps ?? [];
  const problems = analysis?.problems_detected ?? [];

  await admin
    .from("fathom_calls")
    .update({
      title: params.title,
      raw_title: params.rawTitle,
      status: "associated",
      client_id: params.clientId,
      association_confidence: params.confidence,
      ai_situation_summary: analysis?.situation_summary ?? null,
      ai_next_steps: nextSteps,
      ai_problems_detected: problems,
      ai_progress_vs_previous: analysis?.progress_vs_previous ?? null,
      call_type: analysis?.call_type ?? "delivery",
      processed_at: new Date().toISOString(),
    })
    .eq("id", params.callId);

  await admin.from("client_timeline_entries").insert({
    organization_id: params.organizationId,
    client_id: params.clientId,
    entry_type: "fathom_call",
    fathom_call_id: params.callId,
    title: params.title,
    situation_summary: analysis?.situation_summary ?? null,
    next_steps: nextSteps,
    problems_detected: problems,
    progress_indicator: analysis?.progress_indicator ?? "unknown",
    raw_data: { fathom_url: params.fathomUrl },
  });

  for (const problem of problems) {
    await admin.from("client_problems").insert({
      organization_id: params.organizationId,
      client_id: params.clientId,
      problem_description: problem,
      detected_from: "fathom_call",
      source_id: params.callId,
      status: "active",
    });
  }
}

export async function ingestFathomWebhookCall(params: {
  organizationId: string;
  fathomCallId: string;
  title: string;
  transcript?: string;
  summary?: string;
  durationSeconds?: number;
  callDate?: string;
  fathomUrl?: string;
}): Promise<string> {
  const admin = createAdminClient();
  const processedAfter = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const callData = {
    organization_id: params.organizationId,
    fathom_call_id: params.fathomCallId,
    title: params.title,
    raw_title: params.title,
    transcript: params.transcript ?? null,
    summary: params.summary ?? null,
    duration_seconds: params.durationSeconds ?? null,
    call_date: params.callDate ?? new Date().toISOString(),
    fathom_url: params.fathomUrl ?? null,
    status: "pending" as const,
    processed_after: processedAfter,
  };

  console.log("[Fathom] Inserting call:", {
    organization_id: callData.organization_id,
    title: callData.title,
    recording_id: callData.fathom_call_id,
    call_date: callData.call_date,
    has_transcript: Boolean(callData.transcript),
  });

  const { data, error } = await admin
    .from("fathom_calls")
    .upsert(callData, { onConflict: "fathom_call_id" })
    .select("id")
    .single();

  if (error) {
    console.error(
      "[Fathom] Insert error:",
      error.message,
      error.details,
      error.hint,
      error.code
    );
    throw new Error(error.message);
  }

  console.log("[Fathom] Insert OK:", { id: data.id, fathom_call_id: callData.fathom_call_id });
  return data.id;
}
