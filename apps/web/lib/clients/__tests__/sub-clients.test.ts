import { describe, expect, it } from "vitest";
import {
  instagramLabel,
  legacySectionValues,
  normalizeInstagramUrl,
  planLegacyMove,
  rowToSubClient,
} from "@/lib/clients/sub-clients";
import type { FieldDefinition, FieldSection } from "@/types/custom-fields";

function field(key: string, section: FieldSection | null): FieldDefinition {
  return {
    id: key,
    organizationId: "o1",
    entity: "client",
    key,
    label: key,
    description: null,
    fieldType: "text",
    options: [],
    optionsSource: "inline",
    unit: null,
    currency: null,
    alertDaysBefore: null,
    isRequired: false,
    section,
    onboarding: null,
    showInTable: false,
    sortOrder: 0,
    archivedAt: null,
    createdAt: "2026-09-23T00:00:00Z",
    updatedAt: "2026-09-23T00:00:00Z",
  };
}

const FIELDS = [
  field("avatar", "marketing"),
  field("oferta", "marketing"),
  field("ghl", "sistemas"),
  field("objetivo_general", null),
];

describe("el link del cliente", () => {
  it("vacío es válido y queda en null", () => {
    expect(normalizeInstagramUrl("")).toEqual({ ok: true, url: null });
    expect(normalizeInstagramUrl("   ")).toEqual({ ok: true, url: null });
    expect(normalizeInstagramUrl(null)).toEqual({ ok: true, url: null });
  });

  it("⭐ el usuario suelto se convierte en el link de Instagram", () => {
    expect(normalizeInstagramUrl("@juan.perez")).toEqual({
      ok: true,
      url: "https://instagram.com/juan.perez",
    });
    expect(normalizeInstagramUrl("juan_perez")).toEqual({
      ok: true,
      url: "https://instagram.com/juan_perez",
    });
  });

  it("instagram.com sin protocolo se completa", () => {
    expect(normalizeInstagramUrl("www.instagram.com/juan")).toEqual({
      ok: true,
      url: "https://instagram.com/juan",
    });
  });

  it("un link entero se respeta tal cual, aunque no sea Instagram", () => {
    expect(normalizeInstagramUrl("https://www.instagram.com/juan/")).toEqual({
      ok: true,
      url: "https://www.instagram.com/juan/",
    });
    expect(normalizeInstagramUrl("https://juan.com")).toEqual({
      ok: true,
      url: "https://juan.com",
    });
  });

  it("texto que no es link ni usuario se rechaza", () => {
    expect(normalizeInstagramUrl("juan perez").ok).toBe(false);
    expect(normalizeInstagramUrl("https://localhost").ok).toBe(false);
  });

  it("la etiqueta muestra @usuario en Instagram y el dominio en otro sitio", () => {
    expect(instagramLabel("https://www.instagram.com/juan/")).toBe("@juan");
    expect(instagramLabel("https://juan.com/bio")).toBe("juan.com");
  });
});

describe("la fila de la base", () => {
  it("un custom que no es objeto queda vacío", () => {
    const row = {
      id: "s1",
      client_id: "c1",
      name: "Ana",
      instagram_url: null,
      custom: null,
      created_at: "2026-09-23T00:00:00Z",
    };
    expect(rowToSubClient(row).custom).toEqual({});
    expect(rowToSubClient({ ...row, custom: ["x"] }).custom).toEqual({});
  });
});

describe("⭐ los datos viejos del growth partner", () => {
  it("sólo cuentan los campos con sección y con algo cargado", () => {
    expect(
      legacySectionValues(FIELDS, {
        avatar: "Mujeres 30-45",
        oferta: "  ",
        objetivo_general: "Llegar a 10k",
        clave_huerfana: "x",
      })
    ).toEqual({ avatar: "Mujeres 30-45" });
  });

  it("se pasan al cliente elegido y salen del growth partner", () => {
    const plan = planLegacyMove(
      FIELDS,
      { avatar: "A", ghl: "sí", objetivo_general: "O" },
      {}
    );
    expect(plan.subClientCustom).toEqual({ avatar: "A", ghl: "sí" });
    expect(plan.clientCustom).toEqual({ objetivo_general: "O" });
    expect(plan.moved.sort()).toEqual(["avatar", "ghl"]);
    expect(plan.kept).toEqual([]);
  });

  it("⭐ nunca pisa lo que el cliente de destino ya tiene cargado", () => {
    const plan = planLegacyMove(
      FIELDS,
      { avatar: "Viejo", oferta: "Oferta vieja" },
      { avatar: "Nuevo" }
    );
    expect(plan.subClientCustom).toEqual({ avatar: "Nuevo", oferta: "Oferta vieja" });
    // El que no se pasó se queda en el growth partner, para otro cliente.
    expect(plan.clientCustom).toEqual({ avatar: "Viejo" });
    expect(plan.moved).toEqual(["oferta"]);
    expect(plan.kept).toEqual(["avatar"]);
  });

  it("sin nada viejo no cambia nada", () => {
    const plan = planLegacyMove(FIELDS, { objetivo_general: "O" }, { avatar: "A" });
    expect(plan.moved).toEqual([]);
    expect(plan.clientCustom).toEqual({ objetivo_general: "O" });
    expect(plan.subClientCustom).toEqual({ avatar: "A" });
  });
});
