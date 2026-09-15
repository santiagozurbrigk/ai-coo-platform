import { describe, expect, it } from "vitest";
import {
  resolverAvisoDeFecha,
  textoDelAviso,
} from "@/lib/custom-fields/date-alert";

const HOY = new Date(2026, 8, 15); // 15 de septiembre de 2026

describe("resolverAvisoDeFecha", () => {
  it("⭐ se prende cuando faltan menos días que el umbral", () => {
    // El caso del pedido: avisar a 15 días.
    const aviso = resolverAvisoDeFecha("2026-09-25", 15, HOY);
    expect(aviso?.estado).toBe("cerca");
    expect(aviso?.diasFaltantes).toBe(10);
    expect(aviso?.alerta).toBe(true);
  });

  it("no se prende cuando todavía falta mucho", () => {
    const aviso = resolverAvisoDeFecha("2026-12-01", 15, HOY);
    expect(aviso?.estado).toBe("lejos");
    expect(aviso?.alerta).toBe(false);
  });

  it("⭐ el día del umbral exacto ya avisa", () => {
    // Con umbral 15 y faltando 15, avisa. Si no, el aviso llegaría un día tarde.
    const aviso = resolverAvisoDeFecha("2026-09-30", 15, HOY);
    expect(aviso?.diasFaltantes).toBe(15);
    expect(aviso?.alerta).toBe(true);
  });

  it("distingue hoy de una fecha que ya pasó", () => {
    expect(resolverAvisoDeFecha("2026-09-15", 15, HOY)?.estado).toBe("hoy");
    expect(resolverAvisoDeFecha("2026-09-10", 15, HOY)?.estado).toBe("pasada");
  });

  it("una fecha pasada sigue en alerta", () => {
    // Que se haya pasado no la vuelve irrelevante: al contrario.
    expect(resolverAvisoDeFecha("2026-08-01", 15, HOY)?.alerta).toBe(true);
  });

  it("sin umbral configurado no hay aviso", () => {
    expect(resolverAvisoDeFecha("2026-09-16", null, HOY)).toBeNull();
    expect(resolverAvisoDeFecha("2026-09-16", 0, HOY)).toBeNull();
  });

  it("⭐ un valor ilegible NO se pinta de alerta", () => {
    // Teñir de rojo algo que no se entendió es inventar una urgencia.
    expect(resolverAvisoDeFecha("el mes que viene", 15, HOY)).toBeNull();
    expect(resolverAvisoDeFecha("", 15, HOY)).toBeNull();
    expect(resolverAvisoDeFecha(null, 15, HOY)).toBeNull();
    expect(resolverAvisoDeFecha(42, 15, HOY)).toBeNull();
  });

  it("⭐ la fecha no se corre un día por el huso horario", () => {
    // "2026-09-15" mirado desde Argentina no puede dar "ayer".
    const aviso = resolverAvisoDeFecha("2026-09-15", 15, new Date(2026, 8, 15, 23, 30));
    expect(aviso?.estado).toBe("hoy");
  });

  it("cuenta días de calendario, no fracciones", () => {
    // A las 23:00 de hoy, mañana sigue siendo "falta 1 día".
    const aviso = resolverAvisoDeFecha("2026-09-16", 15, new Date(2026, 8, 15, 23, 0));
    expect(aviso?.diasFaltantes).toBe(1);
  });
});

describe("textoDelAviso", () => {
  it("usa singular y plural", () => {
    expect(textoDelAviso(resolverAvisoDeFecha("2026-09-16", 15, HOY)!)).toBe("falta 1 día");
    expect(textoDelAviso(resolverAvisoDeFecha("2026-09-20", 15, HOY)!)).toBe("faltan 5 días");
    expect(textoDelAviso(resolverAvisoDeFecha("2026-09-14", 15, HOY)!)).toBe("fue ayer");
    expect(textoDelAviso(resolverAvisoDeFecha("2026-09-15", 15, HOY)!)).toBe("es hoy");
  });

  it("no dice nada cuando falta mucho", () => {
    expect(textoDelAviso(resolverAvisoDeFecha("2026-12-01", 15, HOY)!)).toBe("");
  });
});
