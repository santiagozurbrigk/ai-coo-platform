import { describe, expect, it } from "vitest";
import {
  fieldValueToText,
  formatFieldValue,
} from "@/lib/custom-fields/format";
import { rowToFieldDefinition, parseOptions } from "@/lib/custom-fields/mapper";
import { field, option } from "@/lib/custom-fields/__tests__/fixtures";
import type { FieldDefinitionRow } from "@/types/custom-fields";

describe("cómo se lee un valor cargado", () => {
  it("un campo sin cargar queda vacío — la UI muestra un guion, no un cero", () => {
    expect(formatFieldValue(field(), null).isEmpty).toBe(true);
  });

  it("una opción se muestra por su etiqueta, aunque lo guardado sea el value", () => {
    const select = field({ options: [option("facturacion", { label: "Facturación" })] });
    expect(fieldValueToText(select, "facturacion")).toBe("Facturación");
  });

  it("⭐ renombrar la etiqueta no toca el dato: el mismo value se lee distinto", () => {
    const before = field({ options: [option("facturacion", { label: "Facturación" })] });
    const after = field({ options: [option("facturacion", { label: "Ingresos" })] });
    expect(fieldValueToText(before, "facturacion")).toBe("Facturación");
    expect(fieldValueToText(after, "facturacion")).toBe("Ingresos");
  });

  it("una opción archivada se sigue mostrando donde ya estaba cargada", () => {
    const select = field({
      options: [option("vieja", { label: "Mentalidad", archived: true })],
    });
    const formatted = formatFieldValue(select, "vieja");
    expect(formatted.parts[0]?.text).toBe("Mentalidad");
    expect(formatted.parts[0]?.unknownOption).toBe(false);
  });

  it("un valor que no está en el catálogo se muestra crudo y marcado, no vacío", () => {
    const formatted = formatFieldValue(field({ options: [option("hito")] }), "borrada");
    expect(formatted.parts[0]).toMatchObject({ text: "borrada", unknownOption: true });
  });

  it("la lista múltiple se lee separada por comas", () => {
    const multi = field({
      fieldType: "multi_select",
      options: [option("a", { label: "Uno" }), option("b", { label: "Dos" })],
    });
    expect(fieldValueToText(multi, ["a", "b"])).toBe("Uno, Dos");
  });

  it("el número lleva su unidad y el dinero su moneda", () => {
    const pct = field({ fieldType: "number", unit: "%" });
    expect(fieldValueToText(pct, 12.5)).toContain("%");

    const usd = field({ fieldType: "currency", currency: "USD" });
    expect(fieldValueToText(usd, 1500)).toMatch(/1\.500/);
  });

  it("la fecha se lee sin correrse de día por zona horaria", () => {
    const date = field({ fieldType: "date" });
    expect(fieldValueToText(date, "2026-01-01")).toContain("2026");
    expect(fieldValueToText(date, "2026-01-01")).toContain("1");
  });
});

describe("leer una fila de la base", () => {
  const row: FieldDefinitionRow = {
    id: "f1",
    organization_id: "org-1",
    entity: "win",
    key: "tipo_de_win",
    label: "Tipo de win",
    description: null,
    field_type: "select",
    options: [{ value: "hito", label: "Hito", color: "cat-2" }],
    options_source: "inline",
    unit: null,
    currency: null,
    is_required: false,
    sort_order: 0,
    archived_at: null,
    created_at: "2026-09-03T00:00:00.000Z",
    updated_at: "2026-09-03T00:00:00.000Z",
  };

  it("mapea una fila válida", () => {
    const mapped = rowToFieldDefinition(row);
    expect(mapped?.options).toEqual([
      { value: "hito", label: "Hito", color: "cat-2", archived: false },
    ]);
  });

  it("descarta una fila con un tipo que el código no conoce", () => {
    expect(rowToFieldDefinition({ ...row, field_type: "rating" })).toBeNull();
    expect(rowToFieldDefinition({ ...row, entity: "invoice" })).toBeNull();
  });

  it("un color desconocido cae a neutral en vez de romper la celda", () => {
    const mapped = rowToFieldDefinition({
      ...row,
      options: [{ value: "hito", label: "Hito", color: "#ff0000" }],
    });
    expect(mapped?.options[0]?.color).toBe("neutral");
  });
});

describe("opciones cargadas a mano en el jsonb", () => {
  it("descarta lo que no se entiende en vez de crear opciones sin nombre", () => {
    expect(parseOptions([null, 3, {}, { value: "  " }, "hito"])).toEqual([]);
  });

  it("deduplica por value: dos opciones iguales serían dos veces la misma", () => {
    expect(parseOptions([{ value: "a" }, { value: "a", label: "A" }])).toHaveLength(1);
  });

  it("una opción sin etiqueta se muestra por su clave, no en blanco", () => {
    expect(parseOptions([{ value: "hito" }])[0]?.label).toBe("hito");
  });

  it("un jsonb que no es una lista no rompe nada", () => {
    expect(parseOptions({ value: "hito" })).toEqual([]);
    expect(parseOptions(null)).toEqual([]);
  });
});
