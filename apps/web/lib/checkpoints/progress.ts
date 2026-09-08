/**
 * El recorrido de un cliente concreto: qué hitos alcanzó y dónde está parado.
 *
 * Lógica pura: no toca base ni red. Es lo que dibuja la línea en la ficha del
 * cliente y lo que C3 va a usar para armar la lista de trabados.
 */
import type {
  Checkpoint,
  CheckpointEvent,
  CheckpointWithEvent,
  JourneyStageWithCheckpoints,
} from "@/types/checkpoints";
import { flattenJourney } from "@/lib/checkpoints/journey";

/**
 * Cruza el recorrido con los eventos de un cliente, en el orden real del camino.
 *
 * Cada hito queda con su evento (alcanzado) o con `null` (pendiente). El orden
 * es el del recorrido, no el de los eventos: un cliente puede alcanzar el tercer
 * hito antes que el primero —la realidad es desprolija— y la línea lo muestra
 * como un hueco, sin reordenar.
 */
export function buildClientProgress(
  stages: readonly JourneyStageWithCheckpoints[],
  events: readonly CheckpointEvent[]
): CheckpointWithEvent[] {
  const eventByCheckpoint = new Map(events.map((event) => [event.checkpointId, event]));

  const result: CheckpointWithEvent[] = [];
  for (const stage of stages) {
    for (const checkpoint of stage.checkpoints) {
      result.push({
        checkpoint,
        stage,
        event: eventByCheckpoint.get(checkpoint.id) ?? null,
      });
    }
  }
  return result;
}

export type JourneyPositionSummary = {
  /** Total de checkpoints del recorrido. */
  total: number;
  /** Cuántos alcanzó. */
  reached: number;
  /** La fase donde está parado: la del último checkpoint alcanzado en el orden. */
  currentStageId: string | null;
  /** El primer checkpoint pendiente — el próximo paso natural. */
  nextCheckpoint: Checkpoint | null;
};

/**
 * Dónde está parado el cliente.
 *
 * La fase actual es la del **último checkpoint alcanzado siguiendo el orden del
 * recorrido**, no la del evento más reciente por fecha: si alguien registró un
 * hito tardío de una fase temprana, el cliente no "retrocede". El recorrido
 * manda, no el reloj.
 */
export function summarizeJourneyPosition(
  progress: readonly CheckpointWithEvent[]
): JourneyPositionSummary {
  const total = progress.length;
  const reached = progress.filter((entry) => entry.event !== null).length;

  let currentStageId: string | null = null;
  let nextCheckpoint: Checkpoint | null = null;

  for (const entry of progress) {
    if (entry.event !== null) {
      currentStageId = entry.stage.id;
    } else if (nextCheckpoint === null) {
      nextCheckpoint = entry.checkpoint;
    }
  }

  return { total, reached, currentStageId, nextCheckpoint };
}

/**
 * La fase que hay que grabar en `clients.current_stage_id` después de un cambio.
 *
 * Se recalcula desde cero sobre el estado nuevo —no se deriva del evento que se
 * acaba de tocar—, así vale igual para registrar y para deshacer: al deshacer el
 * último hito de una fase, el cliente vuelve a la fase anterior solo.
 */
export function resolveCurrentStageId(
  stages: readonly JourneyStageWithCheckpoints[],
  events: readonly CheckpointEvent[]
): string | null {
  const progress = buildClientProgress(stages, events);
  return summarizeJourneyPosition(progress).currentStageId;
}

/**
 * El checkpoint que quedaría "recién alcanzado" si un evento fija el estado del
 * cliente. Sólo los que declaran `setsClientStatus` mueven el estado grueso.
 */
export function statusToApply(checkpoint: Checkpoint): Checkpoint["setsClientStatus"] {
  return checkpoint.setsClientStatus;
}

/** ¿Ya está alcanzado este checkpoint? */
export function isCheckpointReached(
  progress: readonly CheckpointWithEvent[],
  checkpointId: string
): boolean {
  return progress.some(
    (entry) => entry.checkpoint.id === checkpointId && entry.event !== null
  );
}

/** Todos los checkpoints, en el orden del recorrido — reexport de conveniencia. */
export { flattenJourney };
