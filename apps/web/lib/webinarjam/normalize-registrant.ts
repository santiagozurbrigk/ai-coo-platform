/**
 * lib/webinarjam/normalize-registrant.ts
 *
 * Traduce un registrante de WebinarJam a la fila que guarda OTC.
 *
 * Puro: se testea sin base ni red.
 *
 * ⚠️ **Tres campos que la doc declara sin decir su formato.** Es el motivo de que
 * este archivo exista aislado:
 *
 * | Campo | Declarado | Qué falta saber |
 * |---|---|---|
 * | `signup_date`, `date_live`, `date_replay` | `integer` | Si es epoch en segundos, en milisegundos, o un texto de fecha |
 * | `attended_live`, `attended_replay` | `integer` | La doc lista 0-4 como valores del **filtro**, pero no dice qué devuelve el campo de respuesta |
 * | `revenue_live`, `revenue_replay` | `string` | Si trae símbolo de moneda |
 *
 * La regla de todo el archivo: **lo que no se puede leer queda en `null`**, nunca
 * en un valor por defecto. Un registrante cuya asistencia no se entiende no es
 * un registrante que no asistió.
 */

import type { WebinarJamRegistrant } from "./client";

export type NormalizedRegistrant = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  scheduleId: string | null;
  signupAt: string | null;
  /** `null` = la API no lo dijo. No es lo mismo que `false`. */
  attendedLive: boolean | null;
  attendedReplay: boolean | null;
  liveWatchedAt: string | null;
  replayWatchedAt: string | null;
  purchasedLive: boolean | null;
  purchasedReplay: boolean | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

/** Epoch en segundos que ya no es plausible como fecha en milisegundos. */
const EPOCH_SECONDS_CEILING = 100_000_000_000;

/**
 * Parsea una fecha que puede venir como epoch (segundos o milisegundos) o como
 * texto.
 *
 * La doc declara estos campos `integer` y no dice la unidad. Se decide por
 * magnitud: un epoch en segundos de una fecha real cae muy por debajo del umbral
 * de los milisegundos. Un valor que no se puede interpretar devuelve `null`.
 */
export function parseWebinarJamDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 0) return null;
    const ms = value < EPOCH_SECONDS_CEILING ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // Un string puramente numérico es un epoch que vino como texto.
    if (/^\d+$/.test(trimmed)) return parseWebinarJamDate(Number(trimmed));

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

/**
 * Interpreta una bandera de la API como booleano.
 *
 * ⚠️ La doc **no publica la tabla de valores del campo de respuesta**
 * `attended_live` — sólo la del parámetro de filtro. Se asume la convención
 * habitual: `0`/`"0"`/`false` es no, cualquier otro número positivo es sí.
 *
 * Lo que **no** se hace es tratar la ausencia como `false`: un campo que no vino
 * devuelve `null`. Contar como "no asistió" a alguien de quien no sabemos nada
 * hundiría el show rate sin motivo.
 */
export function parseWebinarJamFlag(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value > 0;
  }

  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed === "true" || trimmed === "yes") return true;
    if (trimmed === "false" || trimmed === "no") return false;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed > 0 : null;
  }

  return null;
}

function readString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

/**
 * Normaliza un registrante.
 *
 * Devuelve `null` si no trae email: es la llave con la que se deduplica, y sin
 * ella la fila no se puede guardar sin arriesgar duplicados en cada sync.
 */
export function normalizeRegistrant(
  raw: WebinarJamRegistrant
): NormalizedRegistrant | null {
  const email = readString(raw.email)?.toLowerCase();
  if (!email) return null;

  return {
    email,
    firstName: readString(raw.first_name),
    // `last_name` sólo vuelve si está habilitado en la configuración del webinar.
    lastName: readString(raw.last_name),
    scheduleId: readString(raw.schedule),
    signupAt: parseWebinarJamDate(raw.signup_date),
    attendedLive: parseWebinarJamFlag(raw.attended_live),
    attendedReplay: parseWebinarJamFlag(raw.attended_replay),
    liveWatchedAt: parseWebinarJamDate(raw.date_live),
    replayWatchedAt: parseWebinarJamDate(raw.date_replay),
    purchasedLive: parseWebinarJamFlag(raw.purchased_live),
    purchasedReplay: parseWebinarJamFlag(raw.purchased_replay),
    utmSource: readString(raw.utm_source),
    utmMedium: readString(raw.utm_medium),
    utmCampaign: readString(raw.utm_campaign),
  };
}
