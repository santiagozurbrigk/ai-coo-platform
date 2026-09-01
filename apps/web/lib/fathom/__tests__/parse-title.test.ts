import { describe, expect, it } from "vitest";
import { parseCallTitle } from "@/lib/fathom/parse-title";

describe("parseCallTitle — la convención", () => {
  it("lee tipo y nombre del formato acordado", () => {
    expect(parseCallTitle("Llamada de venta - Mariano Gonzales")).toEqual({
      purpose: "sales",
      counterpartyName: "Mariano Gonzales",
    });
  });

  it("acepta los distintos guiones y separadores", () => {
    for (const sep of ["—", "–", "-", ":", "|"]) {
      const parsed = parseCallTitle(`Venta ${sep} Ana Pérez`);
      expect(parsed?.purpose).toBe("sales");
      expect(parsed?.counterpartyName).toBe("Ana Pérez");
    }
  });

  it("ignora mayúsculas y acentos en el tipo", () => {
    expect(parseCallTitle("CONSULTORÍA - Juan")?.purpose).toBe("delivery");
    expect(parseCallTitle("reunion de equipo - Q3")?.purpose).toBe("team");
  });

  it("saca los prefijos que no son parte del nombre", () => {
    expect(parseCallTitle("Venta - lead Mariano")?.counterpartyName).toBe("Mariano");
    expect(parseCallTitle("Entrega - cliente Ana")?.counterpartyName).toBe("Ana");
  });

  it("limpia emojis, como los que ya tiene la base", () => {
    // Nombres reales: "🩷 Diana Villarreal".
    expect(parseCallTitle("Venta - 🩷 Diana Villarreal")?.counterpartyName).toBe(
      "Diana Villarreal"
    );
  });
});

describe("parseCallTitle — lo que ya no confunde", () => {
  it('"Weekly de ventas" no es una llamada de venta', () => {
    // El clasificador viejo la mandaba a venta por contener "venta" en cualquier
    // parte del texto. Sin separador no hay convención, así que no se clasifica.
    expect(parseCallTitle("Weekly de ventas")).toBeNull();
  });

  it('"Reunión con Juan" no es una reunión de equipo', () => {
    // El viejo la mandaba a equipo por contener "reunion".
    expect(parseCallTitle("Reunión con Juan")).toBeNull();
  });

  it("un tipo desconocido a la izquierda no se fuerza a nada", () => {
    expect(parseCallTitle("Café - Mariano")).toBeNull();
  });

  it("los títulos genéricos de Fathom no producen nada", () => {
    // Son el 86% de los títulos reales.
    expect(parseCallTitle("Impromptu Google Meet Meeting")).toBeNull();
    expect(parseCallTitle("Impromptu Zoom Meeting")).toBeNull();
  });

  it("no inventa con entradas vacías o raras", () => {
    expect(parseCallTitle("")).toBeNull();
    expect(parseCallTitle(null)).toBeNull();
    expect(parseCallTitle(undefined)).toBeNull();
    expect(parseCallTitle(" - ")).toBeNull();
    expect(parseCallTitle("Venta -")).toBeNull();
  });

  it("un tipo válido sin nombre igual clasifica el propósito", () => {
    const parsed = parseCallTitle("Reunión de equipo - Q3");
    expect(parsed?.purpose).toBe("team");
  });

  it("un nombre de una sola letra no cuenta como nombre", () => {
    expect(parseCallTitle("Venta - A")?.counterpartyName).toBeNull();
  });
});
