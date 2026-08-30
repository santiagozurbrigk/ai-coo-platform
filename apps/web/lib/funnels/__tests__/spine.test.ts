import { describe, it, expect } from "vitest";
import {
  SPINE_STAGES,
  SPINE_STAGE_IDS,
  getSpineStage,
  isSpineStageId,
  spineStageOrder,
} from "../spine";

describe("spine", () => {
  it("tiene 7 etapas", () => {
    expect(SPINE_STAGES).toHaveLength(7);
  });

  it("va de Spend a Cash", () => {
    expect(SPINE_STAGES[0]!.id).toBe("spend");
    expect(SPINE_STAGES[SPINE_STAGES.length - 1]!.id).toBe("cash");
  });

  it("los órdenes son 1..7 consecutivos", () => {
    expect(SPINE_STAGES.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("no hay ids duplicados", () => {
    expect(new Set(SPINE_STAGE_IDS).size).toBe(SPINE_STAGE_IDS.length);
  });

  it("spineStageOrder respeta la secuencia del documento", () => {
    expect(spineStageOrder("click")).toBeLessThan(spineStageOrder("lead"));
    expect(spineStageOrder("intent")).toBeLessThan(spineStageOrder("cash"));
  });

  it("getSpineStage falla ruidosamente con un id desconocido", () => {
    // @ts-expect-error — id inválido a propósito
    expect(() => getSpineStage("marketing")).toThrow(/Etapa de spine desconocida/);
  });

  it("isSpineStageId discrimina correctamente", () => {
    expect(isSpineStageId("engaged")).toBe(true);
    expect(isSpineStageId("engagement")).toBe(false);
  });
});
