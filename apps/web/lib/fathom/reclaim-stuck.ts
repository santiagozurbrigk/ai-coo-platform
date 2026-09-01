import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Rescate de llamadas trabadas en `processing`.
 *
 * ⭐ **El agujero.** `processSingleFathomCall` marca `processing` antes de
 * empezar a trabajar. Si algo falla a mitad —la IA no responde, la lambda se
 * queda sin tiempo, el proceso muere— la fila queda en `processing` para
 * siempre: el cron sólo levanta `pending`, así que nadie la vuelve a tomar y
 * nadie se entera. Al escribir esto había 51 llamadas así, la más vieja de
 * julio.
 *
 * ⭐ **Por qué no rescata las viejas.** El rescate mira `processing_started_at`,
 * que se agregó junto con este archivo. Las llamadas que ya estaban trabadas no
 * lo tienen y quedan afuera **a propósito**: por decisión del usuario las
 * llamadas anteriores a este sistema se dejan como están, y reprocesarlas de
 * golpe significaría además una corrida de análisis con IA sobre 51 transcripts
 * sin que nadie lo haya pedido. No hace falta un caso especial para lograrlo:
 * sin marca de inicio, no hay rescate.
 */

/**
 * Cuánto puede tardar legítimamente una llamada en procesarse.
 *
 * El techo real es `maxDuration = 60s` de la lambda del cron; 15 minutos deja
 * margen de sobra sin dejar una llamada muerta esperando media hora.
 */
export const STUCK_AFTER_MS = 15 * 60 * 1000;

/**
 * Más allá de esto, la llamada se considera abandonada y no se rescata.
 *
 * Evita que una falla sistemática —una API key revocada, por ejemplo— genere
 * reintentos indefinidos sobre el mismo lote durante semanas.
 */
export const ABANDON_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export type StuckCandidate = {
  id: string;
  processing_started_at: string | null;
};

/**
 * ¿Hay que devolver esta llamada a la cola?
 *
 * Pura, para poder testear la ventana sin base de datos.
 */
export function shouldReclaim(
  call: StuckCandidate,
  now: Date = new Date()
): boolean {
  if (!call.processing_started_at) return false;

  const startedAt = new Date(call.processing_started_at).getTime();
  if (Number.isNaN(startedAt)) return false;

  const elapsed = now.getTime() - startedAt;
  // Una marca en el futuro es un reloj desfasado, no una llamada trabada.
  if (elapsed < 0) return false;

  return elapsed >= STUCK_AFTER_MS && elapsed <= ABANDON_AFTER_MS;
}

/**
 * Devuelve a `pending` las llamadas que quedaron colgadas en `processing`.
 *
 * Se llama desde el cron de Fathom, antes de procesar la cola: lo que se rescata
 * en esta corrida se procesa en la siguiente.
 */
export async function reclaimStuckFathomCalls(): Promise<number> {
  const admin = createAdminClient();
  const now = new Date();

  const { data, error } = await admin
    .from("fathom_calls")
    .select("id, processing_started_at")
    .eq("status", "processing")
    .not("processing_started_at", "is", null)
    .limit(200);

  if (error || !data?.length) return 0;

  const toReclaim = (data as StuckCandidate[])
    .filter((call) => shouldReclaim(call, now))
    .map((call) => call.id);

  if (!toReclaim.length) return 0;

  const { error: updateError } = await admin
    .from("fathom_calls")
    .update({
      status: "pending",
      // Se procesa en la próxima corrida, no en esta: si la llamada se trabó
      // por una falla transitoria, darle un respiro evita reintentarla en un
      // bucle cerrado.
      processed_after: now.toISOString(),
      processing_started_at: null,
    })
    .in("id", toReclaim);

  if (updateError) {
    console.error("[Fathom:reclaim] Error devolviendo a pending:", updateError.message);
    return 0;
  }

  console.log("[Fathom:reclaim] Llamadas devueltas a la cola:", toReclaim.length);
  return toReclaim.length;
}
