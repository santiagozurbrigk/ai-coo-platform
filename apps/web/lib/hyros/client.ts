/**
 * Cliente de la REST API de Hyros.
 *
 * VERIFICADO el 2026-08-30 contra el spec OpenAPI 3.1 v1.40 que Hyros publica,
 * copiado en `docs/external-apis/hyros/`.
 *
 * | | |
 * |---|---|
 * | Base | `https://api.hyros.com`, endpoints bajo `/api/v1.0/` |
 * | Auth | header **`API-Key: <key>`** |
 * | Agencias | header opcional `Accessible-Account-Id` para operar sobre una cuenta cliente |
 * | Rate limit | **30 req/segundo** y **1000 req/minuto**, con `Retry-After` en el 429 |
 * | Paginación | `pageSize` (1-250) + `pageId`, tomado del `nextPageId` anterior |
 *
 * ⚠️ **La validación de parámetros no es pareja, y esto muerde.** Sólo un puñado
 * de endpoints rechaza parámetros desconocidos. **En todos los demás, un
 * parámetro mal escrito se ignora en silencio y la request devuelve `200` con
 * datos distintos a los que se pidieron.** La doc da el ejemplo:
 * `GET /leads?email=...` no filtra nada —el parámetro es `emails`— y devuelve la
 * lista completa. Por eso este cliente construye los nombres de parámetro en un
 * solo lugar y no los arma dinámicamente en ningún lado.
 *
 * ⚠️ **Las escrituras son asíncronas**: un `200` en un POST significa "recibido",
 * no "aplicado". OTC sólo lee, así que no aplica, pero queda anotado.
 */

const HYROS_API_BASE = process.env.HYROS_API_BASE ?? "https://api.hyros.com";

export type HyrosAttributionModel = "last_click" | "first_click" | "scientific";

export type HyrosAdAccount = {
  id: string;
  name?: string;
  type?: string;
};

/** Fila del reporte de atribución. Las claves dependen de `fields`. */
export type HyrosAttributionRow = Record<string, unknown>;

export type HyrosLead = {
  id?: string;
  email?: string;
  creationDate?: string;
  lastUpdatedDate?: string;
  tags?: string[];
};

export class HyrosApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Segundos a esperar, si Hyros lo indicó en un 429. */
    public readonly retryAfter: string | null = null
  ) {
    super(message);
    this.name = "HyrosApiError";
  }
}

export type HyrosCredentials = {
  apiKey: string;
  /** Sólo para keys de agencia que operan sobre una cuenta cliente. */
  accessibleAccountId?: string | null;
};

