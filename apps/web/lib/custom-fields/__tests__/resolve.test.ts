import { describe, expect, it } from "vitest";
import {
  activeFields,
  fieldsForValues,
  findOption,
  hasValue,
  pickKnownValues,
  resolveFieldOptions,
} from "@/lib/custom-fields/resolve";
import { field, option } from "@/lib/custom-fields/__tests__/fixtures";

describe("qué campos se ofrecen", () => {
  it("ordena por sort_order y deja afuera los archivados", () => {
    const fields = [
      field({ id: "b", key: "b", sortOrder: 2 }),
      field({ id: "a", key: "a", sortOrder: 1 }),
      field({ id: "z", key: "z", sortOrder: 0, archivedAt: "2026-09-01T00:00:00Z" }),
    ];
    expect(activeFields(fields).map((f) => f.id)).toEqual(["a", "b"]);
  });

  it("no muta el arreglo que recibe", () => {
    const fields = [field({ id: "b", sortOrder: 2 }), field({ id: "a", sortOrder: 1 })];
    activeFields(fields);
    expect(fields.map((f) => f.id)).toEqual(["b", "a"]);
  });
});

describe("un campo archivado sigue mostrándose donde ya se cargó", () => {
  const archived = field({
    id: "old",
    key: "fase",
    sortOrder: 5,
    archivedAt: "2026-09-01T00:00:00Z",
  });
  const active = field({ id: "new", key: "tipo_de_win", sortOrder: 1 });

  it("aparece cuando el dato lo usa", () => {
    const result = fieldsForValues([archived, active], { fase: "escala" });
    expect(result.map((f) => f.id)).toEqual(["new", "old"]);
  });

  it("no aparece cuando el dato no lo usa", () => {
    expect(fieldsForValues([archived, active], { tipo_de_win: "hito" })).toHaveLength(1);
  });

  it("un valor vacío no cuenta como usado", () => {
    expect(fieldsForValues([archived, active], { fase: "" })).toHaveLength(1);
  });
});

describe("opciones de un campo", () => {
  const withOptions = field({
    options: [option("facturacion"), option("hito", { archived: true })],
  });

  it("separa las que se ofrecen de las que sólo se muestran", () => {
    const { all, available } = resolveFieldOptions(withOptions);
    expect(all).toHaveLength(2);
    expect(available.map((o) => o.value)).toEqual(["facturacion"]);
  });

  it("un campo que no es de lista no tiene opciones", () => {
    const text = field({ fieldType: "text", options: [option("x")] });
    expect(resolveFieldOptions(text).all).toEqual([]);
  });

  it("con options_source = journey_stages las opciones salen del catálogo", () => {
    const fase = field({ key: "fase", optionsSource: "journey_stages" });
    const { available } = resolveFieldOptions(fase, {
      journeyStages: [{ id: "stage-1", name: "Onboarding" }],
    });
    expect(available).toEqual([
      { value: "stage-1", label: "Onboarding", color: "neutral", archived: false },
    ]);
  });

  it("sin catálogo cargado, journey_stages no cae en las opciones inline", () => {
    // Es lo que evita que el campo "Fase" muestre dos listas mezcladas mientras
    // C1 no exista.
    const fase = field({
      key: "fase",
      optionsSource: "journey_stages",
      options: [option("escala")],
    });
    expect(resolveFieldOptions(fase).all).toEqual([]);
  });
});

describe("buscar la opción de un valor guardado", () => {
  const options = [option("facturacion", { label: "Facturación" })];

  it("devuelve la opción cuando existe", () => {
    expect(findOption(options, "facturacion")?.label).toBe("Facturación");
  });

  it("devuelve null cuando el valor no está en el catálogo, para poder avisar", () => {
    expect(findOption(options, "borrada")).toBeNull();
    expect(findOption(options, 42)).toBeNull();
  });
});

describe("hasValue", () => {
  it("distingue vacío de cero", () => {
    expect(hasValue(0)).toBe(true);
    expect(hasValue("")).toBe(false);
    expect(hasValue("   ")).toBe(false);
    expect(hasValue([])).toBe(false);
    expect(hasValue(null)).toBe(false);
    expect(hasValue(undefined)).toBe(false);
    expect(hasValue(NaN)).toBe(false);
  });
});

describe("limpiar claves que ya no corresponden a ningún campo", () => {
  it("descarta lo desconocido y conserva lo demás", () => {
    const fields = [field({ key: "tipo_de_win" })];
    expect(pickKnownValues(fields, { tipo_de_win: "hito", fantasma: "x" })).toEqual({
      tipo_de_win: "hito",
    });
  });
});
