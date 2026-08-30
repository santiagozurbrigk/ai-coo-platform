import { describe, expect, it } from "vitest";
import { countCommentTriggers } from "../triggers";

const FROM = "2026-08-01T00:00:00.000Z";
const TO = "2026-09-01T00:00:00.000Z";

describe("countCommentTriggers (M34)", () => {
  it("cuenta los comentarios del período cuando la ventana lo cubre", () => {
    const result = countCommentTriggers(
      [
        { createdAt: "2026-07-15T00:00:00.000Z" }, // anterior: prueba cobertura
        { createdAt: "2026-08-05T00:00:00.000Z" },
        { createdAt: "2026-08-20T00:00:00.000Z" },
        { createdAt: "2026-09-10T00:00:00.000Z" }, // posterior
      ],
      FROM,
      TO
    );
    expect(result.value).toBe(2);
    expect(result.reason).toBeNull();
  });

  it("⭐ devuelve null si el más antiguo ya está dentro del período", () => {
    // `listComments` es un inbox de tamaño desconocido: si no vimos nada más
    // viejo que el inicio, el borde de la ventana es indistinguible de un borde
    // real de datos. Contar 2 y presentarlo como el total sería reportar un
    // número incompleto como completo.
    const result = countCommentTriggers(
      [{ createdAt: "2026-08-05T00:00:00.000Z" }, { createdAt: "2026-08-20T00:00:00.000Z" }],
      FROM,
      TO
    );
    expect(result.value).toBeNull();
    expect(result.reason).toBe("window_too_short");
    expect(result.oldestSeen).toBe("2026-08-05T00:00:00.000Z");
  });

  it("también devuelve null si el más antiguo cae justo en el inicio", () => {
    // Caso límite deliberadamente estricto: erramos hacia "sin datos".
    const result = countCommentTriggers([{ createdAt: FROM }], FROM, TO);
    expect(result.value).toBeNull();
    expect(result.reason).toBe("window_too_short");
  });

  it("devuelve null sin comentarios", () => {
    const result = countCommentTriggers([], FROM, TO);
    expect(result.value).toBeNull();
    expect(result.reason).toBe("no_comments");
  });

  it("devuelve null si ninguno trae fecha legible", () => {
    const result = countCommentTriggers(
      [{ createdAt: "" }, { createdAt: null as unknown as string }],
      FROM,
      TO
    );
    expect(result.value).toBeNull();
    expect(result.reason).toBe("no_comments");
  });

  it("un cero real se respeta cuando la ventana cubre el período", () => {
    // Vimos comentarios anteriores al período y ninguno dentro: el cero es real.
    const result = countCommentTriggers([{ createdAt: "2026-06-01T00:00:00.000Z" }], FROM, TO);
    expect(result.value).toBe(0);
    expect(result.reason).toBeNull();
  });

  it("el final del período es exclusivo", () => {
    const result = countCommentTriggers(
      [{ createdAt: "2026-07-01T00:00:00.000Z" }, { createdAt: TO }],
      FROM,
      TO
    );
    expect(result.value).toBe(0);
  });
});
