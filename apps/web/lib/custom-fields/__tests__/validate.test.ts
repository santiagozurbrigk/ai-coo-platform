import { describe, expect, it } from "vitest";
import {
  validateFieldValue,
  validateFieldValues,
} from "@/lib/custom-fields/validate";
import { field, option } from "@/lib/custom-fields/__tests__/fixtures";

describe("campo obligatorio", () => {
  it("rechaza el vacío y nombra la columna", () => {
    const result = validateFieldValue(field({ isRequired: true }), "");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Tipo de win");
  });

  it("un campo opcional sin cargar vale null, no cero ni vacío", () => {
    expect(validateFieldValue(field(), "")).toEqual({ ok: true, value: null });
  });
});

describe("texto", () => {
  const text = field({ fieldType: "text", key: "logro", label: "Logro" });

  it("recorta los espacios de los bordes", () => {
    expect(validateFieldValue(text, "  cerró 3 clientes  ")).toEqual({
      ok: true,
      value: "cerró 3 clientes",
    });
  });

  it("rechaza un texto desmedido en vez de truncarlo en silencio", () => {
    expect(validateFieldValue(text, "x".repeat(2001)).ok).toBe(false);
  });

  it("rechaza un número donde va texto", () => {
    expect(validateFieldValue(text, 42).ok).toBe(false);
  });
});

describe("número y dinero", () => {
  const number = field({ fieldType: "number", key: "clientes", label: "Clientes" });
  const money = field({
    fieldType: "currency",
    key: "facturacion",
    label: "Facturación",
    currency: "USD",
  });

  it("acepta lo que una persona escribe de verdad", () => {
    expect(validateFieldValue(number, "12")).toEqual({ ok: true, value: 12 });
    expect(validateFieldValue(money, "1.234,56")).toEqual({ ok: true, value: 1234.56 });
    expect(validateFieldValue(money, "1,234.56")).toEqual({ ok: true, value: 1234.56 });
    expect(validateFieldValue(money, "1234.56")).toEqual({ ok: true, value: 1234.56 });
  });

  it("un monto que no se entiende se rechaza — no se guarda como cero", () => {
    // ⭐ La regla del CLAUDE.md: un cobro cuyo monto no se lee no es un cobro de cero.
    // El vacío no entra acá: un campo opcional sin cargar no es un error, es un null.
    for (const input of ["mil dólares", "1.2.3", "--5", "1,2,3"]) {
      expect(validateFieldValue(money, input).ok).toBe(false);
    }
  });

  it("el cero es un valor cargado, no un vacío", () => {
    expect(validateFieldValue(number, 0)).toEqual({ ok: true, value: 0 });
  });

  it("acepta negativos: una métrica puede caer", () => {
    expect(validateFieldValue(number, "-3")).toEqual({ ok: true, value: -3 });
  });
});

describe("fecha", () => {
  const date = field({ fieldType: "date", key: "cuando", label: "Cuándo" });

  it("acepta una fecha ISO", () => {
    expect(validateFieldValue(date, "2026-09-03")).toEqual({
      ok: true,
      value: "2026-09-03",
    });
  });

  it("rechaza una fecha que no existe en vez de correrla al mes siguiente", () => {
    expect(validateFieldValue(date, "2026-02-31").ok).toBe(false);
  });

  it("rechaza otros formatos", () => {
    expect(validateFieldValue(date, "03/09/2026").ok).toBe(false);
  });
});

describe("listas de opciones", () => {
  const select = field({
    options: [option("facturacion"), option("hito"), option("vieja", { archived: true })],
  });
  const multi = field({ ...select, fieldType: "multi_select" });

  it("acepta una opción disponible", () => {
    expect(validateFieldValue(select, "facturacion")).toEqual({
      ok: true,
      value: "facturacion",
    });
  });

  it("rechaza una opción archivada: si no, archivar no significaría nada", () => {
    expect(validateFieldValue(select, "vieja").ok).toBe(false);
  });

  it("rechaza un valor que no está en el catálogo", () => {
    expect(validateFieldValue(select, "inventada").ok).toBe(false);
  });

  it("la lista múltiple deduplica y conserva el orden de carga", () => {
    expect(validateFieldValue(multi, ["hito", "facturacion", "hito"])).toEqual({
      ok: true,
      value: ["hito", "facturacion"],
    });
  });

  it("la lista múltiple rechaza el conjunto entero si una opción no vale", () => {
    expect(validateFieldValue(multi, ["hito", "inventada"]).ok).toBe(false);
  });
});

describe("validar la fila entera", () => {
  const fields = [
    field({ id: "1", key: "tipo_de_win", isRequired: true, options: [option("hito")] }),
    field({ id: "2", key: "logro", label: "Logro", fieldType: "text" }),
    field({ id: "3", key: "monto", label: "Monto", fieldType: "currency" }),
  ];

  it("junta todos los errores, no sólo el primero", () => {
    const result = validateFieldValues(fields, { monto: "mil" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(["monto", "tipo_de_win"]);
    }
  });

  it("guarda sólo lo que se completó: un campo vacío no ocupa lugar en el jsonb", () => {
    const result = validateFieldValues(fields, { tipo_de_win: "hito", logro: "  " });
    expect(result).toEqual({ ok: true, values: { tipo_de_win: "hito" } });
  });

  it("ignora claves que no corresponden a ningún campo", () => {
    const result = validateFieldValues(fields, { tipo_de_win: "hito", fantasma: "x" });
    expect(result.ok && result.values).toEqual({ tipo_de_win: "hito" });
  });
});
