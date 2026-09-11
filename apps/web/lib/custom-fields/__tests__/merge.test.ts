import { describe, expect, it } from "vitest";
import { mergeCustomFieldValues } from "@/lib/custom-fields/merge";
import { field } from "@/lib/custom-fields/__tests__/fixtures";

const ARCHIVADO = "2026-09-01T00:00:00Z";

describe("lo que el formulario ofreció manda", () => {
  it("guarda lo validado de los campos activos", () => {
    const fields = [field({ id: "a", key: "objetivo_general" })];
    const merged = mergeCustomFieldValues(fields, {}, { objetivo_general: "escalar_a_50k" });
    expect(merged).toEqual({ objetivo_general: "escalar_a_50k" });
  });

  it("pisa el valor viejo de un campo activo", () => {
    const fields = [field({ id: "a", key: "objetivo_general" })];
    const merged = mergeCustomFieldValues(
      fields,
      { objetivo_general: "10k_en_primer_lanzamiento" },
      { objetivo_general: "escalar_a_50k" }
    );
    expect(merged.objetivo_general).toBe("escalar_a_50k");
  });

  it("⭐ vaciar un campo activo lo borra", () => {
    // Es la única forma de borrar un valor, así que tiene que seguir andando.
    // Si `loaded` ganara siempre, un campo vaciado volvería solo al recargar.
    const fields = [field({ id: "a", key: "objetivo_general" })];
    const merged = mergeCustomFieldValues(
      fields,
      { objetivo_general: "escalar_a_50k" },
      {}
    );
    expect(merged).toEqual({});
  });
});

describe("⭐ lo que el formulario no podía tocar se conserva", () => {
  it("un campo archivado con dato cargado sobrevive al guardado", () => {
    // La regla 3 de C0: archivado deja de ofrecerse, pero sigue mostrándose
    // donde ya se cargó. Sin esto, archivar una columna borraría el pasado.
    const fields = [
      field({ id: "a", key: "objetivo_general" }),
      field({ id: "v", key: "nicho_viejo", archivedAt: ARCHIVADO }),
    ];
    const merged = mergeCustomFieldValues(
      fields,
      { nicho_viejo: "fitness", objetivo_general: "escalar_a_50k" },
      { objetivo_general: "escalar_a_100k" }
    );
    expect(merged).toEqual({
      nicho_viejo: "fitness",
      objetivo_general: "escalar_a_100k",
    });
  });

  it("⭐ una clave huérfana también se conserva", () => {
    // De un campo que alguien borró de verdad del catálogo. Que la columna ya
    // no exista no hace falso el dato, y descartarlo en un guardado que ni lo
    // mencionó sería perderlo sin que nadie lo decida.
    const fields = [field({ id: "a", key: "objetivo_general" })];
    const merged = mergeCustomFieldValues(
      fields,
      { campo_borrado: "algo que alguien cargó" },
      { objetivo_general: "escalar_a_50k" }
    );
    expect(merged.campo_borrado).toBe("algo que alguien cargó");
  });

  it("lo conservado sin contenido se descarta", () => {
    const fields = [field({ id: "v", key: "nicho_viejo", archivedAt: ARCHIVADO })];
    const merged = mergeCustomFieldValues(
      fields,
      { nicho_viejo: "", otro_vacio: [], tercero: null },
      {}
    );
    expect(merged).toEqual({});
  });

  it("un archivado sin dato cargado no aparece de la nada", () => {
    const fields = [field({ id: "v", key: "nicho_viejo", archivedAt: ARCHIVADO })];
    expect(mergeCustomFieldValues(fields, {}, {})).toEqual({});
  });
});

describe("casos de borde", () => {
  it("sin columnas configuradas no guarda nada", () => {
    expect(mergeCustomFieldValues([], {}, {})).toEqual({});
  });

  it("no muta lo que recibe", () => {
    const fields = [field({ id: "a", key: "objetivo_general" })];
    const loaded = { campo_borrado: "x" };
    const validated = { objetivo_general: "escalar_a_50k" };
    mergeCustomFieldValues(fields, loaded, validated);
    expect(loaded).toEqual({ campo_borrado: "x" });
    expect(validated).toEqual({ objetivo_general: "escalar_a_50k" });
  });

  it("conserva listas y números, no sólo texto", () => {
    const fields = [field({ id: "v", key: "canales", archivedAt: ARCHIVADO })];
    const merged = mergeCustomFieldValues(fields, { canales: ["ig", "yt"] }, {});
    expect(merged.canales).toEqual(["ig", "yt"]);
  });
});
