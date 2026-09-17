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

  /**
   * ⭐ Lo que escribe el equipo no se clasifica.
   *
   * Esto es plata: cada mensaje que entra acá cuesta una porción de llamada a
   * Haiku, y lo que escribe tu propio equipo no es actividad de ningún cliente
   * —no hay sentimiento de cliente que medir ni logro que detectar—. Peor: el
   * clasificador **corrige** `is_testimonial`, así que un "felicitaciones
   * Thiago, tremendo logro" del coach podía terminar marcado como testimonio.
   *
   * En el servidor real, 4 de las 7 personas que escribían eran del equipo: más
   * de la mitad del gasto de clasificación no tenía a quién servir.
   */
  const { data: equipo } = await admin
    .from("discord_team_members")
    .select("discord_user_id")
    .eq("organization_id", organizationId);

  const idsDelEquipo = (equipo ?? []).map(
    (fila) => fila.discord_user_id as string,
  );

  let query = admin
    .from("discord_messages")
    .select("id, content, channel_name, discord_user_id")
    .eq("organization_id", organizationId)
    // Sin clasificar todavía. `ai_sentiment` es la marca de "ya pasó por acá".
    .is("ai_sentiment", null);

  /**
   * El filtro va en la consulta —para que el tope de `limit` no se gaste en
   * mensajes que después se descartan— pero **sólo con ids que sean números**.
   *
   * Los ids de Discord son numéricos siempre; interpolar cualquier otra cosa
   * dentro de un `in (...)` de PostgREST arma una condición que puede fallar o,
   * peor, no filtrar nada sin avisar. Lo que no se puede interpolar seguro se
   * filtra abajo en memoria.
   */
  const seguros = idsDelEquipo.filter((id) => /^\d+$/.test(id));
  if (seguros.length > 0) {
    query = query.not("discord_user_id", "in", `(${seguros.join(",")})`);
  }

  const { data, error } = await query
    .order("sent_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  /**
   * ⭐ Y se vuelve a filtrar acá.
   *
   * La red de seguridad del filtro de arriba: si PostgREST alguna vez lo
   * ignorara, o si un id no pasó por numérico, lo que escribe el equipo
   * igual no llega a la IA. Un filtro de costo que falla en silencio es
   * exactamente el que nadie mira hasta que llega la factura.
   */
  const excluidos = new Set(idsDelEquipo);
  const rows = (
    (data as {
      id: string;
      content: string | null;
      channel_name: string | null;
      discord_user_id: string;
    }[]) ?? []
  ).filter((row) => !excluidos.has(row.discord_user_id));

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
