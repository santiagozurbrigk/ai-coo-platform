import { describe, expect, it } from "vitest";
import {
  buildLeadThread,
  isActionable,
  LEAD_THREAD_STATE_LABEL,
  ACTIONABLE_STATES,
  type LeadAttempt,
} from "@/lib/sales/lead-thread";

const NOW = new Date("2026-09-10T12:00:00Z");

/** Días respecto de "ahora". Negativo = pasado. */
function day(offset: number): string {
  return new Date(NOW.getTime() + offset * 24 * 60 * 60 * 1000).toISOString();
}

function attempt(over: Partial<LeadAttempt> = {}): LeadAttempt {
  return {
    id: "a1",
    scheduledAt: day(-3),
    status: "not_closed",
    nextAction: null,
    nextActionAt: null,
    preCallQualification: null,
    postCallQualification: null,
    ...over,
  };
}

describe("la fuga que la Fase 2 viene a tapar", () => {
  it("una llamada que no cerró y sin próximo paso queda marcada como fuga", () => {
    // El lead tuvo su llamada, no compró, y nadie definió qué sigue: quedó sin
    // dueño y sin fecha.
    const thread = buildLeadThread([attempt()], NOW);
    expect(thread.state).toBe("stalled");
    expect(thread.actionableAttemptId).toBe("a1");
    expect(isActionable(thread.state)).toBe(true);
  });

  it("un no show sin próximo paso también es una fuga", () => {
    const thread = buildLeadThread([attempt({ status: "no_show" })], NOW);
    expect(thread.state).toBe("stalled");
  });

  it("con próximo paso a futuro deja de ser una fuga", () => {
    const thread = buildLeadThread(
      [attempt({ nextAction: "follow_up", nextActionAt: day(3) })],
      NOW
    );
    expect(thread.state).toBe("follow_up_planned");
    expect(isActionable(thread.state)).toBe(false);
  });
});

describe("trabajo pendiente", () => {
  it("una llamada que ya pasó sin resultado pide que se cargue", () => {
    const thread = buildLeadThread(
      [attempt({ status: "scheduled", scheduledAt: day(-1) })],
      NOW
    );
    expect(thread.state).toBe("pending_outcome");
    expect(thread.actionableAttemptId).toBe("a1");
  });

  it("un seguimiento vencido pesa más que un resultado sin cargar", () => {
    // Una fecha que pasó es un compromiso incumplido.
    const thread = buildLeadThread(
      [
        attempt({
          id: "vencido",
          status: "not_closed",
          nextAction: "reschedule",
          nextActionAt: day(-2),
        }),
        attempt({ id: "sin-resultado", status: "scheduled", scheduledAt: day(-1) }),
      ],
      NOW
    );
    expect(thread.state).toBe("follow_up_due");
    expect(thread.actionableAttemptId).toBe("vencido");
  });

  it("una llamada asistida sin resultado también pide desenlace", () => {
    const thread = buildLeadThread(
      [attempt({ status: "attended", scheduledAt: day(-1) })],
      NOW
    );
    expect(thread.state).toBe("pending_outcome");
  });
});

describe("estados que no piden nada", () => {
  it("un turno futuro está en curso", () => {
    const thread = buildLeadThread(
      [attempt({ status: "scheduled", scheduledAt: day(2) })],
      NOW
    );
    expect(thread.state).toBe("scheduled");
    expect(thread.actionableAttemptId).toBeNull();
  });

  it("una venta cerrada gana sobre todo lo demás", () => {
    const thread = buildLeadThread(
      [
        attempt({ id: "cerrada", status: "closed", scheduledAt: day(-1) }),
        attempt({ id: "vieja", status: "not_closed", scheduledAt: day(-30) }),
      ],
      NOW
    );
    expect(thread.state).toBe("won");
    expect(thread.actionableAttemptId).toBeNull();
  });

  it("una cancelada no pide cargar resultado: no hay nada que cargar", () => {
    const thread = buildLeadThread(
      [attempt({ status: "cancelled", nextAction: "reschedule", nextActionAt: day(5) })],
      NOW
    );
    expect(thread.state).toBe("follow_up_planned");
  });
});

describe("perdido", () => {
  it("se declara desde el intento más reciente", () => {
    const thread = buildLeadThread([attempt({ nextAction: "lost" })], NOW);
    expect(thread.state).toBe("lost");
  });

  it("un perdido viejo seguido de un turno nuevo significa que el lead volvió", () => {
    const thread = buildLeadThread(
      [
        attempt({ id: "viejo", scheduledAt: day(-30), nextAction: "lost" }),
        attempt({ id: "nuevo", scheduledAt: day(4), status: "scheduled" }),
      ],
      NOW
    );
    expect(thread.state).toBe("scheduled");
  });

  it("un próximo paso vencido de tipo `lost` no genera trabajo", () => {
    const thread = buildLeadThread(
      [attempt({ nextAction: "lost", nextActionAt: day(-5) })],
      NOW
    );
    expect(thread.state).toBe("lost");
  });
});

describe("el hilo", () => {
  it("ordena los intentos del más reciente al más viejo", () => {
    const thread = buildLeadThread(
      [
        attempt({ id: "viejo", scheduledAt: day(-30) }),
        attempt({ id: "nuevo", scheduledAt: day(-1), status: "scheduled" }),
        attempt({ id: "medio", scheduledAt: day(-10) }),
      ],
      NOW
    );
    expect(thread.attempts.map((a) => a.id)).toEqual(["nuevo", "medio", "viejo"]);
    expect(thread.attemptCount).toBe(3);
  });

  it("una fecha inválida va al final y no desordena el resto", () => {
    const thread = buildLeadThread(
      [
        attempt({ id: "roto", scheduledAt: "vaya-a-saber" }),
        attempt({ id: "sano", scheduledAt: day(-1), status: "scheduled" }),
      ],
      NOW
    );
    expect(thread.attempts[0]!.id).toBe("sano");
  });

  it("la calificación posterior le gana a la previa", () => {
    const thread = buildLeadThread(
      [attempt({ preCallQualification: "hot", postCallQualification: "cold" })],
      NOW
    );
    expect(thread.latestQualification).toBe("cold");
  });

  it("sin calificación posterior usa la previa", () => {
    const thread = buildLeadThread([attempt({ preCallQualification: "warm" })], NOW);
    expect(thread.latestQualification).toBe("warm");
  });

  it("un lead sin intentos no rompe", () => {
    const thread = buildLeadThread([], NOW);
    expect(thread.attemptCount).toBe(0);
    expect(thread.actionableAttemptId).toBeNull();
  });
});

describe("vocabulario", () => {
  it("cada estado tiene etiqueta", () => {
    for (const state of Object.keys(LEAD_THREAD_STATE_LABEL)) {
      expect(LEAD_THREAD_STATE_LABEL[state as keyof typeof LEAD_THREAD_STATE_LABEL]).toBeTruthy();
    }
  });

  it("sólo los tres estados de trabajo son accionables", () => {
    expect(ACTIONABLE_STATES).toHaveLength(3);
    expect(isActionable("won")).toBe(false);
    expect(isActionable("scheduled")).toBe(false);
    expect(isActionable("follow_up_planned")).toBe(false);
    expect(isActionable("lost")).toBe(false);
  });
});
