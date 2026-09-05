/**
 * E · De los mensajes de Discord al buzón de propuestas de C3.
 *
 * La cuarta conexión del bot, la que había quedado afuera. Las otras tres
 * (actividad, silencio, testimonio → win) ya estaban.
 *
 * ⭐ Un mensaje **nunca registra un hito**: propone. Que un cliente escriba
 * "grabé el VSL" es una buena señal, no un hecho verificado — la persona que
 * acepta la propuesta es la que lo convierte en hecho.
 */
import {
  proposeCheckpointsFromTexts,
  type ProposalCandidate,
  type ProposeResult,
} from "@/lib/checkpoints/propose-from-texts";
import { createAdminClient } from "@/lib/supabase/admin";

/** Cuántos mensajes mira una corrida. */
export const PROPOSE_MESSAGE_LIMIT = 60;

type MessageRow = {
  id: string;
  content: string | null;
  channel_name: string | null;
  client_id: string | null;
  sent_at: string;
  discord_message_id: string;
};

export async function proposeCheckpointsFromDiscordForOrg(
  organizationId: string,
  options: { limit?: number } = {}
): Promise<ProposeResult> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("discord_messages")
    .select("id, content, channel_name, client_id, sent_at, discord_message_id")
    .eq("organization_id", organizationId)
    .is("checkpoint_checked_at", null)
    /**
     * Sólo mensajes ya clasificados y de un cliente conocido.
     *
     * ⭐ Un mensaje sin cliente vinculado **no se marca como evaluado**: queda
     * afuera por el filtro, sin costo de IA, y vuelve a ser candidato el día que
     * alguien vincule a esa persona. Marcarlo sería perderlo para siempre.
     */
    .not("client_id", "is", null)
    .not("ai_sentiment", "is", null)
    .order("sent_at", { ascending: false })
    .limit(options.limit ?? PROPOSE_MESSAGE_LIMIT);

  if (error) throw new Error(error.message);

  const rows = ((data as MessageRow[]) ?? []).filter(
    (row) => row.client_id && row.content?.trim()
  );
  if (rows.length === 0) return { evaluados: 0, propuestos: 0, creados: 0 };

  const candidates: ProposalCandidate[] = rows.map((row) => ({
    id: row.id,
    text: row.content ?? "",
    context: row.channel_name ? `#${row.channel_name}` : null,
    clientId: row.client_id!,
    occurredAt: row.sent_at,
    sourceRef: row.discord_message_id,
  }));

  const result = await proposeCheckpointsFromTexts(organizationId, candidates, "discord");

  /**
   * ⭐ Se marcan **todos los evaluados**, hayan producido propuesta o no. Un
   * mensaje que se miró y no proponía nada es justo el que, sin marca, se
   * re-evalúa todos los días para siempre.
   */
  await admin
    .from("discord_messages")
    .update({ checkpoint_checked_at: new Date().toISOString() })
    .in("id", rows.map((row) => row.id))
    .eq("organization_id", organizationId);

  return result;
}