async function hyrosFetch<T>(
  credentials: HyrosCredentials,
  path: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T> {
  const url = new URL(`${HYROS_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    "API-Key": credentials.apiKey,
    Accept: "application/json",
  };
  if (credentials.accessibleAccountId) {
    headers["Accessible-Account-Id"] = credentials.accessibleAccountId;
  }

  const resp = await fetch(url.toString(), { headers, cache: "no-store" });

  if (!resp.ok) {
    let message = `Hyros API error ${resp.status}`;
    try {
      const body = (await resp.json()) as { message?: string[] | string; result?: string };
      if (Array.isArray(body.message)) message = body.message.join(" · ");
      else if (typeof body.message === "string") message = body.message;
      else if (body.result) message = body.result;
    } catch {
      // Cuerpo no JSON.
    }
    throw new HyrosApiError(resp.status, message, resp.headers.get("Retry-After"));
  }

  return resp.json() as Promise<T>;
}

/** Lista las cuentas publicitarias conectadas, paginando. */
export async function listHyrosAdAccounts(
  credentials: HyrosCredentials
): Promise<HyrosAdAccount[]> {
  const all: HyrosAdAccount[] = [];
  let pageId: string | undefined;

  // Tope de páginas por seguridad: `nextPageId` en null es el fin normal.
  for (let page = 0; page < 50; page += 1) {
    const data = await hyrosFetch<{
      result?: HyrosAdAccount[];
      nextPageId?: string | null;
    }>(credentials, "/api/v1.0/ad-accounts", { pageSize: 250, pageId });

    all.push(...(data.result ?? []));
    if (!data.nextPageId) break;
    pageId = data.nextPageId;
  }

  return all;
}

/**
 * Campos del reporte que le importan al módulo de embudos.
 *
 * - `revenue` → M05, el revenue **atribuido** (distinto del blended de Whop).
 * - `leads` / `new_leads` → M06 y M09.
 * - `new_visits` → M08. **No `clicks`**: un mismo visitante puede clickear
 *   varias veces, así que `clicks` no es "visitantes".
 * - `cost` → el spend **según Hyros**, que es el denominador correcto del ROAS
 *   by-source. Mezclarlo con el spend de Meta daría una ratio con numerador y
 *   denominador de fuentes distintas.
 */
export const HYROS_FUNNEL_FIELDS = [
  "revenue",
  "leads",
  "new_leads",
  "new_visits",
  "cost",
] as const;

export type AttributionRequest = {
  adAccountId: string;
  startDate: string;
  endDate: string;
  attributionModel: HyrosAttributionModel;
  fields?: readonly string[];
};

/**
 * Reporte de atribución agregado por cuenta publicitaria.
 *
 * Se usa `/attribution/ad-account` y no `/attribution` porque el segundo exige
 * `ids` a nivel campaña o adset: habría que enumerar cada campaña antes de poder
 * preguntar nada. Éste toma la cuenta entera.
 */
export async function getHyrosAdAccountAttribution(
  credentials: HyrosCredentials,
  request: AttributionRequest
): Promise<HyrosAttributionRow[]> {
  const data = await hyrosFetch<{ result?: HyrosAttributionRow[] }>(
    credentials,
    "/api/v1.0/attribution/ad-account",
    {
      attributionModel: request.attributionModel,
      startDate: request.startDate,
      endDate: request.endDate,
      fields: (request.fields ?? HYROS_FUNNEL_FIELDS).join(","),
      ids: request.adAccountId,
      currency: "usd",
    }
  );
  return data.result ?? [];
}

/**
 * Leads creados dentro del período (M09, opt-ins).
 *
 * Es la vía de backfill; el webhook `lead.opted.in` sería la de tiempo real.
 * Se cuenta con paginación porque la API no expone un contador.
 *
 * ⚠️ Los nombres de los parámetros son `fromDate` y `toDate`. Escribirlos mal
 * **no da error**: Hyros los ignora y devuelve la lista completa de leads, que
 * se leería como un pico de opt-ins que nunca ocurrió.
 */
export async function countHyrosLeadsInPeriod(
  credentials: HyrosCredentials,
  fromDate: string,
  toDate: string,
  maxPages = 40
): Promise<number> {
  let total = 0;
  let pageId: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const data = await hyrosFetch<{ result?: HyrosLead[]; nextPageId?: string | null }>(
      credentials,
      "/api/v1.0/leads",
      { fromDate, toDate, pageSize: 250, pageId }
    );

    total += (data.result ?? []).length;
    if (!data.nextPageId) break;
    pageId = data.nextPageId;
  }

  return total;
}

/**
 * Recorrido de un lead entre touchpoints (M07).
 *
 * Máximo 50 leads por llamada. Con `includeEvents` agrega el array `journey`
 * cronológico: ventas, llamadas, emails, clicks y page views.
 *
 * Se consulta en vivo y no se persiste: es información de una persona concreta
 * que se mira puntualmente, no un agregado del embudo.
 */
export async function getHyrosLeadJourneys(
  credentials: HyrosCredentials,
  emails: string[],
  includeEvents = true
): Promise<Record<string, unknown>[]> {
  if (emails.length === 0) return [];

  const data = await hyrosFetch<{ result?: Record<string, unknown>[] }>(
    credentials,
    "/api/v1.0/leads/journey",
    { emails: emails.slice(0, 50).join(","), includeEvents }
  );
  return data.result ?? [];
}
