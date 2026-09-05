/**
 * C3 · La entrada del buzón de propuestas.
 *
 * Vive acá y no sólo en el Server Action porque tiene **dos llamadores**: la
 * acción, que corre con la sesión de una persona, y los crons de Discord y
 * Fathom, que no tienen sesión. Mismo patrón que `lib/discord/classify-run.ts`.
 *
 * ⭐ Las dos reglas que hacen que el buzón no se llene de ruido viven acá, así
 * las cumplen los dos caminos por igual:
 *
 *   1. **Lo que ya pasó no se propone.** Si el hito está registrado, no hay nada
 *      que decidir.
 *   2. **No se propone dos veces lo mismo.** El índice único parcial corta el
 *      duplicado mientras la propuesta siga pendiente: un cron que corre todos
 *      los días no deja treinta propuestas iguales.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckpointProposalSource } from "@/types/checkpoints";

export type CreateProposalInput = {
  organizationId: string;
  clientId: string;
  checkpointId: string;
  source: CheckpointProposalSource;
  sourceRef?: string | null;
  rationale?: string | null;
  suggestedReachedAt?: string | null;
  suggestedMetrics?: Record<string, unknown>;
  confidence?: number | null;
};

export async function createCheckpointProposal(
  input: CreateProposalInput
): Promise<{ created: boolean }> {
  const admin = createAdminClient();

  // 1 · Proponer lo que ya está registrado es ruido.
  const { count: alreadyReached } = await admin
    .from("client_checkpoint_events")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", input.organizationId)
    .eq("client_id", input.clientId)
    .eq("checkpoint_id", input.checkpointId);

  if ((alreadyReached ?? 0) > 0) return { created: false };

  const { error } = await admin.from("client_checkpoint_proposals").insert({
    organization_id: input.organizationId,
    client_id: input.clientId,
    checkpoint_id: input.checkpointId,
    source: input.source,
    source_ref: input.sourceRef ?? null,
    rationale: input.rationale ?? null,
    suggested_reached_at: input.suggestedReachedAt ?? null,
    suggested_metrics: input.suggestedMetrics ?? {},
    confidence: input.confidence ?? null,
  });

  if (error) {
    // 2 · El duplicado pendiente no es un error: es la propuesta que ya estaba
    // esperando a que alguien la mire.
    if (error.code === "23505" || /duplicate key/i.test(error.message)) {
      return { created: false };
    }
    throw new Error(error.message);
  }

  return { created: true };
}
