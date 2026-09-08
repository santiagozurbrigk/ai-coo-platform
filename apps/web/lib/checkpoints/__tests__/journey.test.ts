import { describe, expect, it } from "vitest";
import {
  buildJourney,
  cumulativeExpectedDays,
  flattenJourney,
  previousCheckpoint,
} from "@/lib/checkpoints/journey";
import { checkpoint, stage } from "@/lib/checkpoints/__tests__/fixtures";

describe("armar el recorrido", () => {
  const stages = [
    stage({ id: "s2", name: "Escala", sortOrder: 2 }),
    stage({ id: "s1", name: "Onboarding", sortOrder: 1 }),
  ];
  const checkpoints = [
    checkpoint({ id: "b", stageId: "s1", name: "Accesos", sortOrder: 2 }),
    checkpoint({ id: "a", stageId: "s1", name: "Bienvenida", sortOrder: 1 }),
    checkpoint({ id: "c", stageId: "s2", name: "Primer lanzamiento", sortOrder: 1 }),
  ];

  it("ordena las fases y agrupa cada checkpoint bajo la suya", () => {
    const { stages: result } = buildJourney(stages, checkpoints);
    expect(result.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(result[0]?.checkpoints.map((c) => c.id)).toEqual(["a", "b"]);
    expect(result[1]?.checkpoints.map((c) => c.id)).toEqual(["c"]);
  });

  it("desempata por nombre cuando dos comparten el orden", () => {
    const { stages: result } = buildJourney(
      [stage({ id: "s1", sortOrder: 0 })],
      [
        checkpoint({ id: "z", stageId: "s1", name: "Zeta", sortOrder: 0 }),
        checkpoint({ id: "a", stageId: "s1", name: "Alfa", sortOrder: 0 }),
      ]
    );
    expect(result[0]?.checkpoints.map((c) => c.id)).toEqual(["a", "z"]);
  });

  it("deja afuera lo archivado y lo incluye cuando se pide", () => {
    const archivedStage = stage({ id: "s3", sortOrder: 9, archivedAt: "2026-09-01T00:00:00Z" });
    const archivedCp = checkpoint({
      id: "d",
      stageId: "s1",
      archivedAt: "2026-09-01T00:00:00Z",
    });

    const visible = buildJourney([...stages, archivedStage], [...checkpoints, archivedCp]);
    expect(visible.stages.map((s) => s.id)).toEqual(["s1", "s2"]);
    expect(visible.stages[0]?.checkpoints.map((c) => c.id)).toEqual(["a", "b"]);

    const all = buildJourney([...stages, archivedStage], [...checkpoints, archivedCp], {
      includeArchived: true,
    });
    expect(all.stages.map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
    expect(all.stages[0]?.checkpoints).toHaveLength(3);
  });

  it("⭐ un checkpoint sin fase se devuelve aparte, no desaparece", () => {
    // Si se descartara en silencio, alguien configuraría un hito y no volvería
    // a verlo nunca, sin ningún aviso.
    const { stages: result, orphanCheckpoints } = buildJourney(stages, [
      ...checkpoints,
      checkpoint({ id: "huerfano", stageId: "fase-borrada" }),
    ]);
    expect(orphanCheckpoints.map((c) => c.id)).toEqual(["huerfano"]);
    expect(result.flatMap((s) => s.checkpoints.map((c) => c.id))).not.toContain("huerfano");
  });

  it("un checkpoint bajo una fase archivada no es huérfano: su fase existe", () => {
    const archivedStage = stage({ id: "s9", archivedAt: "2026-09-01T00:00:00Z" });
    const { orphanCheckpoints } = buildJourney(
      [archivedStage],
      [checkpoint({ id: "x", stageId: "s9" })]
    );
    expect(orphanCheckpoints).toEqual([]);
  });

  it("no muta los arreglos que recibe", () => {
    const input = [...stages];
    buildJourney(input, checkpoints);
    expect(input.map((s) => s.id)).toEqual(["s2", "s1"]);
  });
});

describe("la secuencia real del recorrido", () => {
  const ordered = flattenJourney(
    buildJourney(
      [stage({ id: "s1", sortOrder: 1 }), stage({ id: "s2", sortOrder: 2 })],
      [
        checkpoint({ id: "a", stageId: "s1", sortOrder: 1, expectedDays: 3 }),
        checkpoint({ id: "b", stageId: "s1", sortOrder: 2, expectedDays: 5 }),
        checkpoint({ id: "c", stageId: "s2", sortOrder: 1, expectedDays: 10 }),
      ]
    ).stages
  );

  it("atraviesa las fases en orden", () => {
    expect(ordered.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("el plazo acumulado suma los pasos anteriores, porque cada uno cuenta desde el anterior", () => {
    expect(cumulativeExpectedDays(ordered, "a")).toBe(3);
    expect(cumulativeExpectedDays(ordered, "b")).toBe(8);
    expect(cumulativeExpectedDays(ordered, "c")).toBe(18);
  });

  it("⭐ un solo paso sin plazo deja el acumulado en 'no se puede saber'", () => {
    // Sumar sólo los que tienen plazo daría un número menor al real y
    // parecería una respuesta.
    const conHueco = flattenJourney(
      buildJourney(
        [stage({ id: "s1" })],
        [
          checkpoint({ id: "a", stageId: "s1", sortOrder: 1, expectedDays: null }),
          checkpoint({ id: "b", stageId: "s1", sortOrder: 2, expectedDays: 5 }),
        ]
      ).stages
    );
    expect(cumulativeExpectedDays(conHueco, "b")).toBeNull();
  });

  it("un checkpoint que no está en el recorrido no tiene plazo acumulado", () => {
    expect(cumulativeExpectedDays(ordered, "inexistente")).toBeNull();
  });

  it("el paso anterior es el punto desde el que se cuenta", () => {
    expect(previousCheckpoint(ordered, "b")?.id).toBe("a");
    expect(previousCheckpoint(ordered, "c")?.id).toBe("b");
  });

  it("el primer checkpoint no tiene anterior", () => {
    expect(previousCheckpoint(ordered, "a")).toBeNull();
    expect(previousCheckpoint(ordered, "inexistente")).toBeNull();
  });
});
