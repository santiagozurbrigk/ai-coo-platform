/**
 * Registrar lo que cuesta transcribir.
 *
 * ⭐ Arregla un agujero real: `/api/agent/transcribe` no registraba **nada** en
 * `token_usage`, así que el costo de todo lo que usa Whisper —el dictado del
 * agente y ahora los SOPs desde video— era **invisible**. Un Loom de 20 minutos
 * son 12 centavos que no aparecían en ningún lado.
 *
 * Whisper cobra **por minuto de audio, no por token**. Por eso se registran cero
 * tokens y el costo calculado: inventar un número de tokens para que la fila se
 * parezca a las de Claude sería peor que dejar el campo en cero.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { estimateTranscriptionCostUsd } from "@/lib/sops/audio-chunks";

export const WHISPER_MODEL_ID = "whisper-1";

export async function trackTranscriptionUsage(params: {
  organizationId: string;
  seconds: number;
  feature: string;
}): Promise<void> {
  const cost = estimateTranscriptionCostUsd(params.seconds);

  try {
    const admin = createAdminClient();
    await admin.from("token_usage").insert({
      organization_id: params.organizationId,
      model: WHISPER_MODEL_ID,
      input_tokens: 0,
      output_tokens: 0,
      input_cost_usd: cost,
      output_cost_usd: 0,
      total_cost_usd: cost,
      feature: params.feature,
    });
  } catch (error) {
    // Registrar el costo no puede romper la transcripción: si falla, se pierde
    // el dato de costo, no el trabajo del usuario.
    console.error(
      "[trackTranscriptionUsage]",
      error instanceof Error ? error.message : String(error)
    );
  }
}
