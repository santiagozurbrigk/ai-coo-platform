import { describe, expect, it } from "vitest";
import {
  normalizeRegistrant,
  parseWebinarJamDate,
  parseWebinarJamFlag,
} from "../normalize-registrant";

describe("parseWebinarJamDate", () => {
  it("lee un epoch en segundos", () => {
    // La doc declara signup_date como `integer` sin decir la unidad.
    expect(parseWebinarJamDate(1756512000)).toBe("2025-08-30T00:00:00.000Z");
  });

  it("lee un epoch en milisegundos", () => {
    expect(parseWebinarJamDate(1756512000000)).toBe("2025-08-30T00:00:00.000Z");
  });

  it("lee un epoch que vino como texto", () => {
    expect(parseWebinarJamDate("1756512000")).toBe("2025-08-30T00:00:00.000Z");
  });

  it("lee una fecha en texto", () => {
    expect(parseWebinarJamDate("2026-01-05 13:00")).not.toBeNull();
  });

  it("devuelve null para lo que no se puede leer", () => {
    // Lo que no se entiende queda sin dato: una fecha inventada pondría al
    // registrante en el período equivocado.
    expect(parseWebinarJamDate(null)).toBeNull();
    expect(parseWebinarJamDate(undefined)).toBeNull();
    expect(parseWebinarJamDate("")).toBeNull();
    expect(parseWebinarJamDate(0)).toBeNull();
    expect(parseWebinarJamDate(-5)).toBeNull();
    expect(parseWebinarJamDate("mañana")).toBeNull();
    expect(parseWebinarJamDate({})).toBeNull();
  });
});

describe("parseWebinarJamFlag", () => {
  it("⭐ la ausencia es null, no false", () => {
    // Contar como "no asistió" a alguien de quien la API no dijo nada hundiría
    // el show rate sin motivo.
    expect(parseWebinarJamFlag(undefined)).toBeNull();
    expect(parseWebinarJamFlag(null)).toBeNull();
    expect(parseWebinarJamFlag("")).toBeNull();
  });

  it("0 es false y los positivos son true", () => {
    expect(parseWebinarJamFlag(0)).toBe(false);
    expect(parseWebinarJamFlag(1)).toBe(true);
    expect(parseWebinarJamFlag(4)).toBe(true);
    expect(parseWebinarJamFlag("0")).toBe(false);
    expect(parseWebinarJamFlag("1")).toBe(true);
  });

  it("acepta booleanos y textos", () => {
    expect(parseWebinarJamFlag(true)).toBe(true);
    expect(parseWebinarJamFlag("true")).toBe(true);
    expect(parseWebinarJamFlag("no")).toBe(false);
  });

  it("devuelve null para un valor que no se entiende", () => {
    expect(parseWebinarJamFlag("quizás")).toBeNull();
    expect(parseWebinarJamFlag({})).toBeNull();
  });
});

describe("normalizeRegistrant", () => {
  const RAW = {
    first_name: "Ana",
    last_name: "Pérez",
    email: "  ANA@example.com ",
    webinar: 5,
    schedule: 34,
    signup_date: 1756512000,
    attended_live: 1,
    date_live: 1756598400,
    attended_replay: 0,
    purchased_live: 0,
    utm_source: "facebook",
    utm_campaign: "lanzamiento",
  };

  it("normaliza el email a minúsculas y sin espacios", () => {
    // Es la llave de deduplicación: si no se normaliza, el mismo registrante
    // entra dos veces en syncs sucesivos.
    expect(normalizeRegistrant(RAW)!.email).toBe("ana@example.com");
  });

  it("mapea los campos que importan", () => {
    const result = normalizeRegistrant(RAW)!;
    expect(result.scheduleId).toBe("34");
    expect(result.attendedLive).toBe(true);
    expect(result.attendedReplay).toBe(false);
    expect(result.signupAt).toBe("2025-08-30T00:00:00.000Z");
    expect(result.utmSource).toBe("facebook");
  });

  it("descarta un registrante sin email", () => {
    // Sin la llave de deduplicación, cada sync duplicaría la fila.
    expect(normalizeRegistrant({ first_name: "Sin mail" })).toBeNull();
  });

  it("tolera los campos opcionales que el webinar puede no tener habilitados", () => {
    // La doc marca last_name y phone como "sólo si están habilitados en la
    // configuración de ese webinar".
    const result = normalizeRegistrant({ email: "x@y.com" })!;
    expect(result.lastName).toBeNull();
    expect(result.attendedLive).toBeNull();
    expect(result.signupAt).toBeNull();
    expect(result.scheduleId).toBeNull();
  });
});
