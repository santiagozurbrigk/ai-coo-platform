import { describe, expect, it } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  isRutaLibre,
  permissionModuleForPath,
} from "@/lib/navigation/module-for-path";

const PLATFORM_DIR = join(process.cwd(), "app", "(platform)");

function rutasDePrimerNivel(): string[] {
  return readdirSync(PLATFORM_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/${entry.name}`)
    .filter((ruta) => !ruta.startsWith("/["));
}

describe("permissionModuleForPath", () => {
  it("toda ruta de la plataforma tiene módulo o está declarada como libre", () => {
    const huerfanas = rutasDePrimerNivel().filter(
      (ruta) => permissionModuleForPath(ruta) === null && !isRutaLibre(ruta)
    );
    expect(huerfanas).toEqual([]);
  });

  it("las subrutas heredan el módulo del padre", () => {
    expect(permissionModuleForPath("/finance/expenses")).toBe("finance");
    expect(permissionModuleForPath("/clients/algun-id/detalle")).toBe("clients");
    expect(permissionModuleForPath("/marketing/content/abc")).toBe("marketing");
  });

  it("un prefijo no cuenta si no termina en un segmento entero", () => {
    // /teamwork no es /team
    expect(permissionModuleForPath("/teamwork")).toBeNull();
    expect(permissionModuleForPath("/financeiro")).toBeNull();
  });

  it("las rutas previas al rol quedan libres", () => {
    expect(permissionModuleForPath("/onboarding")).toBeNull();
    expect(permissionModuleForPath("/onboarding/holding")).toBeNull();
    expect(permissionModuleForPath("/holding")).toBeNull();
  });

  it("SOPs y Producto caen bajo Operaciones", () => {
    expect(permissionModuleForPath("/sops/create")).toBe("operations");
    expect(permissionModuleForPath("/operations/sops")).toBe("operations");
    expect(permissionModuleForPath("/product/value-ladder")).toBe("operations");
  });

  it("una ruta desconocida no se bloquea, pero tampoco inventa módulo", () => {
    expect(permissionModuleForPath("/ruta-que-no-existe")).toBeNull();
  });
});
