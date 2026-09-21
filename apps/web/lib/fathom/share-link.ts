/**
 * ⚠️ ESTE ARCHIVO LEE ALGO QUE FATHOM NO DOCUMENTA. ⚠️
 *
 * La API oficial de Fathom (`api.fathom.ai/external/v1`) pide un **número** de
 * grabación para devolver un transcript. Un link compartido —
 * `fathom.video/share/iH6knxaB...`— no contiene ese número por ningún lado: es
 * un token opaco de 32 caracteres. Los dos datos no se pueden traducir uno en el
 * otro, así que "pegá el link" no se podía resolver con la API documentada.
 *
 * ⭐ **Pero la propia página compartida trae todo.** Sirve un `<div data-page>`
 * con el payload que usa su reproductor, y ahí adentro están el ID numérico de
 * la grabación, el título, la fecha, la duración, el mail del anfitrión y un
 * link al transcript con su propio token. Verificado contra una grabación real
 * el 2026-09-20: `200`, sin clave de API y sin sesión iniciada.
 *
 * Que no sea la API documentada tiene tres consecuencias, y las tres están
 * resueltas acá y no repartidas por el código:
 *
 * 1. **Todo el parseo vive en este archivo.** Si Fathom cambia el formato, se
 *    rompe una función con un mensaje claro, no el módulo de llamadas entero.
 * 2. **El payload crudo se guarda antes de interpretarlo** (`share_payload`),
 *    para que el día que cambie se pueda arreglar mirando datos reales.
 * 3. **Nada se inventa.** Un campo que no se entiende queda en `null` y el
 *    llamador decide; una llamada sin duración no es una llamada de cero
 *    minutos.
 *
 * Cuando la organización tiene su clave conectada y la grabación es suya, el ID
 * que sale de acá sirve para pedirle lo mismo a la API oficial, que es estable.
 * Este camino es el que hace que funcione igual cuando la grabación es de la
 * cuenta de otro — un coach que sólo comparte el link.
 *
 * Registrado en `docs/API_DOCS_PENDIENTES.md`.
 */

/** Anfitrión de la grabación, tal como lo declara la página compartida. */
export type FathomShareHost = {
  email: string | null;
  domain: string | null;
};

/**
 * Lo que se pudo leer de la página compartida.
 *
 * Todo es anulable menos `callId`: sin el ID no hay llamada que guardar, y ese
 * es el único caso en el que el parseo se considera fallido.
 */
export type FathomSharePayload = {
  /** ID numérico de la grabación. Mismo valor que `recording_id` en la API oficial. */
  callId: string;
  title: string | null;
  /** ISO 8601. La hora en que arrancó la reunión. */
  startedAt: string | null;
  durationSeconds: number | null;
  host: FathomShareHost;
  /** URL absoluta para pedir el transcript, con su token incluido. */
  transcriptUrl: string | null;
  /** El JSON completo, sin tocar. Se persiste tal cual. */
  raw: unknown;
};

export type FathomShareRef = {
  /** El token del link, que es lo que identifica la grabación compartida. */
  token: string;
  /** La URL normalizada de la que se bajó todo. */
  url: string;
};

const SHARE_HOST = "fathom.video";

/**
 * De lo que pegó el usuario al token del link compartido.
 *
 * Acepta la URL completa, con o sin `https://`, con parámetros de más (los
 * links que se copian del chat suelen traer `?utm_...`) y con la barra final.
 * Rechaza `fathom.video/calls/xxx`, que es la vista privada: ésa pide sesión
 * iniciada y no sirve para esto.
 *
 * Lógica pura: no toca red.
 */
export function parseFathomShareUrl(input: string): FathomShareRef | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== SHARE_HOST) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2 || segments[0] !== "share") return null;

  const token = segments[1];
  // Los tokens observados son alfanuméricos de 32 caracteres. El rango se deja
  // holgado a propósito: rechazar un token válido por ser más corto sería peor
  // que intentar bajarlo y que Fathom conteste 404.
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(token)) return null;

  return { token, url: `https://${SHARE_HOST}/share/${token}` };
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asPositiveNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

/**
 * Del HTML de la página compartida al payload.
 *
 * ⭐ El atributo `data-page` no contiene ni una comilla doble literal: el JSON
 * viene con todas escapadas como `&quot;`. Por eso alcanza con leer hasta la
 * próxima comilla, sin necesidad de un parser de HTML.
 *
 * Lógica pura: no toca red.
 */
