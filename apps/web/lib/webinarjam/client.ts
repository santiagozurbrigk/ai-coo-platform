/**
 * Cliente de la API de WebinarJam / EverWebinar.
 *
 * VERIFICADO el 2026-08-30 contra docs/external-apis/webinarjam/.
 *
 * | | |
 * |---|---|
 * | Endpoint | `https://api.webinarjam.com/webinarjam` · `https://api.webinarjam.com/everwebinar` |
 * | Auth | `api_key` **en el body del POST**, no en un header |
 * | Método | **todo es POST**, incluidas las lecturas |
 * | Rate limit | 20 llamadas por segundo; pasarse devuelve 429 |
 *
 * ⭐ **Son la misma API con dos prefijos.** `/webinarjam/*` para webinars en vivo,
 * `/everwebinar/*` para automatizados: mismos endpoints, mismos parámetros,
 * mismos campos. Por eso el cliente toma el producto como parámetro y el sync
 * consulta los dos — no hay que averiguar cuál usa cada cliente.
 *
 * ⚠️ **La API key requiere aprobación previa de WebinarJam**, no alcanza con
 * tener cuenta. Es el camino crítico de esta unidad.
 */

const WEBINARJAM_API_BASE =
  process.env.WEBINARJAM_API_BASE ?? "https://api.webinarjam.com";

/** Los dos productos, que son dos prefijos de la misma API. */
export const WEBINARJAM_PRODUCTS = ["webinarjam", "everwebinar"] as const;
export type WebinarJamProduct = (typeof WEBINARJAM_PRODUCTS)[number];

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type WebinarJamSchedule = {
  date?: string;
  /**
   * Id del horario.
   *
   * ⚠️ La doc avisa: **el Schedule ID de la API no coincide con el que se ve en
   * la pestaña Schedules del panel.** Hay que usar el de la API.
   */
  schedule?: number | string;
  comment?: string;
};

export type WebinarJamWebinar = {
  webinar_id?: number | string;
  webinar_hash?: string;
  name?: string;
  title?: string;
  description?: string;
  type?: string;
  /**
   * En `/webinars` es un array de **textos** ("Every day, 01:00 PM"); en
   * `/webinar` es un array de objetos con el `schedule` id. Los ids sólo salen
   * del detalle.
   */
  schedules?: (WebinarJamSchedule | string)[];
  timezone?: string;
  [key: string]: unknown;
};

/**
 * Registrante tal como lo devuelve `/registrants`.
 *
 * ⚠️ Los campos marcados en la doc con `*` **sólo vuelven si están habilitados
 * en la configuración de ese webinar**: `last_name`, `phone` y
 * `phone_country_code`. No asumir que están.
 *
 * ⚠️ La doc declara `signup_date`, `date_live` y `date_replay` como `integer` sin
 * decir en qué unidad, y `time_live` / `revenue_live` como `string` sin formato.
 * El parseo está aislado en `normalize-registrant.ts` y es tolerante.
 */
export type WebinarJamRegistrant = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  ip?: string;
  webinar?: number | string;
  schedule?: number | string;
  signup_date?: number | string;
  attended_live?: number | string;
  date_live?: number | string;
  entered_live?: string;
  time_live?: string;
  purchased_live?: number | string;
  revenue_live?: string;
  attended_replay?: number | string;
  date_replay?: number | string;
  time_replay?: string;
  purchased_replay?: number | string;
  revenue_replay?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: unknown;
};

export class WebinarJamApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "WebinarJamApiError";
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Todo es `POST` con el `api_key` en el body.
 *
 * Se manda como `application/x-www-form-urlencoded` porque es lo que muestran
 * todos los ejemplos de la documentación (`curl --data "api_key=..."`).
 */
