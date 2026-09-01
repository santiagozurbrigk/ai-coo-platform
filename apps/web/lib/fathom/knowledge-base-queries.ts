import { createAdminClient } from "@/lib/supabase/admin";
import type { FathomKnowledgeCall } from "@/types/business-context";

type FathomCallDbRow = {
  id: string;
  title: string;
  call_date: string | null;
  duration_seconds: number | null;
  fathom_url: string | null;
  transcript: string | null;
  status: string;
  client_id: string | null;
  call_type: string | null;
  /** Eje nuevo de la Fase 1. `call_type` queda como legado hasta la Fase 2. */
  purpose: string | null;
  summary: string | null;
  ai_task_proposals: FathomKnowledgeCall["ai_task_proposals"] | null;
  tasks_sent_to_board: boolean | null;
  clients?: { name: string } | { name: string }[] | null;
};

function mapRow(row: FathomCallDbRow): FathomKnowledgeCall {
  const clientRef = row.clients;
  const clientName = Array.isArray(clientRef)
    ? clientRef[0]?.name
    : clientRef?.name;

  return {
    id: row.id,
    title: row.title,
    call_date: row.call_date,
    duration_seconds: row.duration_seconds,
    fathom_url: row.fathom_url,
    transcript: row.transcript,
    status: row.status,
    client_id: row.client_id,
    clientName: clientName ?? null,
    call_type: row.call_type,
    purpose: row.purpose ?? null,
    summary: row.summary,
    ai_task_proposals: Array.isArray(row.ai_task_proposals)
      ? row.ai_task_proposals
      : [],
    tasks_sent_to_board: Boolean(row.tasks_sent_to_board),
  };
}

export async function loadFathomCallsForKnowledgeBase(
  organizationId: string
): Promise<{
  contextCalls: FathomKnowledgeCall[];
  clientMeetingCalls: FathomKnowledgeCall[];
}> {
  const admin = createAdminClient();

  const [contextRes, clientRes] = await Promise.all([
    admin
      .from("fathom_calls")
      .select(
        "id, title, call_date, duration_seconds, fathom_url, transcript, status, client_id, call_type, purpose, summary, ai_task_proposals, tasks_sent_to_board"
      )
      .eq("organization_id", organizationId)
      .is("client_id", null)
      .order("call_date", { ascending: false }),
    admin
      .from("fathom_calls")
      .select(
        "id, title, call_date, duration_seconds, fathom_url, transcript, status, client_id, call_type, purpose, summary, ai_task_proposals, tasks_sent_to_board, clients(name)"
      )
      .eq("organization_id", organizationId)
      .not("client_id", "is", null)
      .order("call_date", { ascending: false }),
  ]);

  if (contextRes.error) {
    console.error("[Fathom:KB] context calls error:", contextRes.error.message);
  }
  if (clientRes.error) {
    console.error("[Fathom:KB] client calls error:", clientRes.error.message);
  }

  return {
    contextCalls: (contextRes.data ?? []).map((row) =>
      mapRow(row as FathomCallDbRow)
    ),
    clientMeetingCalls: (clientRes.data ?? []).map((row) =>
      mapRow(row as FathomCallDbRow)
    ),
  };
}
