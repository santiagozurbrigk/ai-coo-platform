import { describe, expect, it } from "vitest";
import {
  advertenciasDeOrganizacion,
  advertenciasDeUsuario,
  BUCKETS_FUERA_DE_ALCANCE,
  BUCKETS_POR_ORGANIZACION,
  confirmacionValida,
  estaBloqueada,
} from "@/lib/super-admin/deletion-plan";

const SIN_NADA = { perfiles: 0, clientes: 0, archivos: 0, negociosDelHolding: 0 };

describe("confirmacionValida", () => {
  it("acepta el nombre exacto", () => {
    expect(confirmacionValida("Academia RNS", "Academia RNS")).toBe(true);
  });

  it("perdona mayúsculas y espacios de más", () => {
    expect(confirmacionValida("  academia   rns  ", "Academia RNS")).toBe(true);
  });

  it("NO perdona acentos: son nombres distintos", () => {
    expect(confirmacionValida("Optimiza tu Control", "Optímiza tu Control")).toBe(false);
  });

  it("rechaza un nombre parecido", () => {
    expect(confirmacionValida("Academia", "Academia RNS")).toBe(false);
    expect(confirmacionValida("Academia RNS 2", "Academia RNS")).toBe(false);
  });

  it("⭐ un objetivo vacío no se puede confirmar con texto vacío", () => {
    // Si no, una organización sin nombre se borraría apretando el botón sin
    // escribir nada — que es justo lo que este diálogo existe para impedir.
    expect(confirmacionValida("", "")).toBe(false);
    expect(confirmacionValida("   ", "  ")).toBe(false);
  });
});

describe("advertenciasDeOrganizacion", () => {
  it("borrar la organización propia queda bloqueado", () => {
    const avisos = advertenciasDeOrganizacion({
      conteo: SIN_NADA,
      esHolding: false,
      incluyeAlEjecutor: true,
    });
    expect(estaBloqueada(avisos)).toBe(true);
    expect(avisos[0]?.clave).toBe("es-uno-mismo");
  });

  it("una organización vacía y ajena no genera advertencias", () => {
    const avisos = advertenciasDeOrganizacion({
      conteo: SIN_NADA,
      esHolding: false,
      incluyeAlEjecutor: false,
    });
    expect(avisos).toEqual([]);
    expect(estaBloqueada(avisos)).toBe(false);
  });

  it("⭐ avisa que los negocios de un holding NO se borran", () => {
    const avisos = advertenciasDeOrganizacion({
      conteo: { ...SIN_NADA, negociosDelHolding: 15 },
      esHolding: true,
      incluyeAlEjecutor: false,
    });
    const holding = avisos.find((a) => a.clave === "holding-con-negocios");
    expect(holding?.texto).toContain("15 negocios enlazados");
    expect(holding?.texto).toContain("NO se borran");
    // Avisa, no impide: borrar el holding y dejar los negocios es válido.
    expect(estaBloqueada(avisos)).toBe(false);
  });

  it("singular y plural en los negocios del holding", () => {
    const uno = advertenciasDeOrganizacion({
      conteo: { ...SIN_NADA, negociosDelHolding: 1 },
      esHolding: true,
      incluyeAlEjecutor: false,
    });
    expect(uno[0]?.texto).toContain("1 negocio enlazado");
  });

  it("un holding sin negocios no genera ese aviso", () => {
    const avisos = advertenciasDeOrganizacion({
      conteo: SIN_NADA,
      esHolding: true,
      incluyeAlEjecutor: false,
    });
    expect(avisos.find((a) => a.clave === "holding-con-negocios")).toBeUndefined();
  });

  it("cuenta clientes y archivos por separado", () => {
    const avisos = advertenciasDeOrganizacion({
      conteo: { perfiles: 3, clientes: 264, archivos: 106, negociosDelHolding: 0 },
      esHolding: false,
      incluyeAlEjecutor: false,
    });
    expect(avisos.find((a) => a.clave === "tiene-datos")?.texto).toContain("264 clientes");
    expect(avisos.find((a) => a.clave === "tiene-archivos")?.texto).toContain("106 archivos");
  });
});

describe("advertenciasDeUsuario", () => {
  it("borrarse a uno mismo queda bloqueado", () => {
    const avisos = advertenciasDeUsuario({
      esElEjecutor: true,
      esUltimoFounder: false,
      organizacion: "OTC",
    });
    expect(estaBloqueada(avisos)).toBe(true);
  });

  it("⭐ avisa cuando deja la organización sin dueño, pero no lo impide", () => {
    const avisos = advertenciasDeUsuario({
      esElEjecutor: false,
      esUltimoFounder: true,
      organizacion: "Academia RNS",
    });
    expect(avisos[0]?.texto).toContain("único founder de Academia RNS");
    expect(estaBloqueada(avisos)).toBe(false);
  });
});

describe("buckets", () => {
  it("⭐ los buckets que no son por organización quedan fuera", () => {
    for (const fuera of BUCKETS_FUERA_DE_ALCANCE) {
      expect(BUCKETS_POR_ORGANIZACION).not.toContain(fuera);
    }
  });

  it("ningún bucket está repetido", () => {
    expect(new Set(BUCKETS_POR_ORGANIZACION).size).toBe(BUCKETS_POR_ORGANIZACION.length);
  });
});
