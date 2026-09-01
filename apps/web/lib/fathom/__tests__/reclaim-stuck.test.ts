import { describe, expect, it } from "vitest";
import {
  ABANDON_AFTER_MS,
  STUCK_AFTER_MS,
  shouldReclaim,
} from "@/lib/fathom/reclaim-stuck";

const NOW = new Date("2026-09-01T12:00:00Z");

function startedAgo(ms: number) {
  return {
    id: "call-1",
    processing_started_at: new Date(NOW.getTime() - ms).toISOString(),
  };
}

describe("shouldReclaim", () => {
  it("no rescata una llamada que recién empezó a procesarse", () => {
    expect(shouldReclaim(startedAgo(60_000), NOW)).toBe(false);
  });

  it("rescata una que pasó el umbral de trabada", () => {
    expect(shouldReclaim(startedAgo(STUCK_AFTER_MS + 1_000), NOW)).toBe(true);
  });

  it("es inclusivo en el borde exacto del umbral", () => {
    expect(shouldReclaim(startedAgo(STUCK_AFTER_MS), NOW)).toBe(true);
  });

  it("deja de rescatar más allá de la ventana de abandono", () => {
    // Evita que una falla sistemática —una API key revocada— reintente el mismo
    // lote durante semanas.
    expect(shouldReclaim(startedAgo(ABANDON_AFTER_MS + 1_000), NOW)).toBe(false);
  });

  it("no toca las llamadas trabadas antes de que existiera la marca", () => {
    // ⭐ Es la decisión del usuario, implementada sin caso especial: las 51
    // llamadas trabadas desde julio no tienen `processing_started_at`, así que
    // quedan como están. Sin marca de inicio, no hay rescate.
    expect(shouldReclaim({ id: "vieja", processing_started_at: null }, NOW)).toBe(false);
  });

  it("ignora una marca con fecha inválida", () => {
    expect(
      shouldReclaim({ id: "x", processing_started_at: "no-es-fecha" }, NOW)
    ).toBe(false);
  });

  it("ignora una marca en el futuro: es un reloj desfasado, no una trabada", () => {
    expect(shouldReclaim(startedAgo(-60_000), NOW)).toBe(false);
  });
});
