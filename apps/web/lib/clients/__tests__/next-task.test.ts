import { describe, expect, it } from "vitest";
import { isOverdue, pickNextTask } from "@/lib/clients/next-task";
import type { ClientTask } from "@/types/client-tasks";

function task(partial: Partial<ClientTask> & { id: string }): ClientTask {
  return {
    clientId: "c1",
    title: partial.id,
    description: "",
    owner: "client",
    status: "pending",
    dueDate: null,
    source: "manual",
    sourceCallId: null,
    sourceCallTitle: null,
    sourceCallDate: null,
    workboardTaskId: null,
    completedAt: null,
    createdAt: "2026-09-01T00:00:00Z",
    ...partial,
  };
}

describe("⭐ cuál es la próxima tarea del cliente", () => {
  it("sin tareas no hay próxima", () => {
    expect(pickNextTask([])).toBeNull();
  });

  it("una tarea hecha nunca es la próxima", () => {
    expect(pickNextTask([task({ id: "a", status: "done" })])).toBeNull();
  });

  it("la de fecha más próxima gana", () => {
    const elegida = pickNextTask([
      task({ id: "lejos", dueDate: "2026-12-01" }),
      task({ id: "cerca", dueDate: "2026-09-25" }),
    ]);
    expect(elegida?.id).toBe("cerca");
  });

  /** Lo vencido es lo más urgente que hay: no puede quedar segundo. */
  it("una vencida gana a una futura", () => {
    const elegida = pickNextTask([
      task({ id: "futura", dueDate: "2026-12-01" }),
      task({ id: "vencida", dueDate: "2026-01-10" }),
    ]);
    expect(elegida?.id).toBe("vencida");
  });

  /** Una fecha es un compromiso; lo sin fecha puede esperar por definición. */
  it("con fecha gana a sin fecha", () => {
    const elegida = pickNextTask([
      task({ id: "sin-fecha", createdAt: "2026-08-01T00:00:00Z" }),
      task({ id: "con-fecha", dueDate: "2026-12-31" }),
    ]);
    expect(elegida?.id).toBe("con-fecha");
  });

  it("entre dos sin fecha gana la más vieja", () => {
    const elegida = pickNextTask([
      task({ id: "nueva", createdAt: "2026-09-10T00:00:00Z" }),
      task({ id: "vieja", createdAt: "2026-08-01T00:00:00Z" }),
    ]);
    expect(elegida?.id).toBe("vieja");
  });

  /**
   * ⭐ El dueño no desempata: una del coach vencida es más urgente que una del
   * cliente para la semana que viene, y al revés.
   */
  it("el dueño no cambia el orden", () => {
    const elegida = pickNextTask([
      task({ id: "cliente-lejos", owner: "client", dueDate: "2026-12-01" }),
      task({ id: "coach-cerca", owner: "coach", dueDate: "2026-09-22" }),
    ]);
    expect(elegida?.id).toBe("coach-cerca");
  });

  it("saltea las hechas aunque tengan la fecha más próxima", () => {
    const elegida = pickNextTask([
      task({ id: "hecha", status: "done", dueDate: "2026-01-01" }),
      task({ id: "pendiente", dueDate: "2026-11-01" }),
    ]);
    expect(elegida?.id).toBe("pendiente");
  });
});

describe("tareas vencidas", () => {
  const hoy = new Date("2026-09-21T10:00:00Z");

  it("vencida es la de ayer o antes", () => {
    expect(isOverdue(task({ id: "a", dueDate: "2026-09-20" }), hoy)).toBe(true);
  });

  it("la de hoy todavía no venció", () => {
    expect(isOverdue(task({ id: "a", dueDate: "2026-09-21" }), hoy)).toBe(false);
  });

  it("sin fecha no vence, y una hecha tampoco", () => {
    expect(isOverdue(task({ id: "a" }), hoy)).toBe(false);
    expect(
      isOverdue(task({ id: "a", dueDate: "2020-01-01", status: "done" }), hoy)
    ).toBe(false);
  });
});
