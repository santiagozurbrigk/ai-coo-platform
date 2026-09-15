import { describe, expect, it } from "vitest";
import { buildSalesFunnel } from "@/lib/metrics/build-sales-funnel-stages";
import type { ClosingCall, ClosingCallStatus } from "@/types/closing";
import type { Conversation } from "@/types/sales";

function conversation(
  status: Conversation["status"],
  id = Math.random().toString(36)
): Conversation {
  return {
    id,
    leadName: "Lead",
    status,
    lastMessage: "",
    lastMessageAt: "2026-09-15T00:00:00.000Z",
    unread: false,
    messages: [],
    analysis: { responseTimeMinutes: 0 } as Conversation["analysis"],
  };
}

function call(status: ClosingCallStatus, id = Math.random().toString(36)): ClosingCall {
  return {
    id,
    leadName: "Lead",
    scheduledAt: "2026-09-15T00:00:00.000Z",
    status,
    formAnswers: [],
  };
}

describe("buildSalesFunnel", () => {
  it("arranca en los DMs cuando el inbox tiene datos", () => {
    const { stages, subtitle, conversion } = buildSalesFunnel(
      [
        conversation("active", "a"),
        conversation("booked", "b"),
        conversation("ghosted", "c"),
        conversation("ghosted", "d"),
      ],
      [call("closed", "1"), call("no_show", "2")]
    );

    expect(stages.map((s) => [s.id, s.value])).toEqual([
      ["leads", 4],
      ["responded", 2],
      ["scheduled", 2],
      ["attended", 1],
      ["closed", 1],
    ]);
    expect(subtitle).toBe("De los DMs al cierre");
    expect(conversion).toBe("25%");
  });

  it("descarta las etapas vacías de arriba y arranca en las llamadas", () => {
    // El caso real del panel general: el inbox viejo quedó vacío al pasar a Zernio.
    const { stages, subtitle } = buildSalesFunnel(
      [],
      [call("scheduled", "1"), call("not_closed", "2"), call("closed", "3")]
    );

    expect(stages.map((s) => s.id)).toEqual(["scheduled", "attended", "closed"]);
    expect(subtitle).toBe("De la llamada agendada al cierre");
  });

  it("nunca deja que una etapa supere a la anterior en el tramo de llamadas", () => {
    const calls: ClosingCall[] = [
      call("scheduled", "1"),
      call("attended", "2"),
      call("closed", "3"),
      call("not_closed", "4"),
      call("no_show", "5"),
      call("cancelled", "6"),
    ];

    const { stages } = buildSalesFunnel([], calls);
    const values = stages.map((s) => s.value);

    expect(values).toEqual([5, 3, 1]);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]!).toBeLessThanOrEqual(values[i - 1]!);
    }
  });

  it("no cuenta las llamadas canceladas como agendadas", () => {
    const { stages } = buildSalesFunnel([], [call("cancelled", "1"), call("scheduled", "2")]);
    expect(stages.find((s) => s.id === "scheduled")?.value).toBe(1);
  });

  it("conserva las etapas en cero del medio", () => {
    const { stages } = buildSalesFunnel(
      [conversation("ghosted", "a"), conversation("ghosted", "b")],
      []
    );

    expect(stages.map((s) => [s.id, s.value])).toEqual([
      ["leads", 2],
      ["responded", 0],
      ["scheduled", 0],
      ["attended", 0],
      ["closed", 0],
    ]);
  });

  it("devuelve un embudo vacío cuando no hay ningún dato", () => {
    const funnel = buildSalesFunnel([], []);

    expect(funnel.stages).toEqual([]);
    expect(funnel.conversion).toBeNull();
    expect(funnel.subtitle).toBe("");
  });

  it("muestra <1% en vez de 0% cuando la conversión existe pero es mínima", () => {
    const calls = Array.from({ length: 300 }, (_, i) =>
      call(i === 0 ? "closed" : "no_show", String(i))
    );

    expect(buildSalesFunnel([], calls).conversion).toBe("<1%");
  });
});
