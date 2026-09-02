import { describe, expect, it } from "vitest";
import {
  deriveFieldKey,
  deriveFieldKeyOrError,
  isValidFieldKey,
} from "@/lib/custom-fields/key";

describe("derivar la clave de un campo", () => {
  it("saca acentos, baja a minúsculas y une con guion bajo", () => {
    expect(deriveFieldKey("Tipo de win")).toBe("tipo_de_win");
    expect(deriveFieldKey("Facturación al mes 3")).toBe("facturacion_al_mes_3");
    expect(deriveFieldKey("Ñandú")).toBe("nandu");
  });

  it("colapsa separadores y no deja guiones sueltos en los bordes", () => {
    expect(deriveFieldKey("  ¿Cuánto   facturó?  ")).toBe("cuanto_facturo");
    expect(deriveFieldKey("Fase / etapa")).toBe("fase_etapa");
  });

  it("no arranca con dígito", () => {
    expect(deriveFieldKey("3 meses")).toBe("campo_3_meses");
  });

  it("devuelve vacío cuando no queda nada usable, en vez de inventar una clave", () => {
    expect(deriveFieldKey("🎯🔥")).toBe("");
    expect(deriveFieldKey("   ")).toBe("");
  });
});

describe("validar una clave", () => {
  it("acepta lo que produce la derivación", () => {
    expect(isValidFieldKey("tipo_de_win")).toBe(true);
  });

  it("rechaza claves reservadas: chocarían con columnas propias", () => {
    expect(isValidFieldKey("id")).toBe(false);
    expect(isValidFieldKey("metrics")).toBe(false);
  });

  it("rechaza mayúsculas, espacios y vacío", () => {
    expect(isValidFieldKey("Tipo")).toBe(false);
    expect(isValidFieldKey("tipo de win")).toBe(false);
    expect(isValidFieldKey("")).toBe(false);
  });
});

describe("derivar explicando el problema", () => {
  it("rechaza un nombre que ya está en uso y lo dice con la etiqueta, no con la clave", () => {
    const result = deriveFieldKeyOrError("Tipo de win", ["tipo_de_win"]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Tipo de win");
  });

  it("acepta un nombre parecido pero distinto", () => {
    const result = deriveFieldKeyOrError("Tipo de cliente", ["tipo_de_win"]);
    expect(result).toEqual({ ok: true, key: "tipo_de_cliente" });
  });

  it("dos etiquetas que sólo difieren en acentos son la misma columna", () => {
    // Es el caso que rompería el índice único de la base si no se cortara acá.
    const first = deriveFieldKeyOrError("Facturación", []);
    expect(first.ok && first.key).toBe("facturacion");
    const second = deriveFieldKeyOrError("Facturacion", ["facturacion"]);
    expect(second.ok).toBe(false);
  });
});
