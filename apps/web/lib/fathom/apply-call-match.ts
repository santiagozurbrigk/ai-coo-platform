import type { SupabaseClient } from "@supabase/supabase-js";
import { tryMatchCallToClient } from "@/lib/fathom/client-matcher";

export async function applyClientMatchToCall(
  supabase: SupabaseClient,
  callId: string,
  organizationId: string,
  callTitle: string
): Promise<void> {
  const matchResult = await tryMatchCallToClient(
    callTitle,
    organizationId,
    supabase
  );

  console.log("[Fathom:sync] Match result:", {
    callId,
    title: callTitle,
    method: matchResult.method,
    confidence: matchResult.confidence,
    clientId: matchResult.clientId,
  });

  if (matchResult.clientId && matchResult.confidence >= 0.75) {
    await supabase
      .from("fathom_calls")
      .update({
        client_id: matchResult.clientId,
        association_confidence: matchResult.confidence,
        association_candidates: [],
        status: "pending",
      })
      .eq("id", callId);
    return;
  }

  if (matchResult.method === "fuzzy_candidate") {
    await supabase
      .from("fathom_calls")
      .update({
        client_id: null,
        association_confidence: matchResult.confidence,
        association_candidates: matchResult.candidates ?? [],
        status: "pending_review",
      })
      .eq("id", callId);
    return;
  }

  await supabase
    .from("fathom_calls")
    .update({
      association_confidence: matchResult.confidence || null,
      association_candidates: [],
    })
    .eq("id", callId);
}
