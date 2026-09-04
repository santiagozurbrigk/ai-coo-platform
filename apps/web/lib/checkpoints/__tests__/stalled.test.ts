import { describe, expect, it } from "vitest";
import { buildJourney } from "@/lib/checkpoints/journey";
import { buildClientProgress } from "@/lib/checkpoints/progress";
import {
  deriveClientJourneyStatus,
  deriveJourneyStatuses,
  formatOverdue,
  groupEventsByClient,
} from "@/lib/checkpoints/stalled";
import { checkpoint, event, stage } from "@/lib/checkpoints/__tests__/fixtures";

const NOW = new Date("2026-09-03T12:00:00Z");
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

// Recorrido: [a (3d), b (14d)] en Onboarding, [c (30d)] en Escala.
const journey = buildJourney(
  [stage({ id: "s1", name: "Onboarding", color: "cat-1", sortOrder: 1 }),
   stage({ id: "s2", name: "Escala", color: "cat-5", sortOrder: 2 })],
  [
    checkpoint({ id: "a", stageId: "s1", name: "Bienvenida", sortOrder: 1, expectedDays: 3 }),
    checkpoint({ id: "b", stageId: "s1", name: "Primer entregable", sortOrder: 2, expectedDays: 14 }),
    checkpoint({ id: "c", stageId: "s2", name: "Cierre", sortOrder: 1, expectedDays: 30 }),
  ]
).stages;

const statusFor = (events: Parameters<typeof buildClientProgress>[1]) =>
  deriveClientJourneyStatus("cl1", buildClientProgress(journey, events), NOW);

describe("trabado: el caso que el módulo viene a mostrar", () => {
  it("⭐ el próximo hito venció: trabado, con los días de atraso", () => {
    // 'a' se alcanzó hace 20 días; 'b' tiene plazo de 14 → 6 días de atraso.
    const s = statusFor([event({ checkpointId: "a", reachedAt: daysAgo(20) })]);
    expect(s.stalled).toBe(true);
    expect(s.overdueDays).toBe(6);
    expect(s.nextCheckpointName).toBe("Primer entregable");
  });

  it("dentro del plazo: no trabado, y el número dice cuánto falta", () => {
    const s = statusFor([event({ checkpointId: "a", reachedAt: daysAgo(10) })]);
    expect(s.stalled).toBe(false);
    expect(s.overdueDays).toBe(-4);
  });

  it("justo el día del plazo todavía no está trabado", () => {
    const s = statusFor([event({ checkpointId: "a", reachedAt: daysAgo(14) })]);
    expect(s.overdueDays).toBe(0);
    expect(s.stalled).toBe(false);
  });
});

describe("las tres razones por las que no se puede saber", () => {
  it("1 · recorrido completo: no hay próximo hito", () => {
    const s = statusFor([
      event({ id: "1", checkpointId: "a", reachedAt: daysAgo(60) }),
      event({ id: "2", checkpointId: "b", reachedAt: daysAgo(40) }),
      event({ id: "3", checkpointId: "c", reachedAt: daysAgo(5) }),
    ]);
    expect(s.nextCheckpointId).toBeNull();
    expect(s.overdueDays).toBeNull();
    expect(s.stalled).toBe(false);
    expect(s.reached).toBe(3);
  });

  it("2 · el próximo hito no tiene plazo configurado", () => {
    const sinPlazo = buildJourney(
      [stage({ id: "s1" })],
      [
        checkpoint({ id: "a", stageId: "s1", sortOrder: 1, expectedDays: 3 }),
        checkpoint({ id: "b", stageId: "s1", sortOrder: 2, expectedDays: null }),
      ]
    ).stages;
    const s = deriveClientJourneyStatus(
      "cl1",
      buildClientProgress(sinPlazo, [event({ checkpointId: "a", reachedAt: daysAgo(900) })]),
      NOW
    );
    expect(s.overdueDays).toBeNull();
    expect(s.stalled).toBe(false);
  });

  it("3 · ⭐ sin ningún hito registrado no hay desde cuándo contar", () => {
    // Es el límite consciente: un cliente que compró y nunca arrancó no aparece
    // como trabado. Anclarlo a la fecha de alta sería otra decisión.
    const s = statusFor([]);
    expect(s.nextCheckpointName).toBe("Bienvenida");
    expect(s.overdueDays).toBeNull();
    expect(s.stalled).toBe(false);
  });

  it("3b · el hito inmediatamente anterior no está registrado: tampoco se cuenta", () => {
    // Alcanzó 'a' y 'c' pero no 'b'. El próximo pendiente es 'b', cuyo anterior
    // ('a') sí está — así que acá sí se puede. El caso sin anterior es el de
    // abajo: próximo 'a', sin anterior por ser el primero.
    const s = statusFor([event({ checkpointId: "c", reachedAt: daysAgo(90) })]);
    expect(s.nextCheckpointName).toBe("Bienvenida");
    expect(s.overdueDays).toBeNull();
    expect(s.stalled).toBe(false);
  });
});

