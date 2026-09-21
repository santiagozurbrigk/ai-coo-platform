import { describe, expect, it } from "vitest";
import {
  extractSharePayload,
  extractTranscriptEmails,
  parseFathomShareUrl,
  parseTranscriptResponse,
} from "@/lib/fathom/share-link";

/**
 * El HTML es una reproducción de la estructura real —verificada contra una
 * grabación el 2026-09-20— con datos inventados. No se commitea una
 * conversación real: el transcript de un cliente no es material de test.
 */
function buildSharePage(
  overrides: Record<string, unknown> = {},
  propOverrides: Record<string, unknown> = {}
): string {
  const payload = {
    component: "Calls/Show",
    props: {
      currentUser: null,
      access: "external_view_only",
      duration: 700.947,
      copyTranscriptUrl:
        "https://fathom.video/calls/829266792/copy_transcript?token=TOKENDEPRUEBA",
      call: {
        id: 829266792,
        title: "Impromptu Google Meet Meeting",
        topic: "Impromptu Google Meet Meeting",
        duration_minutes: 15,
        started_at: "2026-09-18T14:48:50.000000Z",
        recording: { started_at: "2026-09-18T14:58:33.750005Z" },
        host: {
          email: "coach@limitless.test",
          company: { domain: "limitless.test" },
        },
        state: "finalized",
        ...overrides,
      },
      ...propOverrides,
    },
    url: "/share/TOKENDEPRUEBA",
    version: "abc123",
  };

  const escaped = JSON.stringify(payload)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return `<!DOCTYPE html><html><body><div id="app" data-page="${escaped}"></div></body></html>`;
}

describe("⭐ del link compartido sale el ID que pide la API oficial", () => {
  it("acepta el link tal como lo copia alguien", () => {
    expect(
      parseFathomShareUrl("https://fathom.video/share/iH6knxaB2pFD2P6J3NwazfwwerfBcFxv")
    ).toEqual({
      token: "iH6knxaB2pFD2P6J3NwazfwwerfBcFxv",
      url: "https://fathom.video/share/iH6knxaB2pFD2P6J3NwazfwwerfBcFxv",
    });
  });

  it("tolera sin https, con www, con barra final y con parámetros de más", () => {
    const esperado = "iH6knxaB2pFD2P6J3NwazfwwerfBcFxv";
    for (const entrada of [
      "fathom.video/share/iH6knxaB2pFD2P6J3NwazfwwerfBcFxv",
      "https://www.fathom.video/share/iH6knxaB2pFD2P6J3NwazfwwerfBcFxv/",
      "  https://fathom.video/share/iH6knxaB2pFD2P6J3NwazfwwerfBcFxv?utm_source=slack  ",
    ]) {
      expect(parseFathomShareUrl(entrada)?.token).toBe(esperado);
    }
  });

  /**
   * ⭐ La vista privada pide sesión iniciada. Aceptarla acá daría un error
   * incomprensible más adelante, en vez de "pegá el link de compartir".
   */
  it("rechaza la vista privada, otros dominios y lo que no es un link", () => {
    expect(parseFathomShareUrl("https://fathom.video/calls/829266792")).toBeNull();
    expect(parseFathomShareUrl("https://fathom.video/xyz123")).toBeNull();
    expect(parseFathomShareUrl("https://notfathom.video/share/abc12345")).toBeNull();
    expect(parseFathomShareUrl("cualquier cosa")).toBeNull();
    expect(parseFathomShareUrl("")).toBeNull();
  });
});

describe("⭐ el payload de la página compartida", () => {
  it("saca ID, título, fecha, duración, anfitrión y link al transcript", () => {
    const payload = extractSharePayload(buildSharePage());

    expect(payload).not.toBeNull();
    expect(payload!.callId).toBe("829266792");
    expect(payload!.title).toBe("Impromptu Google Meet Meeting");
    expect(payload!.startedAt).toBe("2026-09-18T14:48:50.000000Z");
    expect(payload!.durationSeconds).toBe(701);
    expect(payload!.host.email).toBe("coach@limitless.test");
    expect(payload!.transcriptUrl).toContain("copy_transcript");
  });

  it("guarda el payload crudo para poder arreglar el mapeo el día que cambie", () => {
    const payload = extractSharePayload(buildSharePage());
    expect((payload!.raw as { props: { access: string } }).props.access).toBe(
      "external_view_only"
    );
  });

  it("cae a los minutos redondeados cuando no viene la duración exacta", () => {
    const payload = extractSharePayload(buildSharePage({}, { duration: null }));
    expect(payload!.durationSeconds).toBe(15 * 60);
  });

  /**
   * ⭐ Una llamada sin duración conocida **no dura cero**. El cero se leería
   * como un dato real y ensuciaría cualquier promedio que se calcule después.
   */
  it("deja la duración en null cuando no hay ninguna de las dos", () => {
    const payload = extractSharePayload(
      buildSharePage({ duration_minutes: null }, { duration: null })
    );
    expect(payload!.durationSeconds).toBeNull();
  });

  it("falla de forma limpia si Fathom cambia el formato", () => {
    expect(extractSharePayload("<html><body>nada</body></html>")).toBeNull();
    expect(extractSharePayload('<div data-page="{roto"></div>')).toBeNull();
    expect(
      extractSharePayload('<div data-page="{&quot;props&quot;:{}}"></div>')
    ).toBeNull();
  });

  it("sin ID no hay llamada que guardar", () => {
    expect(extractSharePayload(buildSharePage({ id: null }))).toBeNull();
  });
});

describe("el transcript", () => {
  it("usa plain_text, que es el que trae los mails", () => {
    expect(
      parseTranscriptResponse({ html: "<p>hola</p>", plain_text: "0:00 - Ana\n  Hola" })
    ).toBe("0:00 - Ana\n  Hola");
  });

  it("devuelve null cuando viene vacío o no es lo esperado", () => {
    expect(parseTranscriptResponse({ html: "<p>x</p>", plain_text: "   " })).toBeNull();
    expect(parseTranscriptResponse(null)).toBeNull();
    expect(parseTranscriptResponse(42)).toBeNull();
  });

  /**
   * ⭐ Esto es lo que le falta al sistema para asociar llamadas solo. El
   * transcript identifica a quien habla con su mail.
   */
  it("junta los mails de quienes hablan, sin repetir y sin puntuación pegada", () => {
    const transcript = [
      "0:00 - Santiago Zurbrigk (santi@limitless.test)",
      "  Hola.",
      "0:12 - Manuel Dominguez (manu@cliente.test).",
      "  ¿Cómo andás?",
      "0:30 - Santiago Zurbrigk (SANTI@limitless.test)",
      "  Todo bien.",
    ].join("\n");

    expect(extractTranscriptEmails(transcript)).toEqual([
      "santi@limitless.test",
      "manu@cliente.test",
    ]);
  });

  it("no encuentra mails donde no los hay", () => {
    expect(extractTranscriptEmails("0:00 - Manuel\n  Hola")).toEqual([]);
  });
});
