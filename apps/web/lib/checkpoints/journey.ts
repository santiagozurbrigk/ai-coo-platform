/**
 * Armar el recorrido: fases ordenadas, cada una con sus checkpoints.
 *
 * Lógica pura: no toca base ni red.
 */
import type {
  Checkpoint,
  JourneyStage,
  JourneyStageWithCheckpoints,
} from "@/types/checkpoints";

/**
 * El recorrido tal como se dibuja.
 *
 * Un checkpoint cuya fase no existe **no se pierde en silencio**: se devuelve
 * aparte, para que la pantalla pueda mostrarlo en vez de dejar al usuario con un
 * hito que configuró y no aparece más.
 */
export function buildJourney(
  stages: readonly JourneyStage[],
  checkpoints: readonly Checkpoint[],
  options: { includeArchived?: boolean } = {}
): { stages: JourneyStageWithCheckpoints[]; orphanCheckpoints: Checkpoint[] } {
  const includeArchived = options.includeArchived ?? false;

  const visibleStages = stages
    .filter((stage) => includeArchived || stage.archivedAt === null)
    .slice()
    .sort(byOrder);

  const stageIds = new Set(visibleStages.map((stage) => stage.id));
  const allStageIds = new Set(stages.map((stage) => stage.id));

  const visibleCheckpoints = checkpoints.filter(
    (checkpoint) => includeArchived || checkpoint.archivedAt === null
  );

  const grouped = new Map<string, Checkpoint[]>();
  const orphans: Checkpoint[] = [];

  for (const checkpoint of visibleCheckpoints) {
    // Un checkpoint bajo una fase archivada no es huérfano: su fase existe.
    if (!allStageIds.has(checkpoint.stageId)) {
      orphans.push(checkpoint);
      continue;
    }
    if (!stageIds.has(checkpoint.stageId)) continue;
    const list = grouped.get(checkpoint.stageId) ?? [];
    list.push(checkpoint);
    grouped.set(checkpoint.stageId, list);
  }

  return {
    stages: visibleStages.map((stage) => ({
      ...stage,
      checkpoints: (grouped.get(stage.id) ?? []).slice().sort(byOrder),
    })),
    orphanCheckpoints: orphans.sort(byOrder),
  };
}

function byOrder(
  a: { sortOrder: number; name: string },
  b: { sortOrder: number; name: string }
): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "es");
}

/**
 * Los checkpoints de todo el recorrido, en el orden real en que se atraviesan.
 *
 * Es la secuencia sobre la que se cuenta el plazo: `expected_days` se mide
 * **desde el checkpoint anterior de esta lista**, no desde el alta del cliente
 * (decisión de Santiago, 2026-09-02). Lo consume C2 y C3.
 */
export function flattenJourney(
  stages: readonly JourneyStageWithCheckpoints[]
): Checkpoint[] {
  return stages.flatMap((stage) => stage.checkpoints);
}

/**
 * Cuántos días debería tardar el recorrido hasta un checkpoint dado.
 *
 * ⭐ Devuelve `null` en cuanto **un solo** paso del camino no tiene plazo. Un
 * recorrido a medio configurar no produce una estimación optimista: produce
 * "no se puede saber". Sumar sólo los que tienen plazo daría un número menor
 * al real y parecería una respuesta.
 */
export function cumulativeExpectedDays(
  ordered: readonly Checkpoint[],
  checkpointId: string
): number | null {
  let total = 0;

  for (const checkpoint of ordered) {
    if (checkpoint.expectedDays === null) return null;
    total += checkpoint.expectedDays;
    if (checkpoint.id === checkpointId) return total;
  }

  // El checkpoint no está en el recorrido.
  return null;
}

/** El paso anterior en el recorrido — el punto desde el que se cuenta el plazo. */
export function previousCheckpoint(
  ordered: readonly Checkpoint[],
  checkpointId: string
): Checkpoint | null {
  const index = ordered.findIndex((checkpoint) => checkpoint.id === checkpointId);
  if (index <= 0) return null;
  return ordered[index - 1] ?? null;
}
