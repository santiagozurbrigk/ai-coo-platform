/**
 * Detección de fuente vacía — I-3.
 *
 * Cierra el agujero que quedó abierto en la Fase 1: una fuente bindeada a una
 * tabla que nunca se pobló devolvía `0`, y el módulo lee ese cero como rotura de
 * negocio (docs/FUNNELS_ARCHITECTURE.md §9.1).
 */

import { describe, it, expect } from "vitest";
import {
  resolveCallOutcomes,
  resolveWithSignal,
  type CallStatus,
} from "../source-signal";

describe("resultados de llamadas", () => {
  it("cuenta asistencia y cierres cuando hay resultados cargados", () => {
    const statuses: CallStatus[] = ["closed", "closed", "not_closed", "no_show", "scheduled"];
    const result = resolveCallOutcomes(statuses);
    expect(result.attended).toBe(3); // 2 closed + 1 not_closed
    expect(result.closed).toBe(2);
    expect(result.total).toBe(5);
    expect(result.hasOutcomes).toBe(true);
  });

  it("con TODAS las llamadas en scheduled devuelve null, no cero", () => {
    // Es el caso que motivó esta unidad: reportar 0 diría que nadie asistió a
    // ninguna llamada, cuando la verdad es que nadie cargó el resultado.
    const result = resolveCallOutcomes(["scheduled", "scheduled", "scheduled"]);
    expect(result.attended).toBeNull();
    expect(result.closed).toBeNull();
    expect(result.total).toBe(3);
    expect(result.hasOutcomes).toBe(false);
  });

  it("una llamada asistida cuenta como asistencia aunque no tenga resultado", () => {
    // `attended` es lo que significa `showed` en GHL. Dejarla afuera
    // subestimaría el denominador de la tasa de cierre.
    const result = resolveCallOutcomes(["attended", "closed", "scheduled"]);
    expect(result.attended).toBe(2);
    expect(result.closed).toBe(1);
  });

  it("una cancelada no cuenta como asistencia ni como resultado cargado", () => {
    // La llamada nunca ocurrió: no dice nada sobre si los leads se presentan.
    const result = resolveCallOutcomes(["scheduled", "cancelled", "cancelled"]);
    expect(result.attended).toBeNull();
    expect(result.hasOutcomes).toBe(false);
  });

  it("un no_show SÍ cuenta como resultado cargado", () => {
    // Alguien miró la llamada y registró que el lead no vino. Eso es señal: el
    // cero de asistencia que sale de acá es real.
    const result = resolveCallOutcomes(["scheduled", "no_show"]);
    expect(result.hasOutcomes).toBe(true);
    expect(result.attended).toBe(0);
    expect(result.closed).toBe(0);
  });

  it("una sola llamada cerrada alcanza para dar señal", () => {
    const result = resolveCallOutcomes(["scheduled", "scheduled", "closed"]);
    expect(result.attended).toBe(1);
    expect(result.closed).toBe(1);
  });

  it("sin llamadas devuelve ceros sin señal", () => {
    const result = resolveCallOutcomes([]);
    expect(result.total).toBe(0);
    expect(result.hasOutcomes).toBe(false);
    expect(result.attended).toBeNull();
  });

  it("todas cerradas da asistencia igual a total", () => {
    const result = resolveCallOutcomes(["closed", "closed"]);
    expect(result.attended).toBe(2);
    expect(result.closed).toBe(2);
  });

  it("todas no cerradas: asistieron pero no compraron", () => {
    const result = resolveCallOutcomes(["not_closed", "not_closed"]);
    expect(result.attended).toBe(2);
    expect(result.closed).toBe(0);
  });
});

describe("fuente vacía vs cero real", () => {
  const never = async () => 0;
  const had = async () => 42;
  const failed = async () => null;

  it("un conteo positivo pasa derecho, sin consultar el histórico", async () => {
    let llamado = false;
    const result = await resolveWithSignal(15, async () => {
      llamado = true;
      return 0;
    });
    expect(result).toBe(15);
    expect(llamado).toBe(false);
  });

  it("cero en el período con histórico previo es un cero real", async () => {
    expect(await resolveWithSignal(0, had)).toBe(0);
  });

  it("cero en el período sin ningún histórico es falta de datos", async () => {
    expect(await resolveWithSignal(0, never)).toBeNull();
  });

  it("un null de entrada se propaga", async () => {
    expect(await resolveWithSignal(null, had)).toBeNull();
  });

  it("si la consulta del histórico falla, no se afirma un cero", async () => {
    expect(await resolveWithSignal(0, failed)).toBeNull();
  });
});

describe("la diferencia que hace en el embudo", () => {
  it("una org recién configurada no muestra ceros por todos lados", async () => {
    // Antes de I-3 esto habría dado 0 en cada etapa, que el diagnóstico lee como
    // catástrofe de negocio. Ahora dice "sin datos", que es la verdad.
    const orgNueva = await resolveWithSignal(0, async () => 0);
    expect(orgNueva).toBeNull();
  });

  it("una org con historia que tuvo un mal período sí muestra el cero", async () => {
    const malPeriodo = await resolveWithSignal(0, async () => 500);
    expect(malPeriodo).toBe(0);
  });
});
