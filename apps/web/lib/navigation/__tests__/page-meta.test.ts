import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FALLBACK_TITLE, getPageMeta } from "@/lib/navigation/page-meta";

/**
 * ⭐ Este test existe por un feedback de un tester: la pantalla de importar
 * datos históricos decía "Panel General" arriba a la izquierda. No era una
 * pantalla: eran **veinte**, y ninguna rompía nada — por eso nadie se enteró
 * hasta que alguien lo miró.
 *
 * Recorre las páginas reales del disco. Una pantalla nueva sin título entra
 * como error de test, no como un reporte dentro de tres meses.
 */
function rutasDePlataforma(base = "app/(platform)"): string[] {
  const salida: string[] = [];

  function recorrer(dir: string, ruta: string) {
    for (const entrada of readdirSync(dir)) {
      const completo = join(dir, entrada);
      if (statSync(completo).isDirectory()) {
        // Los grupos de rutas —(algo)— no aparecen en la URL.
        const segmento = entrada.startsWith("(") ? "" : `/${entrada}`;
        recorrer(completo, ruta + segmento);
      } else if (entrada === "page.tsx") {
        salida.push(ruta || "/");
      }
    }
  }

  recorrer(base, "");
  // Las rutas con parámetro se resuelven por regla de prefijo, con un id falso.
  return salida.map((r) => r.replace(/\[[^\]]+\]/g, "id-de-prueba"));
}

describe("⭐ ninguna pantalla se queda sin título", () => {
  const rutas = rutasDePlataforma();

  it("hay páginas para revisar", () => {
    expect(rutas.length).toBeGreaterThan(50);
  });

  it("ninguna cae en el título de reserva", () => {
    const huerfanas = rutas.filter((ruta) => getPageMeta(ruta).title === FALLBACK_TITLE);
    expect(huerfanas).toEqual([]);
  });

  it("ninguna se anuncia como el Panel General sin serlo", () => {
    const impostoras = rutas.filter(
      (ruta) => ruta !== "/dashboard" && getPageMeta(ruta).title === "Panel General"
    );
    expect(impostoras).toEqual([]);
  });
});

describe("la vuelta atrás", () => {
  it("una pantalla de primer nivel no tiene vuelta", () => {
    expect(getPageMeta("/dashboard").back).toBeUndefined();
    expect(getPageMeta("/clients").back).toBeUndefined();
  });

  it("una subpantalla vuelve a su módulo", () => {
    expect(getPageMeta("/clients/wins").back).toEqual({ href: "/clients", label: "Clientes" });
    expect(getPageMeta("/finance/expenses").back).toEqual({ href: "/finance", label: "Finanzas" });
  });

  it("⭐ una ficha de detalle también vuelve, aunque su ruta no esté en el mapa", () => {
    expect(getPageMeta("/clients/abc-123").back).toEqual({ href: "/clients", label: "Clientes" });
  });

  it("⭐ sube más de un nivel cuando hace falta", () => {
    // /funnels/abc/configurar no existe en el mapa, ni /funnels/abc: llega a /funnels.
    expect(getPageMeta("/funnels/abc/configurar").back).toEqual({
      href: "/funnels",
      label: "Embudos",
    });
  });

  it("respeta la vuelta explícita cuando la convención no alcanza", () => {
    // No hay pantalla /operations, así que Inputs declara su padre.
    expect(getPageMeta("/operations/inputs").back).toEqual({
      href: "/operations/overview",
      label: "Operaciones",
    });
  });

  it("la vuelta nunca apunta a la pantalla en la que ya estás", () => {
    for (const ruta of rutasDePlataforma()) {
      expect(getPageMeta(ruta).back?.href).not.toBe(ruta);
    }
  });
});
