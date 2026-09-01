import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeFathomTranscript } from "@/lib/fathom/analyze-transcript";
import { generateDeepCallAnalysis } from "@/lib/fathom/deep-call-analysis";
import { extractTeamMeetingTaskProposals } from "@/lib/fathom/team-task-extraction";
import { associateCallWithClients } from "@/lib/fathom/associate";
import { isManualFathomLink } from "@/lib/fathom/client-matcher";

/** Confianza de un vínculo resuelto por coincidencia exacta de mail. */
const EMAIL_MATCH_CONFIDENCE = 0.95;
import { fetchFathomMeetingTitle } from "@/lib/fathom/api";
import { parseFathomInvitees } from "@/lib/fathom/invitees";
import { resolveCallClassification } from "@/lib/fathom/resolve-classification";
import { ingestDocument } from "@/lib/rag/ingest";
import {
  publishFathomAnalysisJob,
} from "@/lib/queue/qstash-client";
import type { CalendlyFormAnswer } from "@/types/closing";

function formAnswersToRecord(
  answers: CalendlyFormAnswer[] | null | undefined
): Record<string, string> | undefined {
  if (!answers?.length) return undefined;
  const record: Record<string, string> = {};
  for (const item of answers) {
    const key = item.question?.trim() || "Pregunta";
    record[key] = item.answer?.trim() ?? "";
  }
  return record;
}

export type FathomCallRow = {
  id: string;
  organization_id: string;
  fathom_call_id: string;
  title: string;
  raw_title: string | null;
  transcript: string | null;
  status: string;
  client_id: string | null;
  association_confidence?: number | null;
  fathom_url: string | null;
  processed_after: string | null;
  duration_seconds?: number | null;
  call_date?: string | null;
  summary?: string | null;
  calendar_invitees?: unknown;
  meeting_type?: string | null;
};

async function maybeExtractTeamMeetingTasks(params: {
  callId: string;
  organizationId: string;
  /** Propósito resuelto por el clasificador, no por la IA del transcript. */
  purpose: string | null | undefined;
  transcript: string | null;
  summary?: string | null;
}): Promise<void> {
  if (params.purpose !== "team" || !params.transcript?.trim()) {
    return;
  }

  const admin = createAdminClient();

  try {
    const proposals = await extractTeamMeetingTaskProposals({
      organizationId: params.organizationId,
      transcript: params.transcript,
      summary: params.summary,
    });

    if (!proposals.length) return;

    await admin
      .from("fathom_calls")
      .update({ ai_task_proposals: proposals })
      .eq("id", params.callId);
  } catch (error) {
    console.error("Error extracting tasks from team meeting:", error);
  }
}

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
    .update({
      status: "processing",
      // Sin esta marca no hay forma de distinguir una llamada que se está
      // procesando ahora de una que quedó colgada a mitad de camino.
      processing_started_at: new Date().toISOString(),
    })
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

  // ⭐ Clasificación. Reemplaza a los cuatro mecanismos que competían y se
  // pisaban entre sí. Corre después de refrescar el título —la ventana de 30
  // minutos existe para que alguien pueda renombrar la reunión— y antes de
  // cualquier análisis, porque de acá sale con quién y para qué es la llamada.
  const classification = await resolveCallClassification({
    organizationId: call.organization_id,
    title,
    invitees: parseFathomInvitees(call.calendar_invitees),
    meetingType: call.meeting_type ?? null,
    recordingStart: call.call_date ?? null,
  });

  const classificationUpdate: Record<string, unknown> = {
    counterparty: classification.counterparty,
    purpose: classification.purpose,
    classification_signals: classification.signals,
    unclassified_reason: classification.reason,
    declared_name: classification.declaredName,
    closing_call_id: classification.appointmentId,
    appointment_match: classification.appointmentMatch,
  };

  // Un invitado externo cuyo mail es el de un cliente: eso identifica al cliente
  // con certeza. Es lo que reemplaza al fuzzy match contra el título, que dejó
  // 0 de 248 llamadas asociadas.
  //
  // 0.95 y no 1: `1` está reservado para los vínculos que hizo una persona
  // (`MANUAL_FATHOM_LINK_CONFIDENCE`), y este es automático. Alcanza de sobra
  // para el umbral de asociación, que es 0.75.
  const isManual = isManualFathomLink(call.client_id, call.association_confidence);
  if (classification.clientId && !isManual) {
    classificationUpdate.client_id = classification.clientId;
    classificationUpdate.association_confidence = EMAIL_MATCH_CONFIDENCE;
  }

  await admin.from("fathom_calls").update(classificationUpdate).eq("id", call.id);

  const { data: callState } = await admin
    .from("fathom_calls")
    .select("client_id, association_confidence")
    .eq("id", call.id)
    .single();

  const linkedClientId = callState?.client_id ?? call.client_id;
  const linkConfidence = Number(
    callState?.association_confidence ?? call.association_confidence ?? 0
  );

  if (
    linkedClientId &&
    (linkConfidence >= 0.75 || isManualFathomLink(linkedClientId, linkConfidence))
  ) {
    await finalizeAssociatedCall({
      callId: call.id,
      organizationId: call.organization_id,
      clientId: linkedClientId,
      fathomCallId: call.fathom_call_id,
      title,
      rawTitle: call.raw_title ?? call.title,
      transcript: call.transcript,
      fathomUrl: call.fathom_url,
      confidence: linkConfidence,
      durationSeconds: call.duration_seconds,
      callDate: call.call_date,
      purpose: classification.purpose,
    });
    return;
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
    if (call.transcript?.trim()) {
      const analysis = await analyzeFathomTranscript({
        organizationId: call.organization_id,
        clientName: "Equipo interno",
        transcript: call.transcript,
        previousCallsSummary: "",
      });

      await admin
        .from("fathom_calls")
        .update({
          title,
          raw_title: call.raw_title ?? call.title,
          status: "unmatched",
          ai_situation_summary: analysis?.situation_summary ?? null,
          ai_next_steps: analysis?.next_steps ?? [],
          ai_problems_detected: analysis?.problems_detected ?? [],
          processed_at: new Date().toISOString(),
        })
        .eq("id", call.id);

      await maybeExtractTeamMeetingTasks({
        callId: call.id,
        organizationId: call.organization_id,
        purpose: classification.purpose,
        transcript: call.transcript,
        summary: analysis?.situation_summary ?? call.summary ?? null,
      });
    } else {
      await admin
        .from("fathom_calls")
        .update({
          title,
          raw_title: call.raw_title ?? call.title,
          status: "unmatched",
          processed_at: new Date().toISOString(),
        })
        .eq("id", call.id);
    }
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
    fathomCallId: call.fathom_call_id,
    title,
    rawTitle: call.raw_title ?? call.title,
    transcript: call.transcript,
    fathomUrl: call.fathom_url,
    confidence: association.confidence,
    durationSeconds: call.duration_seconds,
    callDate: call.call_date,
    purpose: classification.purpose,
  });
}

