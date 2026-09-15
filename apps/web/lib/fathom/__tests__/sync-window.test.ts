import { describe, expect, it } from "vitest";
import { resolverVentanaDeSync } from "@/lib/fathom/sync-window";

const CONEXION = "2026-09-15T10:00:00.000Z";

describe("resolverVentanaDeSync", () => {
  it("⭐ recién conectado: trae desde la conexión, no el historial", () => {
    // La decisión de fondo: no importar años de grabaciones, porque cada
    // llamada se transcribe y se analiza con IA.
    const ventana = resolverVentanaDeSync(null, CONEXION);
    expect(ventana.desde).toBe(CONEXION);
    expect(ventana.motivo).toBe("desde-la-conexion");
  });

  it("ya sincronizó antes: sigue desde la última vez", () => {
    const ventana = resolverVentanaDeSync("2026-09-20T08:00:00.000Z", CONEXION);
    expect(ventana.desde).toBe("2026-09-20T08:00:00.000Z");
    expect(ventana.motivo).toBe("incremental");
  });

  it("⭐ si la última sincronización quedó ANTES de la conexión, manda la conexión", () => {
    // Síntoma de una reconexión o un reloj mal puesto. Arrancar desde una
    // fecha anterior a la línea de largada traería historial que se decidió
    // no traer.
    const ventana = resolverVentanaDeSync("2026-01-01T00:00:00.000Z", CONEXION);
    expect(ventana.desde).toBe(CONEXION);
    expect(ventana.motivo).toBe("desde-la-conexion");
  });

  it("⭐ sin ninguna fecha NO se inventa un filtro", () => {
    // Un filtro inventado esconde llamadas sin dejar rastro. Preferimos una
    // corrida cara y visible a una pérdida silenciosa.
    const ventana = resolverVentanaDeSync(null, null);
    expect(ventana.desde).toBeNull();
    expect(ventana.motivo).toBe("sin-referencia");
  });

  it("una fecha ilegible se ignora, no rompe", () => {
    expect(resolverVentanaDeSync("el martes", CONEXION).desde).toBe(CONEXION);
    expect(resolverVentanaDeSync(CONEXION, "ayer").desde).toBe(CONEXION);
    expect(resolverVentanaDeSync("ayer", "el martes").desde).toBeNull();
  });

  it("acepta fechas en cualquier formato válido y las normaliza", () => {
    const ventana = resolverVentanaDeSync(null, "2026-09-15");
    expect(ventana.desde).toBe("2026-09-15T00:00:00.000Z");
  });

  it("sin conexión pero con sincronización previa, sigue incremental", () => {
    // Filas viejas, anteriores a que existiera la línea de largada.
    const ventana = resolverVentanaDeSync("2026-08-01T00:00:00.000Z", null);
    expect(ventana.desde).toBe("2026-08-01T00:00:00.000Z");
    expect(ventana.motivo).toBe("incremental");
  });
});
