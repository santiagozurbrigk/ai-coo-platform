import { describe, expect, it } from "vitest";
import { parseOneOnOneTasks } from "@/lib/fathom/one-on-one-tasks";

/**
 * ⭐ Estos tests nacen de una falla real del 2026-09-21.
 *
 * La primera versión leía la respuesta con un `JSON.parse` del array entero: o
 * salía todo o no salía nada. En la primera 1-1 subida de verdad, el modelo
 * gastó 570 tokens contestando —o sea, contestó— y la ficha mostró «Sin tareas
 * todavía». Peor: el código marcaba la llamada como ya procesada, así que no
 * había forma de reintentar ni de saber qué había contestado.
 *
 * Cada caso de acá es una forma en que un modelo chico contesta *bien* sin
 * contestar *exacto*.
 */
describe("⭐ leer la respuesta del modelo sin perder la tanda", () => {
  const TAREAS = `[
    {"title":"Grabar el VSL de la landing","description":"Full cam, el mismo día","owner":"client","due_date":"2026-09-22"},
    {"title":"Mandar la plantilla de anuncios","description":"","owner":"coach","due_date":null}
  ]`;

  it("lee el caso normal", () => {
    const { tasks, outcome } = parseOneOnOneTasks(TAREAS);
    expect(outcome).toBe("ok");
    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toEqual({
      title: "Grabar el VSL de la landing",
      description: "Full cam, el mismo día",
      owner: "client",
      dueDate: "2026-09-22",
    });
    expect(tasks[1].owner).toBe("coach");
    expect(tasks[1].dueDate).toBeNull();
  });

  it("aguanta el bloque de markdown", () => {
    expect(parseOneOnOneTasks("```json\n" + TAREAS + "\n```").tasks).toHaveLength(2);
  });

  it("aguanta que el modelo explique antes y después", () => {
    const respuesta = `Analicé la transcripción. Estos son los compromisos:\n\n${TAREAS}\n\nEspero que sirva.`;
    expect(parseOneOnOneTasks(respuesta).tasks).toHaveLength(2);
  });

  /** Es lo que más rompe un JSON generado: una coma que sobra. */
  it("aguanta una coma colgante", () => {
    const roto = `[{"title":"Grabar el VSL","owner":"client","due_date":null},]`;
    const { tasks, outcome } = parseOneOnOneTasks(roto);
    expect(outcome).toBe("ok");
    expect(tasks).toHaveLength(1);
  });

  /**
   * ⭐ El caso que justifica todo: una tarea rota no puede tirar las otras tres.
   */
  it("salva las tareas sanas cuando una viene rota", () => {
    const mezcla = `[
      {"title":"Grabar el VSL","owner":"client"},
      {"title":"Rota, le falta la comilla,"owner":"coach"},
      {"title":"Armar el calendario de contenido","owner":"client"}
    ]`;
    const { tasks, outcome } = parseOneOnOneTasks(mezcla);
    expect(outcome).toBe("ok");
    expect(tasks.map((t) => t.title)).toEqual([
      "Grabar el VSL",
      "Armar el calendario de contenido",
    ]);
  });

  it("aguanta un objeto por línea, sin array", () => {
    const sinArray = `{"title":"Grabar el VSL","owner":"client"}\n{"title":"Mandar la plantilla","owner":"coach"}`;
    const { tasks, outcome } = parseOneOnOneTasks(sinArray);
    expect(outcome).toBe("ok");
    expect(tasks).toHaveLength(2);
  });

  it("aguanta que venga envuelto en un objeto", () => {
    const envuelto = `{"tareas": ${TAREAS}}`;
    expect(parseOneOnOneTasks(envuelto).tasks).toHaveLength(2);
  });

  it("acepta las claves en castellano, que es como se le habla al modelo", () => {
    const español = `[{"titulo":"Grabar el VSL","descripcion":"con luz","responsable":"equipo","fecha":"2026-10-01"}]`;
    const { tasks } = parseOneOnOneTasks(español);
    expect(tasks[0].title).toBe("Grabar el VSL");
    expect(tasks[0].owner).toBe("coach");
    expect(tasks[0].dueDate).toBe("2026-10-01");
  });
});

describe("⭐ 'sin tareas' y 'no se entendió' son cosas distintas", () => {
  it("un array vacío es una respuesta válida: no hubo compromisos", () => {
    expect(parseOneOnOneTasks("[]")).toEqual({ tasks: [], outcome: "ok" });
    expect(parseOneOnOneTasks("```json\n[]\n```").outcome).toBe("ok");
  });

  it("sin respuesta es vacío", () => {
    expect(parseOneOnOneTasks("   ").outcome).toBe("vacio");
  });

  /**
   * ⭐ Esto es lo que antes se confundía con "no hay tareas", y por eso la
   * llamada quedaba marcada como procesada y sin forma de reintentar.
   */
  it("una respuesta que no se puede leer se marca como ilegible", () => {
    expect(parseOneOnOneTasks("No encontré tareas en esta llamada.").outcome).toBe(
      "ilegible"
    );
    expect(parseOneOnOneTasks('{"error":"no pude procesar"}').outcome).toBe("ilegible");
  });

  it("objetos sin título no son tareas", () => {
    const { tasks, outcome } = parseOneOnOneTasks(`[{"description":"algo"},{"title":"  "}]`);
    expect(tasks).toHaveLength(0);
    // El array se entendió: está vacío de tareas, no ilegible.
    expect(outcome).toBe("ok");
  });
});

describe("lo que no se entiende no se inventa", () => {
  it("una fecha en otro formato se descarta, no se adivina", () => {
    for (const fecha of ['"la semana que viene"', '"15/10/2026"', '"2026-10"', "null"]) {
      const { tasks } = parseOneOnOneTasks(
        `[{"title":"Grabar","owner":"client","due_date":${fecha}}]`
      );
      expect(tasks[0].dueDate).toBeNull();
    }
  });

  it("un responsable desconocido cae en el cliente, no se pierde la tarea", () => {
    const { tasks } = parseOneOnOneTasks(`[{"title":"Grabar","owner":"marciano"}]`);
    expect(tasks[0].owner).toBe("client");
  });

  it("corta el título y el detalle en vez de rechazarlos", () => {
    const largo = "a".repeat(400);
    const { tasks } = parseOneOnOneTasks(
      `[{"title":"${largo}","description":"${largo.repeat(3)}"}]`
    );
    expect(tasks[0].title).toHaveLength(120);
    expect(tasks[0].description).toHaveLength(500);
  });

  it("no acepta una tanda infinita", () => {
    const muchas = Array.from(
      { length: 40 },
      (_, i) => `{"title":"Tarea ${i}","owner":"client"}`
    ).join(",");
    expect(parseOneOnOneTasks(`[${muchas}]`).tasks).toHaveLength(25);
  });
});
