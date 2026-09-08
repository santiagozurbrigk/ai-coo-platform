import { describe, expect, it } from "vitest";
import { buildJourney } from "@/lib/checkpoints/journey";
import {
  buildClientProgress,
  isCheckpointReached,
  resolveCurrentStageId,
  summarizeJourneyPosition,
} from "@/lib/checkpoints/progress";
import { checkpoint, event, stage } from "@/lib/checkpoints/__tests__/fixtures";

// Un recorrido de dos fases: [a, b] en Onboarding, [c] en Escala.
const journey = buildJourney(
  [stage({ id: "s1", name: "Onboarding", sortOrder: 1 }), stage({ id: "s2", name: "Escala", sortOrder: 2 })],
  [
    checkpoint({ id: "a", stageId: "s1", sortOrder: 1 }),
    checkpoint({ id: "b", stageId: "s1", sortOrder: 2 }),
    checkpoint({ id: "c", stageId: "s2", sortOrder: 1 }),
  ]
).stages;

describe("el recorrido de un cliente", () => {
  it("marca cada hito como alcanzado o pendiente, en el orden del recorrido", () => {
    const progress = buildClientProgress(journey, [event({ checkpointId: "a" })]);
    expect(progress.map((p) => [p.checkpoint.id, p.event !== null])).toEqual([
      ["a", true],
      ["b", false],
      ["c", false],
    ]);
  });

  it("⭐ un hito alcanzado fuera de orden se muestra como hueco, sin reordenar", () => {
    // Alcanzó el tercero sin el primero: la realidad es desprolija y frenar
    // sería peor que mostrar el hueco.
    const progress = buildClientProgress(journey, [event({ checkpointId: "c" })]);
    expect(progress.map((p) => p.event !== null)).toEqual([false, false, true]);
  });

  it("ignora un evento cuyo checkpoint no está en el recorrido", () => {
    const progress = buildClientProgress(journey, [event({ checkpointId: "fantasma" })]);
    expect(progress.every((p) => p.event === null)).toBe(true);
  });
});

describe("dónde está parado", () => {
  it("cuenta alcanzados y encuentra el próximo pendiente", () => {
    const summary = summarizeJourneyPosition(
      buildClientProgress(journey, [event({ checkpointId: "a" })])
    );
    expect(summary).toMatchObject({ total: 3, reached: 1, currentStageId: "s1" });
    expect(summary.nextCheckpoint?.id).toBe("b");
  });

  it("sin ningún hito, no está en ninguna fase", () => {
    const summary = summarizeJourneyPosition(buildClientProgress(journey, []));
    expect(summary.currentStageId).toBeNull();
    expect(summary.nextCheckpoint?.id).toBe("a");
  });

  it("todo alcanzado: no hay próximo", () => {
    const summary = summarizeJourneyPosition(
      buildClientProgress(journey, [
        event({ id: "1", checkpointId: "a" }),
        event({ id: "2", checkpointId: "b" }),
        event({ id: "3", checkpointId: "c" }),
      ])
    );
    expect(summary.reached).toBe(3);
    expect(summary.nextCheckpoint).toBeNull();
  });

  it("⭐ la fase actual sigue el orden del recorrido, no la fecha del evento", () => {
    // Alcanzó 'c' (Escala) hace un mes y 'a' (Onboarding) hoy. No retrocede a
    // Onboarding: el recorrido manda, no el reloj.
    const summary = summarizeJourneyPosition(
      buildClientProgress(journey, [
        event({ id: "viejo", checkpointId: "c", reachedAt: "2026-08-01T00:00:00Z" }),
        event({ id: "nuevo", checkpointId: "a", reachedAt: "2026-09-03T00:00:00Z" }),
      ])
    );
    expect(summary.currentStageId).toBe("s2");
  });
});

describe("recalcular la fase actual", () => {
  it("es la de la posición más avanzada alcanzada", () => {
    expect(
      resolveCurrentStageId(journey, [event({ checkpointId: "a" }), event({ id: "2", checkpointId: "c" })])
    ).toBe("s2");
  });

  it("⭐ al deshacer el último hito de una fase, la fase vuelve sola", () => {
    // Se recalcula desde el estado nuevo, no se deriva del evento borrado.
    expect(resolveCurrentStageId(journey, [event({ checkpointId: "a" })])).toBe("s1");
    expect(resolveCurrentStageId(journey, [])).toBeNull();
  });
});

describe("isCheckpointReached", () => {
  it("distingue alcanzado de pendiente", () => {
    const progress = buildClientProgress(journey, [event({ checkpointId: "a" })]);
    expect(isCheckpointReached(progress, "a")).toBe(true);
    expect(isCheckpointReached(progress, "b")).toBe(false);
  });
});
