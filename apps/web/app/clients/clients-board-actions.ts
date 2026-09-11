"use server";

/**
 * Todo lo que la tabla de clientes necesita, en una sola vuelta.
 *
 * ⭐ Existe para no hacer cuatro round trips desde el navegador cada vez que se
 * abre la pantalla. Las cuatro piezas se piden juntas porque se dibujan juntas:
 * sin el recorrido no hay etapa, sin los checkpoints no se sabe si el próximo
 * hito pide métricas, y sin las columnas configurables no hay objetivo.
 *
 * No agrega lógica: cada pieza sale de la action que ya la servía.
 */

import { listFieldDefinitionsAction } from "@/app/clients/custom-field-actions";
import { listCheckpointsAction } from "@/app/clients/checkpoint-actions";
import { getClientsJourneyStatusAction } from "@/app/clients/checkpoint-derived-actions";
import type { Checkpoint, ClientJourneyStatus } from "@/types/checkpoints";
import type { FieldDefinition } from "@/types/custom-fields";

export type ClientsBoardData = {
  /** Etapa actual, progreso y próximo hito de cada cliente. */
  journey: Record<string, ClientJourneyStatus>;
  /**
   * El catálogo de hitos. La tabla lo necesita para una sola cosa: saber si el
   * próximo hito de un cliente **pide métricas**, y por lo tanto si el check
   * inline puede marcarlo solo o tiene que abrir el diálogo.
   */
  checkpoints: Checkpoint[];
  /** Las columnas que las métricas de un checkpoint referencian. */
  checkpointFields: FieldDefinition[];
  /** Las columnas configurables del cliente — entre ellas, el objetivo general. */
  clientFields: FieldDefinition[];
};

export async function getClientsBoardAction(): Promise<ClientsBoardData> {
  const [journey, checkpoints, checkpointFields, clientFields] = await Promise.all([
    getClientsJourneyStatusAction(),
    listCheckpointsAction(),
    listFieldDefinitionsAction("checkpoint"),
    listFieldDefinitionsAction("client"),
  ]);

  return { journey, checkpoints, checkpointFields, clientFields };
}
