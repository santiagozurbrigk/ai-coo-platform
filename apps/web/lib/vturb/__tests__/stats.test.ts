import { describe, expect, it } from "vitest";
import { isClosedPeriod } from "../stats";

describe("isClosedPeriod", () => {
  it("un período que terminó ayer está cerrado", () => {
    // Ya no puede cambiar: se puede cachear sin vencimiento.
    expect(isClosedPeriod("2026-08-29", "2026-08-30")).toBe(true);
  });

  it("un período que termina hoy sigue abierto", () => {
    // Pueden entrar sesiones nuevas en lo que queda del día.
    expect(isClosedPeriod("2026-08-30", "2026-08-30")).toBe(false);
  });

  it("un período que termina en el futuro sigue abierto", () => {
    expect(isClosedPeriod("2026-09-15", "2026-08-30")).toBe(false);
  });
});
