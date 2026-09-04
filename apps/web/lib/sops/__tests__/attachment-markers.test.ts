import { describe, expect, it } from "vitest";
import {
  extractAttachmentIds,
  resolveAttachmentMarkers,
  validateAttachmentMarkers,
} from "@/lib/sops/attachment-markers";

describe("leer los marcadores", () => {
  it("encuentra los ids referenciados, en orden y sin repetir", () => {
    const markdown = `
1. Abrí el panel
![el panel](sop-attachment:a1)
2. Tocá guardar
![guardar](sop-attachment:b2)
3. Otra vez el panel
![de nuevo](sop-attachment:a1)`;
    expect(extractAttachmentIds(markdown)).toEqual(["a1", "b2"]);
  });

  it("un markdown sin capturas no tiene ids", () => {
    expect(extractAttachmentIds("Un SOP normal ![img](https://x.com/a.png)")).toEqual([]);
  });
});

describe("⭐ validar: el modelo no puede inventar capturas", () => {
  it("borra el marcador de un id que no existe", () => {
    // El prompt se lo prohíbe, pero prohibir no es garantizar. Sin esto quedaría
    // una imagen rota en el SOP para siempre.
    const result = validateAttachmentMarkers(
      "1. Paso\n![inventada](sop-attachment:no-existe)\n2. Otro paso",
      ["a1"]
    );
    expect(result.markdown).not.toContain("sop-attachment:no-existe");
    expect(result.markdown).not.toContain("inventada");
    expect(result.removedIds).toEqual(["no-existe"]);
  });

  it("conserva los marcadores válidos", () => {
    const result = validateAttachmentMarkers(
      "1. Paso\n![el panel](sop-attachment:a1)",
      ["a1", "b2"]
    );
    expect(result.markdown).toContain("sop-attachment:a1");
    expect(result.usedIds).toEqual(["a1"]);
    expect(result.removedIds).toEqual([]);
  });

  it("mezcla válidos e inválidos sin llevarse puestos los buenos", () => {
    const result = validateAttachmentMarkers(
      "![ok](sop-attachment:a1) y ![mal](sop-attachment:zz)",
      ["a1"]
    );
    expect(result.usedIds).toEqual(["a1"]);
    expect(result.removedIds).toEqual(["zz"]);
    expect(result.markdown).toContain("sop-attachment:a1");
  });

  it("no deja huecos de líneas vacías donde borró", () => {
    const result = validateAttachmentMarkers(
      "1. Paso\n\n![mal](sop-attachment:zz)\n\n\n2. Otro",
      []
    );
    expect(result.markdown).not.toMatch(/\n{3,}/);
  });

  it("una captura que existe pero el modelo no usó no rompe nada", () => {
    const result = validateAttachmentMarkers("Sin capturas", ["a1", "b2"]);
    expect(result.usedIds).toEqual([]);
    expect(result.removedIds).toEqual([]);
  });
});

describe("resolver para mostrar", () => {
  it("cambia el marcador por la URL firmada", () => {
    const resolved = resolveAttachmentMarkers(
      "![el panel](sop-attachment:a1)",
      { a1: "https://storage/firmada?token=xyz" }
    );
    expect(resolved).toBe("![el panel](https://storage/firmada?token=xyz)");
  });

  it("⭐ sin URL deja el marcador, no una imagen rota", () => {
    // Es feo, pero es la verdad: esconderlo haría que la captura perdida pase
    // desapercibida.
    const resolved = resolveAttachmentMarkers("![x](sop-attachment:a1)", {});
    expect(resolved).toBe("![x](sop-attachment:a1)");
  });

  it("no toca las imágenes que ya son URLs normales", () => {
    const markdown = "![logo](https://cdn.com/logo.png)";
    expect(resolveAttachmentMarkers(markdown, { a1: "x" })).toBe(markdown);
  });
});
