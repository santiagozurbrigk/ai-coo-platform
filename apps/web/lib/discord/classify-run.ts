/**
 * E · La corrida del clasificador de Discord.
 *
 * Vive acá y no en el Server Action porque tiene **dos llamadores**: la acción
 * manual, que corre con la organización de la sesión, y el cron diario, que no
 * tiene sesión y recorre todas las organizaciones. Mismo patrón que
 * `lib/marketing/sync-content-metrics.ts`.
 *
 * ⭐ La clasificación **no dispara nada**: llena las columnas de análisis y
 * corrige `is_testimonial`. Convertir un testimonio en un win sigue siendo una
 * decisión de una persona.
 */
import { callClaudeJson } from "@/lib/ai/anthropic";
import {
  CLASSIFY_SYSTEM_PROMPT,
  buildClassifyPrompt,
  chunkForClassification,
  parseClassifyResponse,
} from "@/lib/discord/classify-messages";
import { createAdminClient } from "@/lib/supabase/admin";

export type ClassifyRunResult = {
  clasificados: number;
  testimonios: number;
  /** Mensajes que se saltearon por venir vacíos — ver la nota de abajo. */
  vacios: number;
};

/** Cuántos mensajes mira una corrida. Más que esto no entra en el cron. */
export const CLASSIFY_RUN_LIMIT = 100;

export async function classifyDiscordMessagesForOrg(
  organizationId: string,
  options: { limit?: number } = {}
): Promise<ClassifyRunResult> {
  const limit = options.limit ?? CLASSIFY_RUN_LIMIT;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("discord_messages")
    .select("id, content, channel_name")
    .eq("organization_id", organizationId)
    // Sin clasificar todavía. `ai_sentiment` es la marca de "ya pasó por acá".
    .is("ai_sentiment", null)
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows = (data as { id: string; content: string | null; channel_name: string | null }[]) ?? [];

  /**
   * ⭐ Un mensaje vacío no se manda a clasificar: es la señal de que el intent
   * MESSAGE CONTENT del bot no está activado, no un mensaje sin texto. Se
   * cuentan aparte para que el cron lo pueda decir en su respuesta — si todos
   * vienen vacíos, el problema está en Discord y no acá.
   */
  const pending = rows.filter((row) => row.content?.trim());
  const vacios = rows.length - pending.length;

  if (pending.length === 0) return { clasificados: 0, testimonios: 0, vacios };

  let clasificados = 0;
  let testimonios = 0;

  for (const batch of chunkForClassification(pending)) {
    const messages = batch.map((row) => ({
      id: row.id,
      content: row.content ?? "",
      channelName: row.channel_name,
    }));

    const response = await callClaudeJson<{ results?: unknown }>({
      organizationId,
      task: "content_labeling",
      feature: "discord_message_classification",
      system: CLASSIFY_SYSTEM_PROMPT,
      user: buildClassifyPrompt(messages),
      maxTokens: 4096,
    });

    // Si un lote falla, se sigue con el siguiente: perder un lote es mejor que
    // perder la corrida entera.
    if (!response) continue;

    for (const result of parseClassifyResponse(response, messages)) {
      const { error: updateError } = await admin
        .from("discord_messages")
        .update({
          is_testimonial: result.isTestimonial,
          ai_sentiment: result.sentiment,
          ai_summary: result.summary,
          requires_attention: result.requiresAttention,
        })
        .eq("id", result.id)
        .eq("organization_id", organizationId);

      if (!updateError) {
        clasificados += 1;
        if (result.isTestimonial) testimonios += 1;
      }
    }
  }

  return { clasificados, testimonios, vacios };
}

/**
 * Todas las organizaciones con Discord conectado.
 *
 * Una organización que falla no corta las demás: su error queda en el resultado
 * y la corrida sigue.
 */
export async function classifyDiscordMessagesAllOrgs(): Promise<{
  organizaciones: number;
  results: Array<{ organizationId: string } & Partial<ClassifyRunResult> & { error?: string }>;
}> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("discord_integrations")
    .select("organization_id")
    // Una integración desconectada no se clasifica: sus mensajes viejos ya
    // quedaron clasificados y no entran nuevos.
    .eq("status", "connected");

  if (error) throw new Error(error.message);

  const orgIds = [
    ...new Set(((data as { organization_id: string }[]) ?? []).map((row) => row.organization_id)),
  ];

  const results: Array<
    { organizationId: string } & Partial<ClassifyRunResult> & { error?: string }
  > = [];

  for (const organizationId of orgIds) {
    try {
      const result = await classifyDiscordMessagesForOrg(organizationId);
      results.push({ organizationId, ...result });
    } catch (failure) {
      results.push({
        organizationId,
        error: failure instanceof Error ? failure.message : "error desconocido",
      });
    }
  }

  return { organizaciones: orgIds.length, results };
}
