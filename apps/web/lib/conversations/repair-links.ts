import type { SupabaseClient } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ConvRef = { id: string; external_ref: string | null; lead_name: string };
type CallRef = {
  id: string;
  conversation_id: string | null;
  lead_name: string;
};

/** Enlaza closing_calls con conversation_id uuid tras seed o migración desde IDs mock (c4…). */
export async function repairClosingConversationLinks(
  supabase: SupabaseClient,
  organizationId: string
): Promise<void> {
  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id, external_ref, lead_name")
    .eq("organization_id", organizationId);

  if (convError || !convs?.length) return;

  const { data: calls, error: callError } = await supabase
    .from("closing_calls")
    .select("id, conversation_id, lead_name")
    .eq("organization_id", organizationId);

  if (callError || !calls?.length) return;

  const byRef = new Map<string, string>();
  const byLead = new Map<string, string>();
  for (const c of convs as ConvRef[]) {
    if (c.external_ref) byRef.set(c.external_ref, c.id);
    byLead.set(c.lead_name.toLowerCase(), c.id);
  }

  for (const call of calls as CallRef[]) {
    if (call.conversation_id && UUID_RE.test(call.conversation_id)) continue;

    const raw = call.conversation_id?.trim();
    const legacy =
      raw && !UUID_RE.test(raw) ? raw : null;
    const convId =
      (legacy && byRef.get(legacy)) ??
      byLead.get(call.lead_name.toLowerCase());

    if (!convId) continue;

    const { error } = await supabase
      .from("closing_calls")
      .update({ conversation_id: convId, updated_at: new Date().toISOString() })
      .eq("id", call.id);

    if (error) {
      console.error("[repairClosingConversationLinks]", error.message);
    }
  }
}
