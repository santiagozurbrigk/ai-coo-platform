import { describe, expect, it } from "vitest";
import { deriveTransition, isPeriodCovered } from "../stage-transition";
import type { NormalizedOpportunityEvent } from "../opportunity-event";

const RECEIVED_AT = "2026-08-30T12:00:00.000Z";

function event(
  overrides: Partial<NormalizedOpportunityEvent> = {}
): NormalizedOpportunityEvent {
  return {
    eventType: "OpportunityStageUpdate",
    eventId: "wh_1",
    opportunityId: "opp_1",
    locationId: "loc_1",
    contactId: "c_1",
    pipelineId: "pipe_1",
    stageId: "stage_2",
    status: "open",
    name: "Lead",
    source: null,
    monetaryValue: null,
    dateAdded: "2026-08-01T00:00:00.000Z",
    isDelete: false,
    ...overrides,
  };
}

describe("deriveTransition", () => {
  it("registra un alta cuando OTC nunca vio la oportunidad", () => {
    const t = deriveTransition(null, event(), RECEIVED_AT);
    expect(t).not.toBeNull();
    expect(t!.kind).toBe("created");
    expect(t!.fromStageId).toBeNull();
    expect(t!.toStageId).toBe("stage_2");
  });

  it("deja la etapa de origen en null en el alta, sin inventar la primera del pipeline", () => {
    const t = deriveTransition(null, event({ stageId: "stage_5" }), RECEIVED_AT);
    // Una oportunidad que apareció por primera vez en la etapa 5 pudo haber
    // pasado por las anteriores sin que OTC lo viera. Decir que vino de la 1
    // sería afirmar un recorrido que nadie observó.
    expect(t!.fromStageId).toBeNull();
  });

  it("registra el cambio de etapa contra la última conocida", () => {
    const t = deriveTransition(
      { stageId: "stage_1", status: "open" },
      event({ stageId: "stage_2" }),
      RECEIVED_AT
    );
    expect(t!.kind).toBe("stage_change");
    expect(t!.fromStageId).toBe("stage_1");
    expect(t!.toStageId).toBe("stage_2");
  });

  it("registra el cambio de estado cuando la etapa no se movió", () => {
    const t = deriveTransition(
      { stageId: "stage_2", status: "open" },
      event({ stageId: "stage_2", status: "won" }),
      RECEIVED_AT
    );
    expect(t!.kind).toBe("status_change");
    expect(t!.status).toBe("won");
    expect(t!.toStageId).toBe("stage_2");
  });

  it("no registra nada cuando no cambió ni la etapa ni el estado", () => {
    // Un OpportunityUpdate que sólo cambió el nombre o el responsable no debe
    // sumar a ningún conteo de etapa.
    const t = deriveTransition(
      { stageId: "stage_2", status: "open" },
      event({ eventType: "OpportunityUpdate", name: "Otro nombre" }),
      RECEIVED_AT
    );
    expect(t).toBeNull();
  });

  it("no registra transición para una baja", () => {
    const t = deriveTransition(
      { stageId: "stage_2", status: "open" },
      event({ eventType: "OpportunityDelete", isDelete: true }),
      RECEIVED_AT
    );
    expect(t).toBeNull();
  });

  it("no afirma un movimiento si el evento no trae etapa", () => {
    const t = deriveTransition(
      { stageId: "stage_2", status: "open" },
      event({ stageId: null, status: "open" }),
      RECEIVED_AT
    );
    expect(t).toBeNull();
  });

  it("usa el momento de recepción, no dateAdded", () => {
    // GHL no manda el timestamp del cambio; dateAdded es la fecha de creación
    // de la oportunidad y usarla pondría la transición en el período equivocado.
    const t = deriveTransition(null, event({ dateAdded: "2020-01-01T00:00:00.000Z" }), RECEIVED_AT);
    expect(t!.occurredAt).toBe(RECEIVED_AT);
  });

  it("arrastra el id del evento para deduplicar reentregas", () => {
    const t = deriveTransition(null, event({ eventId: "wh_42" }), RECEIVED_AT);
    expect(t!.eventId).toBe("wh_42");
  });
});

describe("isPeriodCovered", () => {
  it("no cubre nada si nunca llegó un webhook", () => {
    expect(isPeriodCovered(null, "2026-08-01T00:00:00.000Z")).toBe(false);
    expect(isPeriodCovered(undefined, "2026-08-01T00:00:00.000Z")).toBe(false);
  });

  it("no cubre un período que empieza antes del borde", () => {
    // Ese período daría cero transiciones, pero el cero significa "OTC no
    // estaba mirando", no "no pasó nada".
    expect(isPeriodCovered("2026-08-15T00:00:00.000Z", "2026-08-01T00:00:00.000Z")).toBe(false);
  });

  it("no cubre un período que cruza el borde a la mitad", () => {
    // Un conteo parcial presentado como completo es peor que un hueco visible.
    expect(isPeriodCovered("2026-08-15T00:00:00.000Z", "2026-08-10T00:00:00.000Z")).toBe(false);
  });

  it("cubre un período que empieza en el borde o después", () => {
    expect(isPeriodCovered("2026-08-15T00:00:00.000Z", "2026-08-15T00:00:00.000Z")).toBe(true);
    expect(isPeriodCovered("2026-08-15T00:00:00.000Z", "2026-08-20T00:00:00.000Z")).toBe(true);
  });

  it("no cubre nada con fechas inválidas", () => {
    expect(isPeriodCovered("no-es-fecha", "2026-08-20T00:00:00.000Z")).toBe(false);
    expect(isPeriodCovered("2026-08-15T00:00:00.000Z", "no-es-fecha")).toBe(false);
  });
});
