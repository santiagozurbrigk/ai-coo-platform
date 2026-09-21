/**
 * La fase en la que **está** un cliente, cuando alguien la fijó a mano.
 *
 * ⭐ El problema, con la captura del founder delante: la fase se deduce del
 * último hito registrado. Un cliente que llega directo a «Creando primer
 * webinar» queda en «Sin empezar» hasta que alguien tilde los cuatro hitos de la
 * fase anterior, que nunca hizo. Para decir la verdad sobre dónde está, había
 * que mentir sobre lo que hizo.
 *
 * ⭐ Gana la **más avanzada** entre la fijada a mano y la derivada de los hitos.
 * No "la manual pisa a la derivada": si alguien fija «Onboarding» y después el
 * cliente alcanza un hito de «Post Webinar», el cliente está en Post Webinar.
 * Un recorrido no retrocede porque alguien se haya olvidado de actualizar un
 * selector.
 *
 * Lógica pura: no toca base ni red.
 */
import type { JourneyStageWithCheckpoints } from "@/types/checkpoints";

export type EffectiveStage = {
  stageId: string | null;
  /** Cómo se resolvió, para que la pantalla pueda decirlo. */
  origin: "derived" | "manual" | "none";
};

/**
 * @param stages El recorrido en orden. La posición en este arreglo **es** el orden.
 * @param derivedStageId La fase que sale de los hitos registrados.
 * @param manualStageId La fase que alguien fijó a mano.
 */
export function resolveEffectiveStage(
  stages: readonly Pick<JourneyStageWithCheckpoints, "id">[],
  derivedStageId: string | null,
  manualStageId: string | null
): EffectiveStage {
  const indexOf = (id: string | null) =>
    id === null ? -1 : stages.findIndex((stage) => stage.id === id);

  const derived = indexOf(derivedStageId);
  const manual = indexOf(manualStageId);

  // Una fase fijada que ya no existe —se archivó el recorrido— no cuenta.
  if (manual === -1 && derived === -1) return { stageId: null, origin: "none" };
  if (manual === -1) return { stageId: derivedStageId, origin: "derived" };
  if (derived === -1) return { stageId: manualStageId, origin: "manual" };

  return derived >= manual
    ? { stageId: derivedStageId, origin: "derived" }
    : { stageId: manualStageId, origin: "manual" };
}

/**
 * Los hitos que quedaron **salteados**: los de fases anteriores a la efectiva
 * que nunca se registraron.
 *
 * ⭐ Se muestran en gris, distintos de los pendientes. Un hito salteado no es
 * trabajo que falta —el cliente ya pasó esa fase— pero tampoco es trabajo hecho.
 * Pintarlo como alcanzado habría sido más simple y habría dejado el historial
 * afirmando cosas que no pasaron.
 */
export function skippedCheckpointIds(
  stages: readonly JourneyStageWithCheckpoints[],
  effectiveStageId: string | null,
  reachedCheckpointIds: ReadonlySet<string>
): Set<string> {
  const salteados = new Set<string>();
  if (!effectiveStageId) return salteados;

  const limite = stages.findIndex((stage) => stage.id === effectiveStageId);
  if (limite <= 0) return salteados;

  for (let i = 0; i < limite; i++) {
    for (const checkpoint of stages[i]!.checkpoints) {
      if (!reachedCheckpointIds.has(checkpoint.id)) salteados.add(checkpoint.id);
    }
  }
  return salteados;
}
