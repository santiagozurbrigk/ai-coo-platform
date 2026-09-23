import { describe, expect, it } from "vitest";
import { resolveSilence, upcomingDateAlerts } from "@/lib/clients/signals";
import { field } from "@/lib/custom-fields/__tests__/fixtures";

const ahora = new Date(2026, 8, 23, 12, 0, 0);

describe("resolveSilence", () => {
  it("marca en silencio desde el umbral, inclusive", () => {
    expect(resolveSilence("2026-09-08T12:00:00", "nota", 15, ahora)).toMatchObject({
      days: 15,
      isSilent: true,
    });
    expect(resolveSilence("2026-09-09T12:00:00", "nota", 15, ahora)).toMatchObject({
      days: 14,
      isSilent: false,
    });
  });

  it("una fecha ilegible no inventa un silencio", () => {
    expect(resolveSilence("cualquiera", "nota", 15, ahora)).toBeNull();
  });

  it("una fecha futura cuenta como hoy", () => {
    expect(resolveSilence("2026-09-30T12:00:00", "nota", 15, ahora)?.days).toBe(0);
  });
});

describe("upcomingDateAlerts", () => {
  const lanzamiento = field({
    key: "lanz",
    label: "Próximo lanzamiento",
    entity: "client",
    fieldType: "date",
    alertDaysBefore: 15,
    section: "onboarding",
  });

  it("junta las fechas cercanas por growth partner, la más próxima primero", () => {
    const r = upcomingDateAlerts(
      [lanzamiento],
      [
        { clientId: "gp1", name: "Ana", custom: { lanz: "2026-10-01" } },
        { clientId: "gp1", name: "Beto", custom: { lanz: "2026-09-25" } },
        { clientId: "gp2", name: "Caro", custom: { lanz: "2026-12-01" } },
      ],
      ahora
    );
    expect(r.gp1?.map((a) => [a.subClientName, a.aviso.diasFaltantes])).toEqual([
      ["Beto", 2],
      ["Ana", 8],
    ]);
    expect(r.gp2).toBeUndefined();
  });

  it("no avisa lo que ya pasó, ni campos sin aviso, archivados o sin sección", () => {
    const sinAviso = field({ key: "otra", entity: "client", fieldType: "date", section: "marketing" });
    const archivado = { ...lanzamiento, key: "vieja", archivedAt: "2026-09-01T00:00:00Z" };
    const r = upcomingDateAlerts(
      [lanzamiento, sinAviso, archivado],
      [{ clientId: "gp", name: "Ana", custom: { lanz: "2026-09-01", otra: "2026-09-24", vieja: "2026-09-24" } }],
      ahora
    );
    expect(r).toEqual({});
  });
});
