/**
 * B · De las llamadas de entrega al buzón de propuestas de C3.
 *
 * Una llamada de entrega es la conversación donde el cliente cuenta qué hizo
 * desde la última vez. Es la fuente más rica de hitos que hay — y hasta ahora
 * no alimentaba el recorrido.
 *
 * ⭐ Sólo las de **entrega**, y sólo las que quedaron vinculadas a un cliente.
 * Una llamada de venta no habla de hitos del programa, y una sin cliente no
 * tiene a quién proponerle nada.
 */
import {
  proposeCheckpointsFromTexts,
  type ProposalCandidate,
  type ProposeResult,
} from "@/lib/checkpoints/propose-from-texts";
import { createAdminClient } from "@/lib/supabase/admin";

/** Cuántas llamadas mira una corrida. Son textos largos: el lote es chico. */
export const PROPOSE_CALL_LIMIT = 20;

type CallRow = {
  id: string;
  title: string | null;
  summary: string | null;
  ai_situation_summary: string | null;
  client_id: string | null;
  call_date: string | null;
  fathom_call_id: string;
};

export async function proposeCheckpointsFromCallsForOrg(
  organizationId: string,
  options: { limit?: number } = {}
): Promise<ProposeResult> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("fathom_calls")
    .select("id, title, summary, ai_situation_summary, client_id, call_date, fathom_call_id")
    .eq("organization_id", organizationId)
    .is("checkpoint_checked_at", null)
    .eq("purpose", "delivery")
    .not("client_id", "is", null)
    .order("call_date", { ascending: false })
    .limit(options.limit ?? PROPOSE_CALL_LIMIT);

  if (error) throw new Error(error.message);

  const rows = (data as CallRow[]) ?? [];

  /**
   * El resumen de la situación si existe; si no, el resumen de la llamada.
   *
   * ⭐ **La transcripción entera no se manda.** Es cara y, sobre todo, está
   * llena de lo que el coach dijo: proponer un hito porque alguien lo *nombró*
   * es exactamente el error que este módulo tiene que no cometer.
   */
  const candidates: ProposalCandidate[] = rows
    .map((row): ProposalCandidate | null => {
      const text = row.ai_situation_summary?.trim() || row.summary?.trim() || "";
      if (!text || !row.client_id) return null;
      return {
        id: row.id,
        text,
        context: row.title ? `llamada de entrega: ${row.title}` : "llamada de entrega",
        clientId: row.client_id,
        occurredAt: row.call_date,
        sourceRef: row.fathom_call_id,
      };
    })
    .filter((candidate): candidate is ProposalCandidate => candidate !== null);

  // Una llamada sin resumen todavía no se puede evaluar, pero sí se marcó como
  // mirada más abajo: sin resumen nunca lo va a tener, porque el resumen llega
  // con el procesamiento y este cron corre después.
  const result =
    candidates.length > 0
      ? await proposeCheckpointsFromTexts(organizationId, candidates, "fathom")
      : { evaluados: 0, propuestos: 0, creados: 0 };

  if (rows.length > 0) {
    await admin
      .from("fathom_calls")
      .update({ checkpoint_checked_at: new Date().toISOString() })
      .in("id", rows.map((row) => row.id))
      .eq("organization_id", organizationId);
  }

  return result;
}
