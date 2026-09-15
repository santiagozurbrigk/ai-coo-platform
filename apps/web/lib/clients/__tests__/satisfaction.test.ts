import { describe, expect, it } from "vitest";
import {
  DIAS_PARA_QUE_VENZA,
  esNivelValido,
  resolverSatisfaccion,
} from "@/lib/clients/satisfaction";

const HOY = new Date(2026, 8, 15);

function haceDias(dias: number): string {
  return new Date(2026, 8, 15 - dias).toISOString();
}

describe("resolverSatisfaccion", () => {
  it("sin nivel cargado no hay nada que mostrar", () => {
    expect(resolverSatisfaccion(null, null, HOY).cargada).toBe(false);
    expect(resolverSatisfaccion("", haceDias(1), HOY).cargada).toBe(false);
  });

  it("un nivel que no existe se ignora", () => {
    // Un valor inventado no se muestra como si fuera una opción válida.
    expect(resolverSatisfaccion("contentísimo", haceDias(1), HOY).cargada).toBe(false);
  });

  it("una marca reciente no está vencida", () => {
    const estado = resolverSatisfaccion("conforme", haceDias(5), HOY);
    expect(estado).toMatchObject({ cargada: true, nivel: "conforme", vencida: false });
  });

  it(`⭐ pasados ${DIAS_PARA_QUE_VENZA} días se marca como vencida`, () => {
    // El punto del dato: una impresión vieja no describe la relación de hoy.
    expect(resolverSatisfaccion("muy_conforme", haceDias(61), HOY)).toMatchObject({
      vencida: true,
    });
    expect(resolverSatisfaccion("muy_conforme", haceDias(60), HOY)).toMatchObject({
      vencida: false,
    });
  });

  it("⭐ un nivel sin fecha se trata como vencido", () => {
    // Si no se sabe cuándo se marcó, darlo por fresco sería mentir.
    expect(resolverSatisfaccion("conforme", null, HOY)).toMatchObject({
      cargada: true,
      vencida: true,
    });
  });

  it("una fecha ilegible también se trata como vencida", () => {
    expect(resolverSatisfaccion("conforme", "el martes", HOY)).toMatchObject({
      vencida: true,
    });
  });

  it("⭐ una fecha futura no vence: es un reloj mal puesto, no un dato viejo", () => {
    const estado = resolverSatisfaccion("conforme", haceDias(-30), HOY);
    expect(estado).toMatchObject({ vencida: false, diasDesdeLaMarca: 0 });
  });

  it("cuenta los días desde la marca", () => {
    expect(resolverSatisfaccion("neutral", haceDias(12), HOY)).toMatchObject({
      diasDesdeLaMarca: 12,
    });
  });
});

describe("esNivelValido", () => {
  it("acepta los cinco niveles y nada más", () => {
    expect(esNivelValido("en_riesgo")).toBe(true);
    expect(esNivelValido("muy_conforme")).toBe(true);
    expect(esNivelValido("regular")).toBe(false);
    expect(esNivelValido(3)).toBe(false);
  });
});
