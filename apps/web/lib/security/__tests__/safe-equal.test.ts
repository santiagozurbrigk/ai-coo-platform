import { describe, expect, it } from "vitest";
import { safeEqual } from "../safe-equal";

describe("safeEqual", () => {
  it("compara por contenido, sin depender del largo", () => {
    expect(safeEqual("Bearer abc", "Bearer abc")).toBe(true);
    expect(safeEqual("Bearer abd", "Bearer abc")).toBe(false);
    expect(safeEqual("Bearer", "Bearer abc")).toBe(false);
  });

  it("nunca acepta un valor ausente ni un secreto vacío", () => {
    expect(safeEqual(null, "x")).toBe(false);
    expect(safeEqual(undefined, "x")).toBe(false);
    expect(safeEqual("", "")).toBe(false);
  });
});
