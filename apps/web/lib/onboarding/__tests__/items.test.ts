/**
 * El catálogo referencia íconos por nombre y `NavIcon` cae a un ícono por
 * defecto cuando el nombre no existe. Sin este test, un error de tipeo pinta el
 * ícono equivocado sin que nada falle.
 */

import { describe, it, expect } from "vitest";
import { NAV_ICON_NAMES } from "@/components/navigation/nav-icons";
import { ONBOARDING_ITEMS } from "../items";

describe("íconos del catálogo", () => {
  it("todos existen en el mapa de NavIcon", () => {
    const faltantes = ONBOARDING_ITEMS.filter(
      (item) => !NAV_ICON_NAMES.includes(item.icon)
    ).map((item) => `${item.id} → ${item.icon}`);

    expect(faltantes).toEqual([]);
  });
});
