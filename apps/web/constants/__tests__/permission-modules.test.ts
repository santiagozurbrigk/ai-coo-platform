/**
 * Los módulos de permisos y sus grupos.
 *
 * ⭐ Este archivo existe por un bug concreto: `funnels` estaba declarado como
 * módulo de permisos pero **no figuraba en ningún `MODULE_GROUPS`**. El
 * formulario de roles itera los grupos, así que "Embudos" nunca se renderizaba
 * y no había forma de conceder el permiso desde la UI. El módulo quedaba
 * visible sólo para founders, que se saltean los permisos por completo.
 *
 * Es un modo de falla silencioso: nada rompe, nada avisa, y sólo se nota cuando
 * alguien intenta darle acceso a otra persona. Estos tests lo convierten en un
 * error de build.
 */

import { describe, expect, it } from "vitest";
import {
  MODULE_GROUPS,
  PERMISSION_MODULES,
  type PermissionModuleId,
} from "../permission-modules";

const groupedIds = new Set<PermissionModuleId>(
  MODULE_GROUPS.flatMap((group) => group.moduleIds)
);

describe("MODULE_GROUPS cubre todos los módulos de permisos", () => {
  it("⭐ todo módulo declarado aparece en algún grupo", () => {
    // Sin esto, el módulo es invisible en el formulario de roles y su permiso
    // no se puede conceder: queda accesible sólo para founders.
    const sinGrupo = PERMISSION_MODULES.map((m) => m.id).filter(
      (id) => !groupedIds.has(id)
    );
    expect(sinGrupo).toEqual([]);
  });

  it("ningún grupo referencia un módulo que no existe", () => {
    const declarados = new Set(PERMISSION_MODULES.map((m) => m.id));
    const fantasmas = [...groupedIds].filter((id) => !declarados.has(id));
    expect(fantasmas).toEqual([]);
  });

  it("ningún módulo está en dos grupos a la vez", () => {
    // Aparecería dos veces en el formulario, con dos selectores para el mismo
    // permiso: el último en renderizarse ganaría, sin que se vea por qué.
    const todos = MODULE_GROUPS.flatMap((group) => group.moduleIds);
    expect(todos.length).toBe(groupedIds.size);
  });

  it("Embudos está entre los módulos concedibles", () => {
    // El caso que originó el archivo.
    expect(groupedIds.has("funnels")).toBe(true);
  });
});
