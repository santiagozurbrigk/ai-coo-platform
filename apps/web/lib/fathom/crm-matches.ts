/**
 * B · L1 — ⭐ De dónde el alias se aprende solo.
 *
 * Con `include_crm_matches`, Fathom devuelve por cada participante el vínculo
 * entre **el nombre de pantalla** y **el mail** (`matched_speaker_display_name`).
 *
 * Eso es exactamente el par que hace falta: el mail identifica a la persona de
 * forma determinista, y el nombre de pantalla es lo que va a aparecer en sus
 * llamadas futuras **sin agenda**. Todo cliente fue lead, y su llamada de venta
 * sí estuvo agendada: de ahí sale su alias gratis, y con eso se resuelven todas
 * sus entregas.
 *
 * **El lado de ventas le enseña al de entrega, sin que nadie confirme nada.**
 *
 * Lógica pura: no toca base ni red.
 */
import { normalizeIdentity } from "@/lib/fathom/resolve-counterparty";

export type SpeakerMatch = {
  /** El nombre tal como aparece en la videollamada. */
  displayName: string;
  email: string;
  normalizedName: string;
  normalizedEmail: string;
};

/**
 * Lee los pares nombre-de-pantalla ↔ mail de una respuesta de Fathom.
 *
 * Defensivo: la forma exacta del payload no está documentada al detalle, así que
 * se aceptan las variantes razonables y **lo que no se entiende se descarta** en
 * vez de producir un alias inventado, que sería lo peor posible: asignaría
 * llamadas al cliente equivocado.
 */
export function extractSpeakerMatches(raw: unknown): SpeakerMatch[] {
  const candidates = collectCandidates(raw);
  const matches: SpeakerMatch[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const displayName = readString(candidate, [
      "matched_speaker_display_name",
      "speaker_display_name",
      "display_name",
      "name",
    ]);
    const email = readString(candidate, ["email", "matched_email", "contact_email"]);

    // Sin los dos no hay par, y medio par no enseña nada.
    if (!displayName || !email) continue;
    if (!email.includes("@")) continue;

    const normalizedEmail = normalizeIdentity(email);
    const normalizedName = normalizeIdentity(displayName);
    if (!normalizedName || !normalizedEmail) continue;

    // Un nombre de pantalla que ES el mail no aporta un alias nuevo.
    if (normalizedName === normalizedEmail) continue;

    const key = `${normalizedName}|${normalizedEmail}`;
    if (seen.has(key)) continue;
    seen.add(key);

    matches.push({ displayName, email, normalizedName, normalizedEmail });
  }

  return matches;
}

/** Junta los objetos que pueden contener un match, mire donde mire el payload. */
function collectCandidates(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.filter(isRecord);
  }
  if (!isRecord(raw)) return [];

  const out: Record<string, unknown>[] = [];
  for (const key of ["crm_matches", "matches", "participants", "attendees"]) {
    const value = raw[key];
    if (Array.isArray(value)) out.push(...value.filter(isRecord));
  }
  // El objeto mismo puede ser un match suelto.
  if (out.length === 0) out.push(raw);
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}
