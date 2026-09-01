import { describe, expect, it } from "vitest";
import { classifyCall, type ClassifyInput } from "@/lib/fathom/classify";
import type { FathomInvitee } from "@/lib/fathom/invitees";

function invitee(over: Partial<FathomInvitee> = {}): FathomInvitee {
  return {
    name: "Mariano Gonzales",
    email: "mariano@acme.com",
    emailDomain: "acme.com",
    isExternal: true,
    ...over,
  };
}

function input(over: Partial<ClassifyInput> = {}): ClassifyInput {
  return {
    title: "Impromptu Google Meet Meeting",
    invitees: [],
    meetingType: null,
    meetingTypeMap: {},
    appointmentMatch: null,
    clientIdByEmail: null,
    ...over,
  };
}

describe("el turno agendado resuelve todo", () => {
  it("una llamada cruzada con un turno es una venta con un lead", () => {
    const result = classifyCall(
      input({
        appointmentMatch: {
          appointmentId: "turno-1",
          confidence: "high",
          matchedOn: ["email", "time"],
          minutesApart: 2,
        },
      })
    );

    expect(result.counterparty).toBe("lead");
    expect(result.purpose).toBe("sales");
    expect(result.appointmentId).toBe("turno-1");
    expect(result.signals).toEqual(["appointment"]);
    expect(result.reason).toBeNull();
  });

  it("funciona con el título genérico, que es el 86% de los casos", () => {
    const result = classifyCall(
      input({
        title: "Impromptu Zoom Meeting",
        appointmentMatch: {
          appointmentId: "t",
          confidence: "medium",
          matchedOn: ["time"],
          minutesApart: 8,
        },
      })
    );
    expect(result.purpose).toBe("sales");
  });
});

describe("los invitados resuelven con quién", () => {
  it("un invitado que ya es cliente hace que la llamada sea de entrega", () => {
    const result = classifyCall(
      input({ invitees: [invitee()], clientIdByEmail: "cliente-9" })
    );

    expect(result.counterparty).toBe("client");
    expect(result.clientId).toBe("cliente-9");
    expect(result.purpose).toBe("delivery");
    expect(result.signals).toContain("client_email");
  });

  it("sólo gente interna es una reunión de equipo", () => {
    const result = classifyCall(
      input({
        invitees: [
          invitee({ email: "santi@otc.com", isExternal: false }),
          invitee({ email: "ana@otc.com", isExternal: false }),
        ],
      })
    );

    expect(result.counterparty).toBe("internal");
    expect(result.purpose).toBe("team");
    expect(result.signals).toContain("internal_invitees");
  });

  it("sin invitados cargados no se afirma que sea interna", () => {
    // Lista vacía es "no sabemos quiénes eran", no "no había externos".
    const result = classifyCall(input({ invitees: [] }));
    expect(result.counterparty).not.toBe("internal");
  });
});

describe("el tipo de reunión mapeado", () => {
  it("define el propósito cuando la org lo configuró", () => {
    const result = classifyCall(
      input({
        meetingType: "Llamada de cierre",
        meetingTypeMap: { "Llamada de cierre": "sales" },
      })
    );

    expect(result.purpose).toBe("sales");
    expect(result.counterparty).toBe("lead");
    expect(result.signals).toContain("meeting_type");
  });

  it("un tipo sin mapear no clasifica: puede haber sido renombrado en Fathom", () => {
    const result = classifyCall(
      input({ meetingType: "Algo Nuevo", meetingTypeMap: { Otro: "sales" } })
    );
    expect(result.purpose).toBeNull();
    expect(result.signals).not.toContain("meeting_type");
  });

  it("le gana al título, que es lo que alguien tipeó a mano", () => {
    const result = classifyCall(
      input({
        title: "Entrega - Mariano",
        meetingType: "Cierre",
        meetingTypeMap: { Cierre: "sales" },
      })
    );
    expect(result.purpose).toBe("sales");
  });
});

describe("el título como respaldo", () => {
  it("clasifica una improvisada que alguien renombró", () => {
    const result = classifyCall(input({ title: "Llamada de venta - Mariano Gonzales" }));

    expect(result.purpose).toBe("sales");
    expect(result.counterparty).toBe("lead");
    expect(result.declaredName).toBe("Mariano Gonzales");
    expect(result.signals).toEqual(["title"]);
  });

  it("guarda el nombre declarado aunque no resuelva la identidad", () => {
    const result = classifyCall(input({ title: "Entrega - Ana Pérez" }));
    expect(result.declaredName).toBe("Ana Pérez");
  });
});

describe("lo que no se puede resolver", () => {
  it("sin ninguna señal queda sin clasificar, con motivo", () => {
    const result = classifyCall(input());

    expect(result.counterparty).toBeNull();
    expect(result.purpose).toBeNull();
    expect(result.reason).toBe("no_signal");
    expect(result.signals).toEqual([]);
  });

  it("nunca devuelve un propósito por defecto", () => {
    // El bug de la Fase 0 era `?? "delivery"`: cuando la IA fallaba, la llamada
    // quedaba marcada como entrega sin que nadie lo hubiera determinado.
    const result = classifyCall(input({ title: "Impromptu Google Meet Meeting" }));
    expect(result.purpose).toBeNull();
  });

  it("un externo desconocido sin propósito se marca como tal", () => {
    const result = classifyCall(input({ invitees: [invitee()] }));
    expect(result.purpose).toBeNull();
    expect(result.reason).toBe("external_unknown_purpose");
  });
});
