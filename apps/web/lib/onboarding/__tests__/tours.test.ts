/**
 * Tours contextuales.
 *
 * El test que importa es el de las anclas. Un tour cuyo `data-tour` desapareció
 * del JSX **no falla**: el paso simplemente no se muestra, y nadie se entera
 * hasta que un cliente hace el recorrido y ve la mitad. Este archivo lo
 * convierte en un test rojo.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  ALL_TOUR_ANCHORS,
  TOURS,
  TOUR_IDS,
  tourForPath,
} from "../tours";
import { PERMISSION_MODULES } from "@/constants/permission-modules";

const APP_ROOT = join(__dirname, "..", "..", "..");
const SEARCH_DIRS = ["app", "components"];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist"]);

/** Todos los `data-tour="..."` que existen realmente en el JSX. */
function anchorsInSource(): Set<string> {
  const found = new Set<string>();
  const pattern = /data-tour="([^"]+)"/g;

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(join(dir, entry.name));
        continue;
      }
      if (!entry.name.endsWith(".tsx")) continue;

      const source = readFileSync(join(dir, entry.name), "utf8");
      for (const match of source.matchAll(pattern)) {
        // El propio runner arma el selector por interpolación: no es un ancla.
        if (match[1].includes("$")) continue;
        found.add(match[1]);
      }
    }
  }

  for (const dir of SEARCH_DIRS) walk(join(APP_ROOT, dir));
  return found;
}

describe("anclas de los tours", () => {
  const enSource = anchorsInSource();

  it("encuentra anclas en el código (el test se está ejecutando de verdad)", () => {
    // Si el walk no encuentra nada, el test de abajo pasaría por vacío.
    expect(enSource.size).toBeGreaterThan(0);
  });

  it("cada ancla declarada existe en el JSX", () => {
    const faltantes = ALL_TOUR_ANCHORS.filter((a) => !enSource.has(a));
    expect(faltantes).toEqual([]);
  });

  it("no hay anclas huérfanas en el JSX", () => {
    // Un `data-tour` que ningún tour usa es código muerto, o un tour que se
    // borró a medias.
    const declaradas = new Set(ALL_TOUR_ANCHORS);
    const huerfanas = [...enSource].filter((a) => !declaradas.has(a));
    expect(huerfanas).toEqual([]);
  });
});

describe("catálogo de tours", () => {
  it("no tiene ids duplicados y coinciden con TOUR_IDS", () => {
    const ids = TOURS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual([...TOUR_IDS].sort());
  });

  it("no repite anclas entre pasos", () => {
    expect(new Set(ALL_TOUR_ANCHORS).size).toBe(ALL_TOUR_ANCHORS.length);
  });

  it("cada tour referencia un módulo de permisos que existe", () => {
    const validos = new Set(PERMISSION_MODULES.map((m) => m.id));
    const invalidos = TOURS.filter((t) => !validos.has(t.permissionId));
    expect(invalidos).toEqual([]);
  });

  it("todos los pasos tienen título y descripción", () => {
    const vacios = TOURS.flatMap((t) =>
      t.steps.filter((s) => !s.title.trim() || !s.description.trim())
    );
    expect(vacios).toEqual([]);
  });
});

describe("tourForPath", () => {
  it("encuentra el tour de la ruta exacta", () => {
    expect(tourForPath("/funnels")?.id).toBe("funnels");
    expect(tourForPath("/agent")?.id).toBe("agent");
  });

  it("lo encuentra también en una ruta anidada", () => {
    expect(tourForPath("/funnels/abc-123")?.id).toBe("funnels");
  });

  it("no confunde una ruta que sólo comparte prefijo de texto", () => {
    // `/agentes` no cuelga de `/agent`.
    expect(tourForPath("/agentes")).toBeUndefined();
  });

  it("devuelve el tour más específico cuando hay anidamiento", () => {
    // `/marketing/content` gana sobre cualquier tour de `/marketing`.
    expect(tourForPath("/marketing/content")?.id).toBe("marketing_content");
  });

  it("devuelve undefined donde no hay tour", () => {
    expect(tourForPath("/dashboard")).toBeUndefined();
    expect(tourForPath("/settings")).toBeUndefined();
  });
});
