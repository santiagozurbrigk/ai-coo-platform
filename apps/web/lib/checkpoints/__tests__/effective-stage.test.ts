import { describe, expect, it } from "vitest";
import {
  resolveEffectiveStage,
  skippedCheckpointIds,
} from "@/lib/checkpoints/effective-stage";
import type { Checkpoint, JourneyStageWithCheckpoints } from "@/types/checkpoints";

function checkpoint(id: string, stageId: string): Checkpoint {
  return {
    id,
    organizationId: "org",
    stageId,
    name: id,
    description: null,
    sortOrder: 0,
    setsClientStatus: null,
    expectedDays: null,
    metricSchema: [],
    productId: null,
    archivedAt: null,
    createdAt: "",
    updatedAt: "",
  };
}

function stage(id: string, checkpointIds: string[]): JourneyStageWithCheckpoints {
  return {
    id,
    organizationId: "org",
    name: id,
    color: "neutral",
    sortOrder: 0,
    archivedAt: null,
    createdAt: "",
    updatedAt: "",
    checkpoints: checkpointIds.map((c) => checkpoint(c, id)),
  } as JourneyStageWithCheckpoints;
}

/** El recorrido real del founder, simplificado. */
const RECORRIDO = [
  stage("onboarding", ["o1", "o2"]),
  stage("principiante", ["p1", "p2"]),
  stage("webinar", ["w1", "w2"]),
  stage("post", ["x1"]),
];

describe("⭐ la fase efectiva del cliente", () => {
  it("sin nada, no está en ninguna fase", () => {
    expect(resolveEffectiveStage(RECORRIDO, null, null)).toEqual({
      stageId: null,
      origin: "none",
    });
  });

  it("sin fase manual, manda la derivada de los hitos", () => {
    expect(resolveEffectiveStage(RECORRIDO, "principiante", null)).toEqual({
      stageId: "principiante",
      origin: "derived",
    });
  });

  /**
   * ⭐ El caso del pedido: un cliente entra directo a hacer un webinar. Antes
   * quedaba en «Sin empezar» hasta tildar hitos que nunca hizo.
   */
  it("sin hitos registrados, manda la fase fijada a mano", () => {
    expect(resolveEffectiveStage(RECORRIDO, null, "webinar")).toEqual({
      stageId: "webinar",
      origin: "manual",
    });
  });

  it("gana la más avanzada: la manual empuja hacia adelante", () => {
    expect(resolveEffectiveStage(RECORRIDO, "onboarding", "webinar")).toEqual({
      stageId: "webinar",
      origin: "manual",
    });
  });

  /**
   * ⭐ Un recorrido no retrocede porque alguien se haya olvidado de actualizar
   * un selector: si el cliente alcanzó un hito de una fase más avanzada, está
   * ahí aunque la fijada diga otra cosa.
   */
  it("gana la más avanzada: los hitos ganan a una manual vieja", () => {
    expect(resolveEffectiveStage(RECORRIDO, "post", "onboarding")).toEqual({
      stageId: "post",
      origin: "derived",
    });
  });

  it("empate: se queda con la derivada, que es la que tiene hitos detrás", () => {
    expect(resolveEffectiveStage(RECORRIDO, "webinar", "webinar")).toEqual({
      stageId: "webinar",
      origin: "derived",
    });
  });

  it("una fase fijada que ya no existe se ignora", () => {
    expect(resolveEffectiveStage(RECORRIDO, "principiante", "archivada")).toEqual({
      stageId: "principiante",
      origin: "derived",
    });
    expect(resolveEffectiveStage(RECORRIDO, null, "archivada")).toEqual({
      stageId: null,
      origin: "none",
    });
  });
});

describe("⭐ los hitos salteados", () => {
  it("son los de fases anteriores que nadie registró", () => {
    const salteados = skippedCheckpointIds(RECORRIDO, "webinar", new Set());
    expect([...salteados].sort()).toEqual(["o1", "o2", "p1", "p2"]);
  });

  /** Un hito que sí se registró no está salteado: está hecho. */
  it("no marca los que sí se alcanzaron", () => {
    const salteados = skippedCheckpointIds(RECORRIDO, "webinar", new Set(["o1", "p1"]));
    expect([...salteados].sort()).toEqual(["o2", "p2"]);
  });

  it("los de la fase actual y las siguientes son pendientes, no salteados", () => {
    const salteados = skippedCheckpointIds(RECORRIDO, "webinar", new Set());
    expect(salteados.has("w1")).toBe(false);
    expect(salteados.has("x1")).toBe(false);
  });

  it("en la primera fase, o sin fase, no hay nada salteado", () => {
    expect(skippedCheckpointIds(RECORRIDO, "onboarding", new Set()).size).toBe(0);
    expect(skippedCheckpointIds(RECORRIDO, null, new Set()).size).toBe(0);
  });
});
