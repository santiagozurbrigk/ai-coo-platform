import type { ClosingCallStatus } from "@/types/closing";

/**
 * Vocabulario único de estados de una llamada de cierre.
 *
 * ⭐ **Por qué existe este archivo.** El estado de una llamada estaba
 * interpretado a mano en quince archivos: cada consumidor decidía por su cuenta
 * qué contaba como asistencia y qué como venta. Así fue como `showed` de GHL
 * terminó guardado como `closed` —asistir contado como vender— y como una
 * cancelación de Calendly terminó guardada como `no_show`. Cada vez que se
 * agrega un estado hay que actualizar todos esos lugares, y el compilador no
 * avisa cuando falta uno.
 *
 * Acá viven la lista, las etiquetas y los predicados. Los consumidores preguntan
 * en vez de comparar strings.
 *
 * ⭐ **Tres ejes, no uno.** `status` responde tres preguntas distintas y por eso
 * cuesta leerlo:
 *
 * | Eje          | Pregunta                  | Estados                          |
 * |--------------|---------------------------|----------------------------------|
 * | Ciclo de vida| ¿el turno ocurrió?        | scheduled · cancelled · el resto |
 * | Asistencia   | ¿el lead vino?            | no_show vs attended/closed/…     |
 * | Resultado    | ¿compró?                  | closed · not_closed              |
 *
 * La Fase 2 los separa en campos propios. Mientras tanto, los predicados de acá
 * son la única forma correcta de leerlos.
 */

/** Orden de lectura: del turno agendado al desenlace. */
export const CLOSING_CALL_STATUSES: readonly ClosingCallStatus[] = [
  "scheduled",
  "attended",
  "closed",
  "not_closed",
  "no_show",
  "cancelled",
] as const;

export const CLOSING_CALL_STATUS_LABEL: Record<ClosingCallStatus, string> = {
  scheduled: "Agendada",
  attended: "Asistió — sin resultado",
  closed: "Cerrada",
  not_closed: "No cerrada",
  no_show: "No show",
  cancelled: "Cancelada",
};

/** Descripción larga, para tooltips y vacíos. */
export const CLOSING_CALL_STATUS_HINT: Record<ClosingCallStatus, string> = {
  scheduled: "El turno está agendado, o ya pasó y nadie cargó qué ocurrió.",
  attended: "El lead asistió. Falta cargar si compró o no.",
  closed: "El lead asistió y compró.",
  not_closed: "El lead asistió y no compró.",
  no_show: "El lead no se presentó a una llamada que sí ocurrió.",
  cancelled: "El turno se canceló: la llamada nunca ocurrió.",
};

/**
 * ¿La llamada llegó a ocurrir?
 *
 * `cancelled` es lo que separa "no vino" de "no hubo llamada". Confundirlos
 * infla la tasa de inasistencia con turnos que nadie dejó plantado.
 */
export function callHappened(status: ClosingCallStatus): boolean {
  return status !== "scheduled" && status !== "cancelled";
}

/**
 * ¿El lead se presentó?
 *
 * `attended` cuenta: es asistencia confirmada por el proveedor a la que todavía
 * no se le cargó resultado. Dejarlo afuera subestimaría la asistencia real, que
 * es el denominador de la tasa de cierre.
 */
export function callWasAttended(status: ClosingCallStatus): boolean {
  return status === "attended" || status === "closed" || status === "not_closed";
}

/** ¿Terminó en venta? Sólo `closed`, y sólo cuando lo cargó una persona. */
export function callIsSale(status: ClosingCallStatus): boolean {
  return status === "closed";
}

/**
 * ¿Falta cargar el desenlace?
 *
 * Es la cola de trabajo del closer: turnos que ya pasaron sin resultado, más
 * los que el proveedor marcó como asistidos sin decir en qué terminaron.
 */
export function needsDisposition(
  status: ClosingCallStatus,
  scheduledAt: string | Date,
  now: Date = new Date()
): boolean {
  if (status === "attended") return true;
  if (status !== "scheduled") return false;
  const at = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(at.getTime())) return false;
  return at.getTime() < now.getTime();
}

/**
 * ¿Una persona puede cargarle un resultado?
 *
 * Antes la UI exigía `scheduled`, así que una llamada que GHL marcaba como
 * asistida quedaba sin forma de cerrarse desde OTC.
 */
export function acceptsManualOutcome(status: ClosingCallStatus): boolean {
  return status === "scheduled" || status === "attended";
}

export function isClosingCallStatus(value: unknown): value is ClosingCallStatus {
  return (
    typeof value === "string" &&
    (CLOSING_CALL_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * ¿Un sync automático puede reescribir el estado de esta llamada?
 *
 * ⭐ Este predicado es la razón por la que el seguimiento de la Fase 2 puede
 * existir. Los syncs de Calendly y GHL reescriben `status` en cada corrida, y
 * hasta la Fase 0 sólo respetaban `closed`: un `not_closed` o un `no_show`
 * cargado por un closer volvía a `scheduled` en el próximo cron, cada hora.
 */
export function syncMayOverwriteStatus(current: {
  status: ClosingCallStatus;
  statusSource?: string | null;
}): boolean {
  if (current.statusSource === "manual") return false;
  // Legado: las filas anteriores a la Fase 0 quedaron en `status_source='sync'`
  // aunque su cierre lo hubiera cargado una persona, porque la columna no
  // existía. Sin esta línea, el próximo sync devolvería a `attended` un cierre
  // viejo de GHL — justo el dato que la corrección de `showed` busca proteger.
  if (current.status === "closed") return false;
  return true;
}
