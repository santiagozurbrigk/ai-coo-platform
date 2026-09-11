import { describe, expect, it } from "vitest";
import {
  buildIdentitySeeds,
  type SeedablePerson,
} from "@/lib/fathom/seed-identities";

function client(overrides: Partial<SeedablePerson> = {}): SeedablePerson {
  return {
    clientId: "c1",
    leadId: null,
    name: "Juan Pérez",
    nickname: null,
    email: null,
    ...overrides,
  };
}

describe("qué se siembra", () => {
  it("el mail va como identidad determinista", () => {
    const { seeds } = buildIdentitySeeds([client({ email: "Juan@Gmail.com " })]);
    const email = seeds.find((s) => s.identityType === "email");
    expect(email).toMatchObject({
      value: "Juan@Gmail.com",
      normalizedValue: "juan@gmail.com",
      clientId: "c1",
      source: "seed",
    });
  });

  it("el nombre y el apodo van como identidades de tipo nombre", () => {
    const { seeds } = buildIdentitySeeds([
      client({ name: "Juan Pérez", nickname: "Juancho" }),
    ]);
    const names = seeds.filter((s) => s.identityType === "name");
    expect(names.map((s) => s.normalizedValue).sort()).toEqual([
      "juan perez",
      "juancho",
    ]);
  });

  it("⭐ el alias de orador no se siembra: se aprende al confirmar", () => {
    // Sembrarlo desde el nombre convertiría un candidato en determinista sin
    // que nadie lo haya confirmado, que es justo lo que el peldaño 2 evita.
    const { seeds } = buildIdentitySeeds([client({ name: "Juan", email: "j@x.com" })]);
    expect(seeds.some((s) => s.identityType === "speaker_alias")).toBe(false);
  });

  it("sirve igual para leads", () => {
    const { seeds } = buildIdentitySeeds([
      { clientId: null, leadId: "l1", name: "Ana", email: "ana@x.com" },
    ]);
    expect(seeds.every((s) => s.leadId === "l1" && s.clientId === null)).toBe(true);
  });
});

describe("⭐ lo ambiguo no se siembra", () => {
  it("dos clientes con el mismo nombre dejan el nombre sin sembrar", () => {
    // El índice único es (org, tipo, valor normalizado): sembrar "el primero que
    // aparece" mandaría las llamadas de los dos a la ficha de uno solo, en
    // silencio. Sin identidad, la llamada pide confirmación — que es la
    // respuesta correcta cuando no se sabe.
    const { seeds, ambiguous } = buildIdentitySeeds([
      client({ clientId: "c1", name: "Juan Pérez" }),
      client({ clientId: "c2", name: "juan perez" }),
    ]);
    expect(seeds.filter((s) => s.identityType === "name")).toHaveLength(0);
    expect(ambiguous).toEqual([
      { identityType: "name", value: "Juan Pérez", owners: 2 },
    ]);
  });

  it("dos personas con el mismo mail tampoco se siembran", () => {
    // Nombres distintos a propósito: así el único choque es el mail y se ve
    // que cada tipo de identidad se evalúa por separado.
    const { seeds, ambiguous } = buildIdentitySeeds([
      client({ clientId: "c1", name: "Juan Pérez", email: "mismo@x.com" }),
      client({ clientId: "c2", name: "Ana Gómez", email: "MISMO@x.com" }),
    ]);
    expect(seeds.filter((s) => s.identityType === "email")).toHaveLength(0);
    expect(seeds.filter((s) => s.identityType === "name")).toHaveLength(2);
    expect(ambiguous).toEqual([
      { identityType: "email", value: "mismo@x.com", owners: 2 },
    ]);
  });

  it("⭐ el mismo dueño repetido no es ambigüedad", () => {
    // Un cliente cuyo apodo es igual a su nombre: se siembra una sola vez y no
    // se descarta. Tratarlo como choque perdería una identidad válida.
    const { seeds, ambiguous } = buildIdentitySeeds([
      client({ clientId: "c1", name: "Juan", nickname: "juan" }),
    ]);
    expect(seeds.filter((s) => s.identityType === "name")).toHaveLength(1);
    expect(ambiguous).toHaveLength(0);
  });

  it("un nombre ambiguo no arrastra al mail, que sí es único", () => {
    const { seeds } = buildIdentitySeeds([
      client({ clientId: "c1", name: "Juan Pérez", email: "uno@x.com" }),
      client({ clientId: "c2", name: "Juan Pérez", email: "dos@x.com" }),
    ]);
    expect(seeds.filter((s) => s.identityType === "email")).toHaveLength(2);
    expect(seeds.filter((s) => s.identityType === "name")).toHaveLength(0);
  });
});

describe("lo que no identifica a nadie se descarta", () => {
  it("un mail sin arroba no se siembra", () => {
    const { seeds } = buildIdentitySeeds([client({ email: "no-es-un-mail" })]);
    expect(seeds.some((s) => s.identityType === "email")).toBe(false);
  });

  it("nombres vacíos o que se normalizan a nada", () => {
    const { seeds } = buildIdentitySeeds([
      client({ clientId: "c1", name: "   ", nickname: "///" }),
    ]);
    expect(seeds).toEqual([]);
  });

  it("una persona sin cliente ni lead no se siembra", () => {
    const { seeds } = buildIdentitySeeds([
      { clientId: null, leadId: null, name: "Fantasma", email: "f@x.com" },
    ]);
    expect(seeds).toEqual([]);
  });

  it("sin gente no hay nada que sembrar", () => {
    expect(buildIdentitySeeds([])).toEqual({ seeds: [], ambiguous: [] });
  });
});