export async function finalizeAssociatedCall(params: {
  callId: string;
  organizationId: string;
  clientId: string;
  fathomCallId: string;
  title: string;
  rawTitle: string;
  transcript: string | null;
  fathomUrl: string | null;
  confidence: number;
  durationSeconds?: number | null;
  callDate?: string | null;
  /** Propósito ya resuelto por el clasificador. */
  purpose?: string | null;
}): Promise<void> {
  const admin = createAdminClient();

  const { data: client } = await admin
    .from("clients")
    .select("name")
    .eq("id", params.clientId)
    .single();

  const leadName = client?.name ?? "Cliente";

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
      processed_at: new Date().toISOString(),
    })
    .eq("id", params.callId);

  await maybeExtractTeamMeetingTasks({
    callId: params.callId,
    organizationId: params.organizationId,
    purpose: params.purpose ?? null,
    transcript: params.transcript,
    summary: analysis?.situation_summary ?? null,
  });

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

  const durationMinutes =
    params.durationSeconds != null
      ? Math.max(1, Math.round(params.durationSeconds / 60))
      : undefined;

  if (params.transcript?.trim() && durationMinutes && durationMinutes >= 10) {
    const { data: closingCall } = await admin
      .from("closing_calls")
      .select("form_answers")
      .eq("organization_id", params.organizationId)
      .ilike("lead_name", `%${leadName}%`)
      .order("scheduled_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const deepAnalysisPayload = {
      organizationId: params.organizationId,
      fathomCallId: params.fathomCallId,
      transcript: params.transcript,
      leadName,
      durationMinutes,
      formAnswers: formAnswersToRecord(
        closingCall?.form_answers as CalendlyFormAnswer[] | null
      ),
      callTitle: params.title,
      callDate: params.callDate,
      fathomUrl: params.fathomUrl,
      clientId: params.clientId,
    };

    // Intentar encolar en QStash para garantizar ejecución
    // (evita que Vercel mate el análisis cuando la función cron termina)
    const enqueued = await publishFathomAnalysisJob(deepAnalysisPayload).catch(() => false);

    if (!enqueued) {
      // Fallback: ejecutar inline si QStash no está configurado
      console.log("[ProcessCall] QStash no disponible — ejecutando deep analysis inline");
      void generateDeepCallAnalysis(deepAnalysisPayload).catch((err) => {
        console.error("[ProcessCall] Error en deep analysis inline:", err);
      });
    }
  }

  if (params.transcript?.trim()) {
    void ingestDocument({
      organizationId: params.organizationId,
      sourceType: "fathom_call",
      sourceId: params.fathomCallId,
      title: params.title,
      data: {
        title: params.title,
        call_date: params.callDate,
        transcript: params.transcript,
        ai_situation_summary: analysis?.situation_summary,
        ai_next_steps: nextSteps,
        summary: analysis?.situation_summary,
      },
      tags: ["fathom", "call"],
    }).catch((err) => console.error("[RAG] Error ingestando call:", err));
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
    association_candidates: [] as unknown[],
    ai_next_steps: [] as string[],
    ai_problems_detected: [] as string[],
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
    .upsert(callData, { onConflict: "organization_id,fathom_call_id" })
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
