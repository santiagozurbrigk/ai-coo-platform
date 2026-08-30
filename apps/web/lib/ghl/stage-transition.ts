/**
 * lib/ghl/stage-transition.ts
 *
 * Deriva la transición de etapa a partir de un webhook de GHL y de la última
 * etapa que OTC conocía de esa oportunidad.
 *
 * ⭐ POR QUÉ ESTE ARCHIVO EXISTE
 *
 * `OpportunityStageUpdate` trae la etapa **nueva** y nada más: ni la anterior ni
 * el momento del cambio (verificado el 2026-08-30, ver
 * docs/external-apis/gohighlevel/RESUMEN-OTC.md §4). Y la API v3 no tiene
 * endpoint de historial. Así que la transición hay que reconstruirla contra el
 * estado que OTC ya tenía guardado.
 *
 * Puro: recibe el estado previo y el evento, devuelve la transición. Se testea
 * sin base de datos.
 */

import type { NormalizedOpportunityEvent } from "./opportunity-event";

/** Última etapa conocida de una oportunidad, tal como está en la tabla propia. */
export type KnownOpportunityState = {
  stageId: string | null;
  status: string | null;
};

export type TransitionKind = "created" | "stage_change" | "status_change";

export type TransitionDraft = {
  opportunityId: string;
  pipelineId: string | null;
  /**
   * `null` en el alta: no hay etapa anterior conocida.
   *
   * También es `null` la primera vez que OTC ve una oportunidad que ya existía
   * en GHL. Poner ahí la primera etapa del pipeline sería inventar un recorrido
   * que nadie observó.
   */
  fromStageId: string | null;
  toStageId: string | null;
  kind: TransitionKind;
  status: string | null;
  /** Momento de recepción del webhook — GHL no manda el del cambio. */
  occurredAt: string;
  eventId: string | null;
};

/**
 * Devuelve la transición a registrar, o `null` si el evento no mueve nada.
 *
 * Un `OpportunityUpdate` que sólo cambió el nombre o el responsable no es una
 * transición y no debe sumar a ningún conteo de etapa.
 *
 * `previous` es `null` cuando OTC nunca vio esta oportunidad. Eso puede ser un
 * alta real (`OpportunityCreate`) o una oportunidad vieja que recién ahora se
 * mueve; en los dos casos la etapa de origen es desconocida y queda en `null`.
 */
export function deriveTransition(
  previous: KnownOpportunityState | null,
  event: NormalizedOpportunityEvent,
  receivedAt: string
): TransitionDraft | null {
  // Una baja no es una transición de etapa: la oportunidad deja de existir, no
  // avanza. Se refleja en el estado, no en el historial.
  if (event.isDelete) return null;

  const base = {
    opportunityId: event.opportunityId,
    pipelineId: event.pipelineId,
    status: event.status,
    occurredAt: receivedAt,
    eventId: event.eventId,
  };

  if (previous === null) {
    return { ...base, fromStageId: null, toStageId: event.stageId, kind: "created" };
  }

  // Un evento sin etapa no puede afirmar que la oportunidad se movió: se
  // compara sólo el estado.
  if (event.stageId !== null && event.stageId !== previous.stageId) {
    return {
      ...base,
      fromStageId: previous.stageId,
      toStageId: event.stageId,
      kind: "stage_change",
    };
  }

  if (event.status !== null && event.status !== previous.status) {
    return {
      ...base,
      fromStageId: previous.stageId,
      toStageId: event.stageId ?? previous.stageId,
      kind: "status_change",
    };
  }

  return null;
}

/**
 * ¿El período pedido cae dentro del historial que OTC realmente observó?
 *
 * ⭐ REGLA DEL PERÍODO CIEGO (§9.1 de FUNNELS_ARCHITECTURE.md aplicada al tiempo)
 *
 * El historial de etapas arranca con el primer webhook. Preguntar por un período
 * anterior devuelve cero transiciones, pero ese cero significa "OTC no estaba
 * mirando", no "no pasó nada". Reportarlo como 0 haría que el módulo marque como
 * rotura de negocio un hueco de instrumentación.
 *
 * Se exige que el período empiece **en o después** del borde: un período que lo
 * cruza a la mitad daría un conteo parcial presentado como completo.
 */
export function isPeriodCovered(
  historySince: string | null | undefined,
  periodStartIso: string
): boolean {
  if (!historySince) return false;
  const since = Date.parse(historySince);
  const start = Date.parse(periodStartIso);
  if (!Number.isFinite(since) || !Number.isFinite(start)) return false;
  return start >= since;
}
