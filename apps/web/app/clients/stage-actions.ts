"use server";

/**
 * Fijar a mano en qué fase del recorrido está un cliente.
 *
 * ⭐ El problema que resuelve, con la captura del founder delante: la fase se
 * **deduce** del último hito registrado. Un cliente que llega directo a hacer un
 * webinar con un creador queda en «Sin empezar» hasta que alguien tilde los
 * cuatro hitos de la fase anterior, que ese cliente nunca hizo. Para decir la
 * verdad sobre dónde está, había que mentir sobre lo que hizo.
 *
 * ⭐ Esto **no registra hitos**. Sólo dice "está acá". Los hitos de las fases
 * anteriores quedan sin evento y la ficha los muestra como *salteados*. Marcarlos
 * como cumplidos habría sido más barato y habría dejado el historial —el mismo
 * que alimenta los plazos, los trabados y los reportes— afirmando cosas que no
 * pasaron.
 */

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

export async function setClientManualStageAction(input: {
  clientId: string;
  /** `null` vuelve a dejar que los hitos manden. */
  stageId: string | null;
}): Promise<MutationResult<void>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    if (input.stageId) {
      // Una fase de otra organización colgaría el cliente de un recorrido ajeno.
      const { data: stage } = await supabase
        .from("client_journey_stages")
        .select("id")
        .eq("id", input.stageId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (!stage) throw new Error("Esa fase no existe en tu recorrido.");
    }

    const { error } = await supabase
      .from("clients")
      .update({
        manual_stage_id: input.stageId,
        /**
         * ⭐ La fecha es el ancla de los plazos. Sin ella, el primer hito de la
         * fase fijada no tendría desde cuándo contar —su hito anterior no
         * existe— y el cliente nunca podría aparecer como trabado.
         */
        manual_stage_set_at: input.stageId ? new Date().toISOString() : null,
      })
      .eq("id", input.clientId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    revalidatePath(paths.platform.clients.detail(input.clientId));
    revalidatePath(paths.platform.clients.root);
  });
}

/** La fase fijada a mano de cada cliente, para resolver la efectiva en la tabla. */
export async function getManualStagesAction(): Promise<Record<string, string>> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("clients")
      .select("id, manual_stage_id")
      .eq("organization_id", organizationId)
      .not("manual_stage_id", "is", null);

    if (error) return {};

    const result: Record<string, string> = {};
    for (const row of (data ?? []) as { id: string; manual_stage_id: string }[]) {
      result[row.id] = row.manual_stage_id;
    }
    return result;
  } catch {
    return {};
  }
}
