import { describe, expect, it } from "vitest";
import {
  externalParticipants,
  identityToLearn,
  normalizeIdentity,
  resolveCounterparty,
  type RecordingParticipant,
} from "@/lib/fathom/resolve-counterparty";
import type { ClientIdentity } from "@/types/fathom-identities";

function identity(overrides: Partial<ClientIdentity> = {}): ClientIdentity {
  const value = overrides.value ?? "Juan Pérez";
  return {
    id: "i1",
    organizationId: "org-1",
    clientId: "client-1",
    leadId: null,
    identityType: "name",
    value,
    source: "seed",
    timesMatched: 0,
    lastMatchedAt: null,
    ...overrides,
    // El normalizado siempre coherente con el value final.
    normalizedValue: normalizeIdentity(value),
  };
}

const TEAM_NAMES = ["Santiago Z"];
const TEAM_EMAILS = ["santi@otc.com"];

function resolve(
  participants: RecordingParticipant[],
  identities: ClientIdentity[] = [],
  extra: Partial<Parameters<typeof resolveCounterparty>[0]> = {}
) {
  return resolveCounterparty({
    participants,
    teamNames: TEAM_NAMES,
    teamEmails: TEAM_EMAILS,
    identities,
    ...extra,
  });
}

describe("⭐ paso 0 · sacar a los de casa", () => {
  it("descarta al equipo por mail y por nombre de pantalla", () => {
    const externals = externalParticipants(
      [
        { name: "Santiago Z", email: null },
        { name: "Otro", email: "santi@otc.com" },
        { name: "Juan Pérez", email: "juan@gmail.com" },
      ],
      TEAM_NAMES,
      TEAM_EMAILS
    );
    expect(externals.map((p) => p.name)).toEqual(["Juan Pérez"]);
  });

  it("respeta la marca de interno que trae Fathom", () => {
    const externals = externalParticipants(
      [{ name: "Alguien", email: null, isInternal: true }],
      [],
      []
    );
    expect(externals).toEqual([]);
  });

  it("descarta aunque el nombre venga con acentos o mayúsculas distintas", () => {
    const externals = externalParticipants(
      [{ name: "SANTIAGO Z", email: null }],
      ["Santiago Z"],
      []
    );
    expect(externals).toEqual([]);
  });
});

describe("sin nadie externo es una reunión de equipo", () => {
  it("no inventa una contraparte", () => {
    const result = resolve([{ name: "Santiago Z", email: "santi@otc.com" }]);
    expect(result).toMatchObject({
      counterparty: "internal",
      purpose: "team",
      clientId: null,
      needsConfirmation: false,
    });
  });
});

describe("⭐ peldaño 1 · el mail resuelve solo", () => {
  it("un cliente reconocido por mail es una entrega", () => {
    const result = resolve(
      [{ name: "Juan", email: "juan@gmail.com" }],
      [identity({ identityType: "email", value: "juan@gmail.com", clientId: "c1" })]
    );
    expect(result).toMatchObject({
      counterparty: "client",
      purpose: "delivery",
      clientId: "c1",
      resolutionMethod: "invitee_email",
      needsConfirmation: false,
    });
  });

  it("un lead reconocido por mail es una venta", () => {
    const result = resolve(
      [{ name: "Ana", email: "ana@gmail.com" }],
      [
        identity({
          identityType: "email",
          value: "ana@gmail.com",
          clientId: null,
          leadId: "l1",
        }),
      ]
    );
    expect(result).toMatchObject({
      counterparty: "lead",
      purpose: "sales",
      leadId: "l1",
      resolutionMethod: "invitee_email",
    });
  });
});

describe("⭐ peldaño 2 · el alias aprendido resuelve las entregas", () => {
  it('reconoce un nombre de pantalla raro como "iPhone de Juan"', () => {
    // Es el caso que el mail no cubre: las entregas muchas veces no se agendan.
    const result = resolve(
      [{ name: "iPhone de Juan", email: null }],
      [
        identity({
          identityType: "speaker_alias",
          value: "iPhone de Juan",
          clientId: "c1",
        }),
      ]
    );
    expect(result).toMatchObject({
      counterparty: "client",
      purpose: "delivery",
      resolutionMethod: "speaker_alias",
      needsConfirmation: false,
    });
  });

  it("el mail gana sobre el alias: no se pisa una señal más fuerte", () => {
    const result = resolve(
      [{ name: "iPhone de Juan", email: "otro@gmail.com" }],
      [
        identity({ identityType: "email", value: "otro@gmail.com", clientId: "por-mail" }),
        identity({
          id: "i2",
          identityType: "speaker_alias",
          value: "iPhone de Juan",
          clientId: "por-alias",
        }),
      ]
    );
    expect(result.clientId).toBe("por-mail");
    expect(result.resolutionMethod).toBe("invitee_email");
  });
});