export function extractSharePayload(html: string): FathomSharePayload | null {
  const match = html.match(/data-page="([^"]*)"/);
  if (!match) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeHtmlEntities(match[1]));
  } catch {
    return null;
  }

  const props = (parsed as { props?: unknown })?.props;
  if (!props || typeof props !== "object") return null;

  const call = (props as { call?: unknown }).call;
  if (!call || typeof call !== "object") return null;

  const callRecord = call as Record<string, unknown>;
  const callId = asTrimmedString(
    typeof callRecord.id === "number" ? String(callRecord.id) : callRecord.id
  );
  if (!callId) return null;

  const hostRecord =
    callRecord.host && typeof callRecord.host === "object"
      ? (callRecord.host as Record<string, unknown>)
      : {};
  const companyRecord =
    hostRecord.company && typeof hostRecord.company === "object"
      ? (hostRecord.company as Record<string, unknown>)
      : {};

  /**
   * La duración, de la más precisa a la más gruesa.
   *
   * `props.duration` viene en segundos con decimales; `duration_minutes` es el
   * redondeo que muestra la interfaz. Si no hay ninguna de las dos queda `null`
   * y el llamador decide: una llamada sin duración conocida no dura cero.
   */
  const durationSeconds =
    asPositiveNumber((props as Record<string, unknown>).duration) ??
    (asPositiveNumber(callRecord.duration_minutes) != null
      ? Math.round(asPositiveNumber(callRecord.duration_minutes)! * 60)
      : null);

  const recording =
    callRecord.recording && typeof callRecord.recording === "object"
      ? (callRecord.recording as Record<string, unknown>)
      : {};

  return {
    callId,
    title: asTrimmedString(callRecord.title) ?? asTrimmedString(callRecord.topic),
    // `started_at` es el horario agendado y `recording.started_at` el momento en
    // que el robot entró. Manda el agendado: es el que coincide con la agenda.
    startedAt:
      asTrimmedString(callRecord.started_at) ??
      asTrimmedString(recording.started_at),
    durationSeconds: durationSeconds != null ? Math.round(durationSeconds) : null,
    host: {
      email: asTrimmedString(hostRecord.email),
      domain: asTrimmedString(companyRecord.domain),
    },
    transcriptUrl: asTrimmedString(
      (props as Record<string, unknown>).copyTranscriptUrl
    ),
    raw: parsed,
  };
}

/** Las cinco entidades que aparecen en un atributo HTML. `&amp;` va última. */
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Del JSON del transcript al texto plano.
 *
 * Fathom devuelve `{ html, plain_text }`. Se usa `plain_text`: trae el minuto,
 * el nombre de quien habla y su mail cuando lo conoce, que es justo lo que el
 * análisis necesita, y pesa un tercio que la versión con etiquetas.
 *
 * Lógica pura: no toca red.
 */
export function parseTranscriptResponse(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed ? trimmed : null;
  }
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  return asTrimmedString(record.plain_text) ?? asTrimmedString(record.text);
}

/**
 * Los mails que aparecen en el transcript, en el orden en que hablan.
 *
 * ⭐ Esto es el dato más valioso que trae un link pegado a mano. La cola de
 * llamadas sin asociar existe porque el sistema no sabe quién es quién; el
 * transcript identifica a los participantes con su mail, y `client_identities`
 * lo aprende para las llamadas que vengan después.
 *
 * Lógica pura: no toca red.
 */
export function extractTranscriptEmails(transcript: string): string[] {
  const found = transcript.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of found) {
    // El mail suele venir entre paréntesis: "Santiago (santi@x.com)".
    const email = raw.toLowerCase().replace(/[.,;:)]+$/, "");
    if (seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }
  return result;
}

export class FathomShareError extends Error {
  constructor(
    message: string,
    /** Para el log. El usuario ve `message`, que ya está en castellano. */
    readonly cause?: unknown
  ) {
    super(message);
    this.name = "FathomShareError";
  }
}

const FETCH_TIMEOUT_MS = 15_000;

async function fetchWithTimeout(url: string, accept: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: { Accept: accept },
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Baja la página compartida y devuelve lo que se pudo leer de ella.
 *
 * Los dos errores que importan tienen mensaje propio porque son los dos que el
 * usuario puede arreglar solo: el link no existe (404) o el link dejó de ser
 * válido (401/403, la grabación se dejó de compartir).
 */
export async function fetchFathomShare(
  ref: FathomShareRef
): Promise<FathomSharePayload> {
  let response: Response;
  try {
    response = await fetchWithTimeout(ref.url, "text/html");
  } catch (error) {
    throw new FathomShareError(
      "No se pudo contactar a Fathom. Probá de nuevo en un momento.",
      error
    );
  }

  if (response.status === 404) {
    throw new FathomShareError(
      "Ese link no existe en Fathom. Revisá que esté completo y que sea un link de los que empiezan con fathom.video/share/."
    );
  }
  if (response.status === 401 || response.status === 403) {
    throw new FathomShareError(
      "Ese link ya no es válido: la grabación se dejó de compartir. Pedí un link nuevo."
    );
  }
  if (!response.ok) {
    throw new FathomShareError(
      `Fathom respondió ${response.status} al abrir el link compartido.`
    );
  }

  const html = await response.text();
  const payload = extractSharePayload(html);
  if (!payload) {
    throw new FathomShareError(
      "El link abrió pero Fathom cambió el formato de su página y no se pudo leer la grabación. Avisá al equipo de Limitless."
    );
  }
  return payload;
}

/**
 * Baja el transcript usando el link que trae la propia página compartida.
 *
 * Devuelve `null` en vez de tirar: una llamada sin transcript **igual se
 * guarda**. Queda registrada, cuenta para el contador de 1-1 y se le pueden
 * cargar tareas a mano; lo único que no va a tener es análisis automático. Tirar
 * acá perdería la llamada entera por un dato que Fathom a veces todavía está
 * procesando.
 */
export async function fetchFathomShareTranscript(
  payload: FathomSharePayload
): Promise<string | null> {
  if (!payload.transcriptUrl) return null;

  try {
    const response = await fetchWithTimeout(
      payload.transcriptUrl,
      "application/json"
    );
    if (!response.ok) {
      console.warn(
        `[fathom:share] transcript ${payload.callId} respondió ${response.status}`
      );
      return null;
    }
    return parseTranscriptResponse(await response.json());
  } catch (error) {
    console.warn(`[fathom:share] transcript ${payload.callId}`, error);
    return null;
  }
}