describe("la fase actual", () => {
  it("es la del hito más avanzado, con su nombre y color", () => {
    const s = statusFor([
      event({ id: "1", checkpointId: "a", reachedAt: daysAgo(30) }),
      event({ id: "2", checkpointId: "b", reachedAt: daysAgo(10) }),
    ]);
    expect(s.currentStageName).toBe("Onboarding");
    expect(s.currentStageColor).toBe("cat-1");
  });

  it("⭐ no retrocede por un hito tardío de una fase temprana", () => {
    const s = statusFor([
      event({ id: "viejo", checkpointId: "c", reachedAt: daysAgo(60) }),
      event({ id: "nuevo", checkpointId: "a", reachedAt: daysAgo(1) }),
    ]);
    expect(s.currentStageName).toBe("Escala");
  });

  it("sin hitos no está en ninguna fase", () => {
    expect(statusFor([]).currentStageName).toBeNull();
  });
});

describe("todos los clientes en una pasada", () => {
  it("resuelve cada cliente con sus propios eventos", () => {
    const events = [
      event({ id: "1", clientId: "cl1", checkpointId: "a", reachedAt: daysAgo(20) }),
      event({ id: "2", clientId: "cl2", checkpointId: "a", reachedAt: daysAgo(2) }),
    ];
    const statuses = deriveJourneyStatuses(
      journey,
      groupEventsByClient(events),
      ["cl1", "cl2", "cl3"],
      NOW
    );
    expect(statuses.get("cl1")?.stalled).toBe(true);
    expect(statuses.get("cl2")?.stalled).toBe(false);
    // Un cliente sin eventos entra igual en el resultado, sin trabar.
    expect(statuses.get("cl3")).toMatchObject({ reached: 0, stalled: false });
  });

  it("agrupa eventos por cliente sin mezclarlos", () => {
    const grouped = groupEventsByClient([
      event({ id: "1", clientId: "cl1" }),
      event({ id: "2", clientId: "cl2" }),
      event({ id: "3", clientId: "cl1" }),
    ]);
    expect(grouped.get("cl1")).toHaveLength(2);
    expect(grouped.get("cl2")).toHaveLength(1);
  });
});

describe("cómo se lee el atraso", () => {
  it("dice los días, en singular y plural", () => {
    expect(formatOverdue(statusFor([event({ checkpointId: "a", reachedAt: daysAgo(15) })])))
      .toBe("trabado hace 1 día");
    expect(formatOverdue(statusFor([event({ checkpointId: "a", reachedAt: daysAgo(20) })])))
      .toBe("trabado hace 6 días");
  });

  it("no dice nada cuando no está trabado", () => {
    expect(formatOverdue(statusFor([]))).toBeNull();
  });
});
