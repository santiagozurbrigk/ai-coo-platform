/**
 * ⭐ Clientes trabados: el derivado que hace útil todo el módulo.
 *
 * Un cliente está trabado cuando su próximo hito pendiente **ya venció**:
 * pasaron más días que su plazo, contados desde el hito inmediatamente anterior
 * del recorrido (decisión de Santiago, 2026-09-03).
 *
 * Es una vista derivada, no un estado guardado — misma idea que el `stalled` del
 * módulo de leads. Se recalcula cada vez y no toca `clients.status`.
 *
 * Lógica pura: no toca base ni red.
 */
import type {
  CheckpointWithEvent,
  ClientJourneyStatus,
  JourneyStageWithCheckpoints,
} from "@/types/checkpoints";
import { buildClientProgress } from "@/lib/checkpoints/progress";
import type { CheckpointEvent } from "@/types/checkpoints";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * El estado del recorrido de un cliente.
 *
 * ⭐ Las tres razones por las que **no se puede saber** si está trabado, y en las
 * que devuelve `overdueDays: null` en vez de un número inventado:
 *
 *   1. El recorrido está completo — no hay próximo hito.
 *   2. El próximo hito **no tiene plazo** configurado.
 *   3. El hito **inmediatamente anterior no está registrado** — no hay desde
 *      cuándo contar. Incluye el caso del primer hito del recorrido, que no
 *      tiene anterior.
 *
 * El caso 3 es el límite consciente del diseño: un cliente que compró y nunca
 * arrancó **no aparece como trabado** hasta que se registre su primer hito.
 * Anclarlo a la fecha de alta sería otra decisión, no una corrección.
 */
export function deriveClientJourneyStatus(
  clientId: string,
  progress: readonly CheckpointWithEvent[],
  now: Date = new Date()
): ClientJourneyStatus {
  const total = progress.length;
  const reached = progress.filter((entry) => entry.event !== null).length;

  // La fase actual es la del hito más avanzado alcanzado, siguiendo el orden del
  // recorrido (no la fecha): un hito tardío de una fase temprana no hace
  // retroceder al cliente.
  let currentStage: CheckpointWithEvent["stage"] | null = null;
  for (const entry of progress) {
    if (entry.event !== null) currentStage = entry.stage;
  }

  const base: ClientJourneyStatus = {
    clientId,
    currentStageId: currentStage?.id ?? null,
    currentStageName: currentStage?.name ?? null,
    currentStageColor: currentStage?.color ?? null,
    reached,
    total,
    nextCheckpointId: null,
    nextCheckpointName: null,
    overdueDays: null,
    stalled: false,
  };

  const nextIndex = progress.findIndex((entry) => entry.event === null);
  // 1 · Recorrido completo (o vacío): no hay próximo hito.
  if (nextIndex === -1) return base;

  const next = progress[nextIndex]!;
  const withNext: ClientJourneyStatus = {
    ...base,
    nextCheckpointId: next.checkpoint.id,
    nextCheckpointName: next.checkpoint.name,
  };

  // 2 · Sin plazo configurado no hay vencimiento posible.
  if (next.checkpoint.expectedDays === null) return withNext;

  // 3 · Sin hito anterior registrado no hay desde cuándo contar.
  const previous = nextIndex > 0 ? progress[nextIndex - 1] : null;
  if (!previous || previous.event === null) return withNext;

  const anchor = new Date(previous.event.reachedAt).getTime();
  if (Number.isNaN(anchor)) return withNext;

  const elapsedDays = Math.floor((now.getTime() - anchor) / DAY_MS);
  const overdueDays = elapsedDays - next.checkpoint.expectedDays;

  return {
    ...withNext,
    overdueDays,
    stalled: overdueDays > 0,
  };
}

/**
 * El estado de todos los clientes de una organización, en una pasada.
 *
 * Recibe el recorrido una sola vez y los eventos agrupados por cliente: cargar
 * el recorrido por cliente haría una consulta por fila de la lista.
 */
export function deriveJourneyStatuses(
  stages: readonly JourneyStageWithCheckpoints[],
  eventsByClient: ReadonlyMap<string, readonly CheckpointEvent[]>,
  clientIds: readonly string[],
  now: Date = new Date()
): Map<string, ClientJourneyStatus> {
  const result = new Map<string, ClientJourneyStatus>();

  for (const clientId of clientIds) {
    const events = eventsByClient.get(clientId) ?? [];
    const progress = buildClientProgress(stages, events);
    result.set(clientId, deriveClientJourneyStatus(clientId, progress, now));
  }

  return result;
}

/** Agrupa una lista plana de eventos por cliente. */
export function groupEventsByClient(
  events: readonly CheckpointEvent[]
): Map<string, CheckpointEvent[]> {
  const map = new Map<string, CheckpointEvent[]>();
  for (const event of events) {
    const list = map.get(event.clientId) ?? [];
    list.push(event);
    map.set(event.clientId, list);
  }
  return map;
}

/** Cómo se lee el atraso. `null` cuando no se puede saber. */
export function formatOverdue(status: ClientJourneyStatus): string | null {
  if (!status.stalled || status.overdueDays === null) return null;
  return status.overdueDays === 1
    ? "trabado hace 1 día"
    : `trabado hace ${status.overdueDays} días`;
}
