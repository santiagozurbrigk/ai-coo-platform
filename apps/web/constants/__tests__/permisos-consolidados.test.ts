import { describe, expect, it } from "vitest";
import {
  LEGACY_PERMISSION_MODULES,
  PERMISSION_MODULES,
  highestPermissionLevel,
  resolvePermissionModuleId,
} from "@/constants/permission-modules";
import { permissionsFromRow } from "@/lib/team/mapper";

describe("⭐ un rol viejo no pierde permisos al consolidar", () => {
  it("una clave de submódulo se lee como su módulo", () => {
    const permisos = permissionsFromRow({ marketing_content: "full" });
    expect(permisos.marketing).toBe("full");
  });

  it("⭐ cuando varias claves viejas caen en el mismo módulo, gana la más permisiva", () => {
    const permisos = permissionsFromRow({
      sales_inbox: "view",
      sales_metrics: "full",
      closing: "none",
    });
    expect(permisos.sales).toBe("full");
  });

  it("el orden en que vienen las claves no cambia el resultado", () => {
    const a = permissionsFromRow({ closing: "none", sales_metrics: "full" });
    const b = permissionsFromRow({ sales_metrics: "full", closing: "none" });
    expect(a.sales).toBe(b.sales);
    expect(a.sales).toBe("full");
  });

  it("Gastos se consolida en Finanzas sin bajarle el nivel", () => {
    expect(permissionsFromRow({ finance: "view", expenses: "full" }).finance).toBe("full");
    expect(permissionsFromRow({ finance: "full", expenses: "view" }).finance).toBe("full");
  });

  it("una clave desconocida se ignora sin romper el resto", () => {
    const permisos = permissionsFromRow({ modulo_inventado: "full", clients: "view" });
    expect(permisos.clients).toBe("view");
    expect(permisos.dashboard).toBe("none");
  });

  it("sin permisos guardados, todo queda sin acceso", () => {
    const permisos = permissionsFromRow(null);
    expect(Object.values(permisos).every((nivel) => nivel === "none")).toBe(true);
  });
});

describe("el vocabulario de módulos", () => {
  it("cada clave vieja apunta a un módulo que existe", () => {
    const validos = new Set(PERMISSION_MODULES.map((m) => m.id));
    for (const destino of Object.values(LEGACY_PERMISSION_MODULES)) {
      expect(validos.has(destino)).toBe(true);
    }
  });

  it("ninguna clave vieja pisa el nombre de un módulo actual", () => {
    const validos = new Set(PERMISSION_MODULES.map((m) => m.id));
    for (const vieja of Object.keys(LEGACY_PERMISSION_MODULES)) {
      expect(validos.has(vieja as never)).toBe(false);
    }
  });

  it("resolver una clave devuelve el módulo, vieja o nueva", () => {
    expect(resolvePermissionModuleId("marketing")).toBe("marketing");
    expect(resolvePermissionModuleId("marketing_forms")).toBe("marketing");
    expect(resolvePermissionModuleId("no_existe")).toBeNull();
  });
});

describe("el mayor de dos niveles", () => {
  it("full gana a todo", () => {
    expect(highestPermissionLevel("full", "view")).toBe("full");
    expect(highestPermissionLevel("none", "full")).toBe("full");
  });

  it("view gana a none", () => {
    expect(highestPermissionLevel("view", "none")).toBe("view");
  });

  it("dos iguales devuelven ese", () => {
    expect(highestPermissionLevel("view", "view")).toBe("view");
  });
});
