import { describe, expect, it } from "vitest";
import { filterTasksByAssignee } from "@/lib/workboard/group-tasks";
import type { WorkboardTask } from "@/types/workboard";

function tarea(parcial: Partial<WorkboardTask>): WorkboardTask {
  return {
    id: "t1",
    status: "todo",
    title: "Tarea",
    description: "",
    area: "general",
    priority: "medium",
    assignees: [],
    assigneeIds: [],
    tags: [],
    position: 0,
    linkedDocuments: [],
    attachments: [],
    ...parcial,
  } as WorkboardTask;
}

describe("filterTasksByAssignee con varios responsables", () => {
  it("⭐ encuentra la tarea si sos uno de los responsables, no sólo el primero", () => {
    // El modo de falla que esto evita: filtrás por tu nombre y no aparece algo
    // que sí es tuyo, porque figurás segundo.
    const compartida = tarea({ id: "compartida", assigneeIds: ["ana", "beto"] });
    expect(filterTasksByAssignee([compartida], "beto")).toHaveLength(1);
    expect(filterTasksByAssignee([compartida], "ana")).toHaveLength(1);
  });

  it("no la devuelve para alguien que no está", () => {
    const compartida = tarea({ assigneeIds: ["ana", "beto"] });
    expect(filterTasksByAssignee([compartida], "carla")).toHaveLength(0);
  });

  it("⭐ una tarea vieja, con un solo responsable y sin lista, se sigue encontrando", () => {
    // Las tareas anteriores a la columna nueva tienen sólo `assigneeId`.
    const vieja = tarea({ assigneeIds: [], assigneeId: "ana" });
    expect(filterTasksByAssignee([vieja], "ana")).toHaveLength(1);
  });

  it("\"sin asignar\" no incluye una tarea con responsables", () => {
    const conDuenio = tarea({ assigneeIds: ["ana"] });
    const huerfana = tarea({ id: "huerfana" });
    const resultado = filterTasksByAssignee([conDuenio, huerfana], "unassigned");
    expect(resultado).toHaveLength(1);
    expect(resultado[0]!.id).toBe("huerfana");
  });

  it("⭐ una tarea vieja con responsable NO cuenta como sin asignar", () => {
    const vieja = tarea({ assigneeIds: [], assigneeId: "ana" });
    expect(filterTasksByAssignee([vieja], "unassigned")).toHaveLength(0);
  });

  it("\"todas\" devuelve todo sin mirar nada", () => {
    const tareas = [tarea({ id: "a" }), tarea({ id: "b", assigneeIds: ["ana"] })];
    expect(filterTasksByAssignee(tareas, "all")).toHaveLength(2);
  });
});
