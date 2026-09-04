/**
 * B · L0 — Los webhooks de Fathom, creados por API.
 *
 * ⭐ El hallazgo que cambia toda la administración: `POST /webhooks` acepta la key
 * de un miembro y devuelve `id` y `secret`. Entonces el flujo **no** es "cada
 * miembro configura un webhook a mano en Fathom" —impracticable— sino: **pega su
 * key una vez y OTC le crea el webhook solo**. Y al desconectarse, OTC borra lo
 * que creó en vez de dejar basura colgada en la cuenta de esa persona.
 *
 * ⭐ Por qué el webhook y no el polling: pedir `include_summary` o
 * `include_transcript` convierte el request en "pesado" — **30 por minuto, y
 * puede bajar a 5**. Con 10 reuniones por página, sincronizar por polling se
 * choca contra ese techo enseguida. El webhook **no gasta cuota**: Fathom empuja
 * el contenido y OTC no pregunta. Y llega en el momento, no en la próxima hora.
 */
import { FATHOM_API_BASE } from "@/lib/fathom/api";

/**
 * ⭐ `triggered_for` es lo que evita los duplicados, y se resuelve **eligiendo
 * bien qué se pide**, no deduplicando después.
 *
 * Si dos miembros están en la misma llamada, las dos keys la ven. Estas dos
 * opciones juntas son exactamente "todo lo que grabé yo", sin solaparse con
 * nadie: cada grabación la entrega su dueño y nadie más.
 *
 * `shared_team_recordings` queda **afuera a propósito**: son las de los demás, y
 * es justo lo que generaría la fila duplicada.
 */
export const WEBHOOK_TRIGGERED_FOR = [
  "my_recordings",
  "my_shared_with_team_recordings",
] as const;

export type FathomWebhook = {
  id: string;
  secret: string;
  url?: string;
};

/** Crea el webhook de un miembro con su propia key. */
export async function createFathomWebhook(
  apiKey: string,
  destinationUrl: string
): Promise<FathomWebhook> {
  const response = await fetch(`${FATHOM_API_BASE}/webhooks`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destination_url: destinationUrl,
      // Los cuatro que Fathom ofrece: el webhook empuja todo de una y no hay que
      // volver a pedirlo con un request pesado.
      include_transcript: true,
      include_summary: true,
      include_action_items: true,
      include_crm_matches: true,
      triggered_for: WEBHOOK_TRIGGERED_FOR,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Fathom rechazó la creación del webhook (${response.status}): ${body.slice(0, 200)}`
    );
  }

  const data = (await response.json()) as { id?: string; secret?: string; url?: string };

  // Sin id o sin secreto el webhook es inútil: no se podría borrar ni verificar
  // la firma. Preferimos fallar la conexión a dejarla a medias.
  if (!data.id || !data.secret) {
    throw new Error("Fathom no devolvió el id o el secreto del webhook.");
  }

  return { id: data.id, secret: data.secret, url: data.url };
}

/**
 * Borra el webhook al desconectarse.
 *
 * No lanza: si el borrado falla —la key ya fue revocada, por ejemplo— igual hay
 * que poder desconectarse. Quedaría un webhook huérfano en la cuenta de esa
 * persona, que es molesto pero no rompe nada; impedir la desconexión sí.
 */
export async function deleteFathomWebhook(
  apiKey: string,
  webhookId: string
): Promise<{ deleted: boolean; error?: string }> {
  try {
    const response = await fetch(`${FATHOM_API_BASE}/webhooks/${webhookId}`, {
      method: "DELETE",
      headers: { "X-Api-Key": apiKey },
    });
    return response.ok
      ? { deleted: true }
      : { deleted: false, error: `Fathom devolvió ${response.status}` };
  } catch (error) {
    return {
      deleted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * ⭐ Quién es el dueño de esta key.
 *
 * Fathom **no tiene `/users/me`**. Se pide un puñado de reuniones **sin ningún
 * `include_`** —que no es un request pesado, así que no toca el límite de 5/min—
 * y se toma el `recorded_by.email` más frecuente.
 *
 * ⚠️ El resultado se le **muestra al miembro para que confirme**. Nunca se asume
 * en silencio: si la deducción sale mal, todas sus llamadas quedarían atribuidas
 * a otra persona.
 */
export async function guessFathomAccountEmail(apiKey: string): Promise<string | null> {
  const url = new URL(`${FATHOM_API_BASE}/meetings`);
  url.searchParams.set("limit", "10");

  const response = await fetch(url, { headers: { "X-Api-Key": apiKey } });
  if (!response.ok) return null;

  const data = (await response.json()) as { items?: unknown[] };
  const items = Array.isArray(data.items) ? data.items : [];

  const counts = new Map<string, number>();
  for (const item of items) {
    if (typeof item !== "object" || item === null) continue;
    const recordedBy = (item as Record<string, unknown>).recorded_by;
    if (typeof recordedBy !== "object" || recordedBy === null) continue;
    const email = (recordedBy as Record<string, unknown>).email;
    if (typeof email !== "string" || !email.includes("@")) continue;
    const normalized = email.trim().toLowerCase();
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [email, count] of counts) {
    if (count > bestCount) {
      best = email;
      bestCount = count;
    }
  }
  return best;
}