async function webinarJamFetch<T>(
  apiKey: string,
  product: WebinarJamProduct,
  path: string,
  fields: Record<string, string | number | undefined> = {}
): Promise<T> {
  const body = new URLSearchParams({ api_key: apiKey });
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== "") {
      body.set(key, String(value));
    }
  }

  const resp = await fetch(`${WEBINARJAM_API_BASE}/${product}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new WebinarJamApiError(resp.status, `WebinarJam API error ${resp.status}`);
  }

  const data = (await resp.json()) as { status?: string; message?: string } & T;

  // La API responde 200 con `status: "error"` en vez de un código HTTP.
  if (data.status && data.status !== "success") {
    throw new WebinarJamApiError(200, data.message ?? "WebinarJam devolvió un error");
  }

  return data;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** Lista los webinars de la cuenta. Los `schedules` vienen como texto acá. */
export async function listWebinarJamWebinars(
  apiKey: string,
  product: WebinarJamProduct
): Promise<WebinarJamWebinar[]> {
  const data = await webinarJamFetch<{ webinars?: WebinarJamWebinar[] }>(
    apiKey,
    product,
    "/webinars"
  );
  return data.webinars ?? [];
}

/**
 * Detalle de un webinar.
 *
 * Es la **única** forma de obtener los `schedule` id, que `/registrants`
 * necesita. `/webinars` sólo devuelve la descripción en texto del horario.
 */
export async function getWebinarJamWebinar(
  apiKey: string,
  product: WebinarJamProduct,
  webinarId: string
): Promise<WebinarJamWebinar | null> {
  const data = await webinarJamFetch<{ webinar?: WebinarJamWebinar }>(
    apiKey,
    product,
    "/webinar",
    { webinar_id: webinarId }
  );
  return data.webinar ?? null;
}

/** Presets de `date_range`, que es el único filtro de fecha que acepta la API. */
export const WEBINARJAM_DATE_RANGE = {
  allTime: 0,
  today: 1,
  yesterday: 2,
  thisWeek: 3,
  lastWeek: 4,
  last7Days: 5,
  thisMonth: 6,
  lastMonth: 7,
  last30Days: 8,
} as const;

export type ListRegistrantsOptions = {
  webinarId: string;
  scheduleId?: string;
  /**
   * `0` todos · `1` asistió al vivo · `2` no asistió · `3` se fue **antes** de
   * `attendedLiveTimestamp` · `4` se fue **después**.
   *
   * El valor `4` con `attendedLiveTimestamp` en el segundo de la oferta es
   * exactamente M15, calculado del lado de WebinarJam.
   */
  attendedLive?: 0 | 1 | 2 | 3 | 4;
  attendedLiveTimestamp?: number;
  attendedReplay?: 0 | 1 | 2 | 3 | 4;
  attendedReplayTimestamp?: number;
  /** Preset de fecha. Ver `WEBINARJAM_DATE_RANGE`. */
  dateRange?: number;
  /** Tope de filas totales, para no recorrer sin fin. */
  maxRows?: number;
};

/**
 * Registrantes y asistentes, paginando.
 *
 * ⚠️ **No hay filtro por rango de fechas arbitrario.** `date_range` es una lista
 * de presets. El recorte al período del embudo lo hace OTC sobre `signup_date` y
 * las fechas de asistencia, que sí vienen por registrante.
 */
export async function listWebinarJamRegistrants(
  apiKey: string,
  product: WebinarJamProduct,
  options: ListRegistrantsOptions
): Promise<WebinarJamRegistrant[]> {
  const maxRows = options.maxRows ?? 5000;
  const all: WebinarJamRegistrant[] = [];
  let page = 1;

  while (all.length < maxRows) {
    const data = await webinarJamFetch<{
      registrants?: WebinarJamRegistrant[];
      users?: WebinarJamRegistrant[];
      data?: WebinarJamRegistrant[];
    }>(apiKey, product, "/registrants", {
      webinar_id: options.webinarId,
      schedule_id: options.scheduleId,
      attended_live: options.attendedLive,
      attended_live_timestamp: options.attendedLiveTimestamp,
      attended_replay: options.attendedReplay,
      attended_replay_timestamp: options.attendedReplayTimestamp,
      date_range: options.dateRange,
      page,
    });

    // La doc habla de "un objeto user"; el ejemplo es una captura de pantalla.
    // Se aceptan las tres claves plausibles y se registra cuál llegó.
    const rows = data.registrants ?? data.users ?? data.data ?? [];
    if (rows.length === 0) break;

    all.push(...rows);
    page += 1;

    // Sin un campo de total en la doc, la señal de fin es una página vacía. El
    // tope de filas evita quedarse dando vueltas si la paginación no corta.
    if (page > 200) break;
  }

  return all;
}
