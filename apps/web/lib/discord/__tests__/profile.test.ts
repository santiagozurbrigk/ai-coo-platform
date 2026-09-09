import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyGuildProfile, toImageDataUri } from "../profile";
import { DiscordApiError } from "../api";

const GUILD = "123456789";

function responderCon(status: number) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => new Response(null, { status }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv("DISCORD_BOT_TOKEN", "token-de-prueba");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("toImageDataUri", () => {
  it("arma el data URI que espera Discord", () => {
    expect(toImageDataUri(Buffer.from("hola"), "image/png")).toBe(
      "data:image/png;base64,aG9sYQ==",
    );
  });
});

describe("applyGuildProfile", () => {
  it("hace PATCH al miembro propio del servidor con el token del bot", async () => {
    const fetchMock = responderCon(200);

    await applyGuildProfile(GUILD, { nick: "Asistente Acme" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://discord.com/api/v10/guilds/${GUILD}/members/@me`);
    expect(init?.method).toBe("PATCH");
    expect(init?.body).toBe(JSON.stringify({ nick: "Asistente Acme" }));
    expect(
      (init?.headers as Record<string, string>).Authorization,
    ).toBe("Bot token-de-prueba");
  });

  it("manda el avatar en null para volver a la foto de la aplicación", async () => {
    const fetchMock = responderCon(200);

    await applyGuildProfile(GUILD, { avatar: null });

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.body).toBe(JSON.stringify({ avatar: null }));
  });

  /**
   * ⭐ El caso que más va a pasar: `CHANGE_NICKNAME` se agregó a la invitación
   * junto con esta función, así que toda instalación anterior lo tiene sin
   * otorgar. El texto tiene que decir cómo salir, no sólo que falló.
   */
  it("explica el 403 del apodo como un permiso faltante y cómo darlo", async () => {
    responderCon(403);

    await expect(applyGuildProfile(GUILD, { nick: "Acme" })).rejects.toThrow(
      /Cambiar apodo/,
    );
    await expect(applyGuildProfile(GUILD, { nick: "Acme" })).rejects.toThrow(
      /Volvé a conectar Discord/,
    );
  });

  it("no habla de permisos cuando el 403 es de la foto, que no necesita ninguno", async () => {
    responderCon(403);

    await expect(
      applyGuildProfile(GUILD, { avatar: "data:image/png;base64,AA==" }),
    ).rejects.toThrow(/siga en el servidor/);
  });

  it("distingue el 400 del nombre del 400 de la imagen", async () => {
    responderCon(400);
    await expect(applyGuildProfile(GUILD, { nick: "x" })).rejects.toThrow(
      /ese nombre/,
    );

    responderCon(400);
    await expect(applyGuildProfile(GUILD, { avatar: "data:" })).rejects.toThrow(
      /PNG, JPG o GIF/,
    );
  });

  it("traduce el 429 en una espera, no en un error genérico", async () => {
    responderCon(429);
    await expect(applyGuildProfile(GUILD, { nick: "x" })).rejects.toThrow(
      /Esperá un minuto/,
    );
  });

  it("dice que el bot ya no está cuando Discord contesta 404", async () => {
    responderCon(404);
    await expect(applyGuildProfile(GUILD, { nick: "x" })).rejects.toThrow(
      /no encuentra al bot/,
    );
  });

  it("falla con un mensaje accionable si no hay token en el servidor", async () => {
    vi.stubEnv("DISCORD_BOT_TOKEN", "");
    responderCon(200);

    await expect(applyGuildProfile(GUILD, { nick: "x" })).rejects.toThrow(
      DiscordApiError,
    );
    await expect(applyGuildProfile(GUILD, { nick: "x" })).rejects.toThrow(
      /DISCORD_BOT_TOKEN/,
    );
  });

  it("no deja la pantalla colgada si Discord no responde", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      }),
    );

    await expect(applyGuildProfile(GUILD, { nick: "x" })).rejects.toThrow(
      /no respondió a tiempo/,
    );
  });
});
