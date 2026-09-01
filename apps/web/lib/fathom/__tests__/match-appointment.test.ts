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

describe("las dos señales juntas", () => {
  it("mail y horario coincidiendo dan confianza alta", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(3),
      inviteeEmails: ["mariano@acme.com"],
      candidates: [candidate()],
    });

    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.appointmentId).toBe("turno-1");
    expect(result.match.confidence).toBe("high");
    expect(result.match.matchedOn).toEqual(["email", "time"]);
    expect(result.match.minutesApart).toBe(3);
  });

  it("el mail no distingue mayúsculas ni espacios", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(2),
      inviteeEmails: ["  MARIANO@Acme.com "],
      candidates: [candidate()],
    });
    expect(result.status).toBe("matched");
  });
});

describe("una sola señal", () => {
  it("sólo el horario alcanza, con confianza media", () => {
    // Es el caso que hace que todo esto funcione sin que nadie configure nada.
    const result = matchRecordingToAppointment({
      recordingStart: at(10),
      inviteeEmails: [],
      candidates: [candidate({ leadEmail: null })],
    });

    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.confidence).toBe("medium");
    expect(result.match.matchedOn).toEqual(["time"]);
  });

  it("con mail coincidente la ventana se estira: una llamada puede arrancar tarde", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(180),
      inviteeEmails: ["mariano@acme.com"],
      candidates: [candidate()],
    });
    expect(result.status).toBe("matched");
  });

  it("sin mail, tres horas tarde ya no es el mismo turno", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(180),
      inviteeEmails: [],
      candidates: [candidate({ leadEmail: null })],
    });
    expect(result).toEqual({ status: "no_match", reason: "outside_window" });
  });
});

describe("el mail manda sobre la cercanía", () => {
  it("elige el turno del invitado aunque otro esté más cerca en el tiempo", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(5),
      inviteeEmails: ["mariano@acme.com"],
      candidates: [
        candidate({ id: "otro-lead", scheduledAt: at(4), leadEmail: "otro@x.com" }),
        candidate({ id: "turno-de-mariano", scheduledAt: at(-40) }),
      ],
    });

    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.appointmentId).toBe("turno-de-mariano");
  });
});

describe("cuando vincular sería adivinar", () => {
  it("dos turnos a la misma hora sin mail que los separe van a revisión", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(5),
      inviteeEmails: [],
      candidates: [
        candidate({ id: "a", leadEmail: null }),
        candidate({ id: "b", leadEmail: null }),
      ],
    });
    expect(result).toEqual({ status: "no_match", reason: "ambiguous" });
  });

  it("sin turnos en el período no hay match", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(0),
      inviteeEmails: ["mariano@acme.com"],
      candidates: [],
    });
    expect(result).toEqual({ status: "no_match", reason: "no_candidates" });
  });

  it("sin hora de grabación no se puede cruzar nada", () => {
    const result = matchRecordingToAppointment({
      recordingStart: null,
      inviteeEmails: ["mariano@acme.com"],
      candidates: [candidate()],
    });
    expect(result).toEqual({ status: "no_match", reason: "no_recording_time" });
  });

  it("una fecha inválida se trata como ausente, no rompe", () => {
    const result = matchRecordingToAppointment({
      recordingStart: "no-es-fecha",
      inviteeEmails: [],
      candidates: [candidate()],
    });
    expect(result).toEqual({ status: "no_match", reason: "no_recording_time" });
  });

  it("un turno con fecha inválida se ignora sin tumbar el resto", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(2),
      inviteeEmails: [],
      candidates: [
        candidate({ id: "roto", scheduledAt: "vaya-a-saber", leadEmail: null }),
        candidate({ id: "sano", leadEmail: null }),
      ],
    });
    expect(result.status).toBe("matched");
    if (result.status !== "matched") return;
    expect(result.match.appointmentId).toBe("sano");
  });
});

describe("una grabación anterior al turno", () => {
  it("cuenta igual: la ventana es simétrica", () => {
    const result = matchRecordingToAppointment({
      recordingStart: at(-10),
      inviteeEmails: [],
      candidates: [candidate({ leadEmail: null })],
    });
    expect(result.status).toBe("matched");
  });
});
