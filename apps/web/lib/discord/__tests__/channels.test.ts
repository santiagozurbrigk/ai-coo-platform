import { describe, expect, it } from "vitest";
import {
  clienteDelCanal,
  normalizarCanal,
  normalizarCanales,
  sugerirWins,
} from "../channels";

describe("normalizarCanal", () => {
  it("lee un canal ya migrado tal cual", () => {
    expect(
      normalizarCanal({
        channel_id: "1",
        channel_name: "cliente-juan",
        purpose: "client",
        wins: false,
      })
    ).toEqual({
      channel_id: "1",
      channel_name: "cliente-juan",
      purpose: "client",
      wins: false,
      added_at: undefined,
    });
  });

  it("un purpose viejo cae en community, que es no atribuir nada", () => {
    for (const viejo of ["clients", "testimonials", "general", "auto", null, 7]) {
      expect(
        normalizarCanal({ channel_id: "1", channel_name: "x", purpose: viejo })
          ?.purpose
      ).toBe("community");
    }
  });

  it("sin wins guardado, usa el nombre como pista", () => {
    expect(
      normalizarCanal({ channel_id: "1", channel_name: "『🏆』wins" })?.wins
    ).toBe(true);
    expect(
      normalizarCanal({ channel_id: "1", channel_name: "chat-general" })?.wins
    ).toBe(false);
  });

  it("un wins guardado le gana al nombre", () => {
    expect(
      normalizarCanal({ channel_id: "1", channel_name: "wins", wins: false })
        ?.wins
    ).toBe(false);
    expect(
      normalizarCanal({ channel_id: "1", channel_name: "pepe", wins: true })
        ?.wins
    ).toBe(true);
  });

  it("descarta lo que no es un canal", () => {
    expect(normalizarCanal(null)).toBeNull();
    expect(normalizarCanal("hola")).toBeNull();
    expect(normalizarCanal({ channel_name: "sin id" })).toBeNull();
    expect(normalizarCanales("no es lista")).toEqual([]);
    expect(normalizarCanales([{ channel_id: "1" }, null, 3])).toHaveLength(1);
  });
});

describe("sugerirWins", () => {
  it("reconoce los nombres de canales de logros del servidor real", () => {
    expect(sugerirWins("『🏆』wins")).toBe(true);
    expect(sugerirWins("『🏆』wins-personales")).toBe(true);
    expect(sugerirWins("TESTIMONIOS")).toBe(true);
    expect(sugerirWins("casos-de-exito")).toBe(true);
  });

  it("no marca los canales que no lo son", () => {
    for (const nombre of [
      "『❓』como-preguntar",
      "『👨』equipo",
      "『👨🏻』presentación",
      "『💬』chat-general",
      "『📝』clases-fast-roadmap",
      "cuentas",
    ]) {
      expect(sugerirWins(nombre)).toBe(false);
    }
  });
});

describe("clienteDelCanal", () => {
  it("atribuye sólo cuando el canal tiene un dueño", () => {
    expect(clienteDelCanal(["a"])).toBe("a");
  });

  it("con varios dueños no inventa: no se sabe cuál escribió", () => {
    expect(clienteDelCanal(["a", "b"])).toBeNull();
    expect(clienteDelCanal(["a", "b", "c"])).toBeNull();
  });

  it("sin dueños, nada", () => {
    expect(clienteDelCanal([])).toBeNull();
  });
});
