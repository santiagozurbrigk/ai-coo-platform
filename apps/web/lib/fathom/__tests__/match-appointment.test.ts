import { describe, expect, it } from "vitest";
import {
  matchRecordingToAppointment,
  type AppointmentCandidate,
} from "@/lib/fathom/match-appointment";

const TURNO = "2026-09-01T15:00:00Z";

function candidate(over: Partial<AppointmentCandidate> = {}): AppointmentCandidate {
  return {
    id: "turno-1",
    scheduledAt: TURNO,
    leadName: "Mariano Gonzales",
    leadEmail: "mariano@acme.com",
    ...over,
  };
}

/** Minutos después del turno. */
function at(minutes: number): string {
  return new Date(new Date(TURNO).getTime() + minutes * 60_000).toISOString();
}

describe("mail + horario: el cruce confirmado", () => {
  it("asocia cuando el mail de un participante es el del lead del turno", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(3),
      participantEmails: ["closer@otc.com", "mariano@acme.com"],
      candidates: [candidate()],
    });

    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.appointmentId).toBe("turno-1");
    expect(result.match.confidence).toBe("confirmed");
    expect(result.match.minutesApart).toBe(3);
  });

  it("el mail no distingue mayúsculas ni espacios", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(2),
      participantEmails: ["  MARIANO@Acme.com "],
      candidates: [candidate()],
    });
    expect(result.status).toBe("matched");
  });

  it("con mail la ventana es amplia: la llamada puede arrancar tarde", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(180),
      participantEmails: ["mariano@acme.com"],
      candidates: [candidate()],
    });
    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.confidence).toBe("confirmed");
  });

  it("gana sobre un turno más cercano en el tiempo pero de otro lead", () => {
    // El mail es identidad; la hora sólo corrobora.
    const result = matchRecordingToAppointment({
      recordingStart: at(5),
      participantEmails: ["mariano@acme.com"],
      candidates: [
        candidate({ id: "otro", scheduledAt: at(4), leadEmail: "otro@x.com" }),
        candidate({ id: "el-de-mariano", scheduledAt: at(-40) }),
      ],
    });

    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.appointmentId).toBe("el-de-mariano");
  });

  it("el mismo lead con dos turnos a la misma hora no se resuelve solo", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(5),
      participantEmails: ["mariano@acme.com"],
      candidates: [
        candidate({ id: "a" }),
        candidate({ id: "b" }),
      ],
    });
    expect(result).toEqual({ status: "no_match", reason: "ambiguous" });
  });
});

describe("sólo horario: el cruce provisional", () => {
  it("asocia cuando hay un ÚNICO turno en la ventana", () => {
    // Existe porque los turnos todavía no tienen mail: `lead_email` se agregó en
    // la Fase 0 y se llena a medida que corren los syncs. Con la regla estricta
    // no se asociaría ninguna llamada durante semanas.
    const result = matchRecordingToAppointment({
      recordingStart: at(10),
      participantEmails: ["mariano@acme.com"],
      candidates: [candidate({ leadEmail: null })],
    });

    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.confidence).toBe("provisional");
  });

  it("con dos turnos posibles NO asocia: elegir el más cercano sería adivinar", () => {
    // Un vínculo mal hecho le adjudica a un lead una llamada que no tuvo.
    const result = matchRecordingToAppointment({
      recordingStart: at(5),
      participantEmails: [],
      candidates: [
        candidate({ id: "a", leadEmail: null }),
        candidate({ id: "b", scheduledAt: at(30), leadEmail: null }),
      ],
    });
    expect(result).toEqual({ status: "no_match", reason: "ambiguous" });
  });

  it("la ventana sin mail es corta", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(120),
      participantEmails: [],
      candidates: [candidate({ leadEmail: null })],
    });
    expect(result).toEqual({ status: "no_match", reason: "outside_window" });
  });

  it("una grabación anterior al turno cuenta igual: la ventana es simétrica", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(-10),
      participantEmails: [],
      candidates: [candidate({ leadEmail: null })],
    });
    expect(result.status).toBe("matched");
  });
});

describe("lo que no cruza", () => {
  it("sin turnos cerca no hay match", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(0),
      participantEmails: ["mariano@acme.com"],
      candidates: [],
    });
    expect(result).toEqual({ status: "no_match", reason: "no_candidates" });
  });

  it("sin hora de grabación no se puede cruzar nada", () => {
    const result = matchRecordingToAppointment({
      recordingStart: null,
      participantEmails: ["mariano@acme.com"],
      candidates: [candidate()],
    });
    expect(result).toEqual({ status: "no_match", reason: "no_recording_time" });
  });

  it("una fecha inválida se trata como ausente, no rompe", () => {
    const result = matchRecordingToAppointment({
      recordingStart: "no-es-fecha",
      participantEmails: [],
      candidates: [candidate()],
    });
    expect(result).toEqual({ status: "no_match", reason: "no_recording_time" });
  });

  it("un turno con fecha inválida se ignora sin tumbar el resto", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(2),
      participantEmails: ["mariano@acme.com"],
      candidates: [
        candidate({ id: "roto", scheduledAt: "vaya-a-saber" }),
        candidate({ id: "sano" }),
      ],
    });
    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.appointmentId).toBe("sano");
  });

  it("una reunión de equipo no cruza, y eso es correcto", () => {
    // Nadie del equipo tiene el mail de un lead, y no hay turno a esa hora.
    const result = matchRecordingToAppointment({
      recordingStart: at(600),
      participantEmails: ["santi@otc.com", "ana@otc.com"],
      candidates: [candidate()],
    });
    expect(result.status).toBe("no_match");
  });
});
