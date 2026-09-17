import { describe, expect, it } from "vitest";
import {
  SILENCE_THRESHOLD_DAYS,
  describeActivity,
  summarizeByClient,
  summarizeClientActivity,
} from "@/lib/discord/activity";

const NOW = new Date("2026-09-03T12:00:00Z");

/** Un mensaje enviado hace N días. */
function daysAgo(days: number) {
  return {
    sentAt: new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString(),
  };
}

describe("actividad de un cliente", () => {
  it("cuenta total, últimos 7 y últimos 30 días", () => {
    const activity = summarizeClientActivity(
      [daysAgo(1), daysAgo(3), daysAgo(10), daysAgo(45)],
      NOW
    );
    expect(activity.totalMessages).toBe(4);
    expect(activity.messagesLast7Days).toBe(2);
    expect(activity.messagesLast30Days).toBe(3);
  });

  it("el último mensaje es el más reciente, no el último del arreglo", () => {
    const activity = summarizeClientActivity([daysAgo(30), daysAgo(2), daysAgo(9)], NOW);
    expect(activity.daysSinceLastMessage).toBe(2);
  });

  it("cuenta los testimonios que marcó el bot", () => {
    const activity = summarizeClientActivity(
      [
        { ...daysAgo(1), isTestimonial: true },
        { ...daysAgo(2), isTestimonial: false },
        { ...daysAgo(3), isTestimonial: true },
      ],
      NOW
    );
    expect(activity.testimonials).toBe(2);
  });

  it("ignora fechas que no se pueden leer en vez de romper el resumen", () => {
    const activity = summarizeClientActivity(
      [{ sentAt: "no es una fecha" }, daysAgo(2)],
      NOW
    );
    expect(activity.totalMessages).toBe(1);
    expect(activity.daysSinceLastMessage).toBe(2);
  });
});

describe("⭐ la señal de silencio", () => {
  it("un cliente que no habla hace más del umbral está en silencio", () => {
    const activity = summarizeClientActivity([daysAgo(SILENCE_THRESHOLD_DAYS + 1)], NOW);
    expect(activity.isSilent).toBe(true);
  });

  it("justo en el umbral ya cuenta", () => {
    expect(summarizeClientActivity([daysAgo(SILENCE_THRESHOLD_DAYS)], NOW).isSilent).toBe(
      true
    );
  });

  it("uno que habló ayer no está en silencio", () => {
    expect(summarizeClientActivity([daysAgo(1)], NOW).isSilent).toBe(false);
  });

  it("⭐ uno que NUNCA habló no está en silencio: es otro problema", () => {
    // Marcarlo confundiría "no lo conectamos todavía" con "se está yendo".
    const activity = summarizeClientActivity([], NOW);
    expect(activity.isSilent).toBe(false);
    expect(activity.neverSpoke).toBe(true);
    expect(activity.lastMessageAt).toBeNull();
  });
});

describe("cómo se lee", () => {
  it("dice lo que corresponde en cada caso", () => {
    expect(describeActivity(summarizeClientActivity([], NOW))).toBe("Nunca escribió");
    expect(describeActivity(summarizeClientActivity([daysAgo(0)], NOW))).toBe(
      "Escribió hoy"
    );
    expect(describeActivity(summarizeClientActivity([daysAgo(1)], NOW))).toBe(
      "Escribió ayer"
    );
    expect(describeActivity(summarizeClientActivity([daysAgo(20)], NOW))).toContain("20");
  });
});

describe("resumir todos los clientes de una", () => {
  it("agrupa por cliente sin mezclar", () => {
    const result = summarizeByClient(
      [
        { ...daysAgo(1), clientId: "a" },
        { ...daysAgo(30), clientId: "b" },
        { ...daysAgo(2), clientId: "a" },
      ],
      NOW
    );
    expect(result.a?.totalMessages).toBe(2);
    expect(result.a?.isSilent).toBe(false);
    expect(result.b?.isSilent).toBe(true);
  });

  it("⭐ un mensaje sin cliente vinculado no es actividad de nadie", () => {
    const result = summarizeByClient(
      [{ ...daysAgo(1), clientId: null }, { ...daysAgo(1), clientId: "a" }],
      NOW
    );
    expect(Object.keys(result)).toEqual(["a"]);
  });
});

describe("atribución por canal y el reloj del silencio", () => {
  const hoy = new Date("2026-09-17T12:00:00Z");
  const hace = (dias: number) =>
    new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000).toISOString();

  it("un mensaje del coach en el canal del cliente no apaga la alerta", () => {
    const actividad = summarizeClientActivity(
      [
        { sentAt: hace(40), attributedBy: "person" },
        // El equipo escribió ayer en el canal de Juan. Juan sigue callado.
        { sentAt: hace(1), attributedBy: "channel" },
      ],
      hoy
    );

    expect(actividad.isSilent).toBe(true);
    expect(actividad.daysSinceLastMessage).toBe(40);
    expect(actividad.totalMessages).toBe(2);
    expect(actividad.channelMessages).toBe(1);
  });

  it("sin atribución explícita se cuenta como del cliente, igual que antes", () => {
    const actividad = summarizeClientActivity([{ sentAt: hace(2) }], hoy);
    expect(actividad.daysSinceLastMessage).toBe(2);
    expect(actividad.channelMessages).toBe(0);
    expect(actividad.silenceMeasurable).toBe(true);
  });

  it("sólo actividad de canal: el silencio no se puede medir", () => {
    const actividad = summarizeClientActivity(
      [
        { sentAt: hace(3), attributedBy: "channel" },
        { sentAt: hace(1), attributedBy: "channel" },
      ],
      hoy
    );

    expect(actividad.silenceMeasurable).toBe(false);
    expect(actividad.isSilent).toBe(false);
    expect(actividad.totalMessages).toBe(2);
    expect(describeActivity(actividad)).toBe("Falta vincular a su usuario");
  });

  it("sin ningún mensaje sigue siendo «nunca escribió», no «falta vincular»", () => {
    const actividad = summarizeClientActivity([], hoy);
    expect(actividad.silenceMeasurable).toBe(true);
    expect(actividad.neverSpoke).toBe(true);
    expect(describeActivity(actividad)).toBe("Nunca escribió");
  });

  it("los totales incluyen lo del canal; el reloj no", () => {
    const actividad = summarizeClientActivity(
      [
        { sentAt: hace(1), attributedBy: "channel" },
        { sentAt: hace(2), attributedBy: "channel" },
        { sentAt: hace(5), attributedBy: "person" },
      ],
      hoy
    );

    expect(actividad.totalMessages).toBe(3);
    expect(actividad.messagesLast7Days).toBe(3);
    expect(actividad.channelMessages).toBe(2);
    expect(actividad.daysSinceLastMessage).toBe(5);
  });

  it("un testimonio cuenta aunque lo haya traído el canal", () => {
    const actividad = summarizeClientActivity(
      [{ sentAt: hace(1), attributedBy: "channel", isTestimonial: true }],
      hoy
    );
    expect(actividad.testimonials).toBe(1);
  });
});
