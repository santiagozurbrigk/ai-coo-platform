import { describe, expect, it } from "vitest";
import { mapGHLStatus } from "@/lib/ghl/sync-appointments";
import { callIsSale } from "@/lib/closing/call-status";

/**
 * Regresión del defecto más caro de la Fase 0.
 *
 * `showed` estaba mapeado a `closed`, que en OTC es una venta cerrada y alimenta
 * la etapa Cash del embudo y la facturación: cada lead que se presentaba a una
 * llamada se contaba como una venta.
 */
describe("mapeo de estados de GHL", () => {
  it("asistir NUNCA es vender", () => {
    const mapped = mapGHLStatus("showed");
    expect(mapped).toBe("attended");
    expect(callIsSale(mapped!)).toBe(false);
  });

  it("ningún estado de GHL produce una venta por su cuenta", () => {
    // Una venta sólo la puede declarar una persona cargando el cobro. Si algún
    // día un estado de GHL vuelve a mapear a `closed`, este test lo frena.
    const todos = ["showed", "noshow", "booked", "confirmed", "cancelled", "invalid"] as const;
    for (const status of todos) {
      const mapped = mapGHLStatus(status);
      if (mapped) expect(callIsSale(mapped)).toBe(false);
    }
  });

  it("una cancelación se importa como cancelada, no como inasistencia", () => {
    // Antes se descartaba en el filtro: la llamada cancelada no existía para
    // OTC. Y en Calendly se guardaba como `no_show`, que infla la tasa de
    // inasistencia con turnos que nadie dejó plantado.
    expect(mapGHLStatus("cancelled")).toBe("cancelled");
    expect(mapGHLStatus("cancelled")).not.toBe("no_show");
  });

  it("una inasistencia real sigue siendo no_show", () => {
    expect(mapGHLStatus("noshow")).toBe("no_show");
  });

  it("los turnos reservados quedan agendados", () => {
    expect(mapGHLStatus("booked")).toBe("scheduled");
    expect(mapGHLStatus("confirmed")).toBe("scheduled");
  });

  it("`invalid` se omite: no representa una cita real", () => {
    expect(mapGHLStatus("invalid")).toBeNull();
  });
});