describe("⭐ peldaño 3 · el nombre resuelve, pero se confirma", () => {
  it("un match por nombre queda como candidato", () => {
    // Dos personas pueden llamarse igual, y equivocarse acá mete la llamada en
    // la ficha de otro cliente.
    const result = resolve(
      [{ name: "Juan Pérez", email: null }],
      [identity({ identityType: "name", value: "Juan Pérez", clientId: "c1" })]
    );
    expect(result.resolutionMethod).toBe("name_match");
    expect(result.needsConfirmation).toBe(true);
  });
});

describe("⭐ el upsell: cliente con turno agendado es venta, no entrega", () => {
  it("dice las dos cosas a la vez", () => {
    const result = resolve(
      [{ name: "Juan", email: "juan@gmail.com" }],
      [identity({ identityType: "email", value: "juan@gmail.com", clientId: "c1" })],
      { hasCalendarCrossing: true }
    );
    expect(result.counterparty).toBe("client");
    expect(result.purpose).toBe("sales");
  });

  it("sin turno, el mismo cliente es entrega", () => {
    const result = resolve(
      [{ name: "Juan", email: "juan@gmail.com" }],
      [identity({ identityType: "email", value: "juan@gmail.com", clientId: "c1" })],
      { hasCalendarCrossing: false }
    );
    expect(result.purpose).toBe("delivery");
  });
});

describe("peldaño 4 · el cruce con un turno", () => {
  it("resuelve cuando la identidad no alcanzó, pero pide confirmación", () => {
    const result = resolve([{ name: "Desconocido", email: null }], [], {
      hasCalendarCrossing: true,
      calendarClientId: "c9",
    });
    expect(result).toMatchObject({
      counterparty: "client",
      resolutionMethod: "calendar_crossing",
      clientId: "c9",
      needsConfirmation: true,
    });
  });
});

describe("⭐ peldaño 5 · sin nada, va a la cola de revisión", () => {
  it("no inventa un cliente", () => {
    const result = resolve([{ name: "Nadie conocido", email: null }]);
    expect(result.clientId).toBeNull();
    expect(result.leadId).toBeNull();
    expect(result.resolutionMethod).toBeNull();
    expect(result.needsConfirmation).toBe(true);
  });

  it("conserva el nombre de pantalla, que es lo que se va a aprender al confirmar", () => {
    expect(resolve([{ name: "Nadie conocido", email: null }]).speakerName).toBe(
      "Nadie conocido"
    );
  });
});

describe("⭐ paso 4 · la confirmación enseña", () => {
  it("propone guardar el alias de quien se confirmó", () => {
    const learned = identityToLearn("iPhone de Juan", { clientId: "c1", leadId: null }, []);
    expect(learned).toMatchObject({
      identityType: "speaker_alias",
      value: "iPhone de Juan",
    });
  });

  it("no vuelve a guardar un alias que ya existe", () => {
    const learned = identityToLearn(
      "iPhone de Juan",
      { clientId: "c1", leadId: null },
      [identity({ identityType: "speaker_alias", value: "iPhone de Juan" })]
    );
    expect(learned).toBeNull();
  });

  it("sin dueño no hay nada que aprender", () => {
    expect(identityToLearn("Alguien", { clientId: null, leadId: null }, [])).toBeNull();
  });

  it("un nombre vacío no genera un alias vacío", () => {
    expect(identityToLearn("   ", { clientId: "c1", leadId: null }, [])).toBeNull();
    expect(identityToLearn(null, { clientId: "c1", leadId: null }, [])).toBeNull();
  });
});

describe("normalizar para comparar", () => {
  it("saca acentos, mayúsculas y puntuación", () => {
    expect(normalizeIdentity("Juan Pérez!")).toBe("juan perez");
    expect(normalizeIdentity("  JUAN   PEREZ  ")).toBe("juan perez");
  });

  it("conserva el mail entero", () => {
    expect(normalizeIdentity("Juan@Gmail.COM")).toBe("juan@gmail.com");
  });
});
