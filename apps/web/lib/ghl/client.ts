/**
 * Cliente GoHighLevel V2 (services.leadconnectorhq.com)
 *
 * Auth: Private Integration Token (generado en GHL → Settings → Integraciones Privadas)
 * Header obligatorio: Version: 2021-04-15
 *
 * Cuando OTC sea aprobado en el GHL Marketplace, se migrará a OAuth 2.0
 * y este cliente recibirá access_token con el mismo formato de llamadas.
 */

const GHL_API_BASE =
  process.env.GHL_API_BASE ?? "https://services.leadconnectorhq.com";

const GHL_API_VERSION = "2021-04-15";

/**
 * Los endpoints de oportunidades exigen `Version: v3` — no aceptan la fecha que
 * usa el resto del cliente. Verificado el 2026-08-30 en
 * docs/external-apis/gohighlevel/ghl/opportunities/: "Version — required,
 * available options: v3".
 */
const GHL_OPPORTUNITIES_VERSION = "v3";

// ─── Tipos de respuesta GHL ───────────────────────────────────────────────────

export type GHLCalendar = {
  id: string;
  name: string;
  description?: string;
  locationId: string;
};

/** Objeto de atribución UTM que GHL adjunta al contacto (puede ser null si no hay). */
export type GHLContactAttributionSource = {
  url?: string | null;
  campaign?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  campaignId?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  medium?: string | null;
  mediumId?: string | null;
  [key: string]: string | null | undefined;
};

export type GHLContact = {
  id: string;
  locationId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dateAdded: string | null;  // ISO 8601
  tags: string[] | null;
  attributionSource?: GHLContactAttributionSource | null;
};

export type GHLAppointmentStatus =
  | "booked"
  | "confirmed"
  | "cancelled"
  | "showed"
  | "noshow"
  | "invalid";

export type GHLAppointment = {
  id: string;
  calendarId: string;
  locationId: string;
  contactId: string;
  startTime: string;       // ISO 8601
  endTime: string;         // ISO 8601
  title: string | null;
  appointmentStatus: GHLAppointmentStatus;
  notes: string | null;
  address: string | null;
  contact: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

// ─── Error handling ───────────────────────────────────────────────────────────

export class GHLApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "GHLApiError";
  }
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function ghlFetch<T>(
  apiKey: string,
  path: string,
  params?: Record<string, string>,
  version: string = GHL_API_VERSION
): Promise<T> {
  const url = new URL(`${GHL_API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const resp = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: version,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    let message = `GHL API error ${resp.status}`;
    try {
      const body = (await resp.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignorar si el cuerpo no es JSON
    }
    throw new GHLApiError(resp.status, message);
  }

  return resp.json() as Promise<T>;
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

/**
 * Valida la API key intentando listar calendarios.
 * Lanza GHLApiError si la clave es inválida o no tiene acceso.
 */
export async function validateGHLApiKey(
  apiKey: string,
  locationId: string
): Promise<GHLCalendar[]> {
  return listGHLCalendars(apiKey, locationId);
}

/**
 * Lista todos los calendarios de la ubicación (Location).
 */
export async function listGHLCalendars(
  apiKey: string,
  locationId: string
): Promise<GHLCalendar[]> {
  const data = await ghlFetch<{ calendars?: GHLCalendar[] }>(
    apiKey,
    "/calendars/",
    { locationId }
  );
  return data.calendars ?? [];
}

/**
 * Lista appointments del calendario en el rango dado.
 * startTime y endTime: Unix timestamps en milisegundos como string (ej: "1748217600000").
 * GHL /calendars/events rechaza ISO 8601 — devuelve 200 + array vacío silenciosamente.
 *
 * GHL V2 endpoint correcto: GET /calendars/events
 * - /calendars/appointments → 400 (GHL lo enruta como GET /calendars/:id)
 * - /calendars/{calendarId}/appointments → 404 (no existe)
 * - /calendars/events con page=N → 422 (page no es param válido)
 * - /calendars/events con ISO 8601 → 200 + [] (silencioso, rango no parsea)
 * - /calendars/events con Unix ms + includeAll=true → correcto
 */
export async function listGHLAppointments(
  apiKey: string,
  locationId: string,
  calendarId: string,
  startTime: string,  // Unix ms como string
  endTime: string     // Unix ms como string
): Promise<GHLAppointment[]> {
  const data = await ghlFetch<{
    events?: GHLAppointment[];
    appointments?: GHLAppointment[];
    data?: GHLAppointment[];           // fallback — GHL a veces usa "data"
  }>(apiKey, "/calendars/events", {
    locationId,
    calendarId,
    startTime,
    endTime,
    includeAll: "true",
  });

  // Log para diagnóstico en Vercel
  const keys = Object.keys(data as object);
  console.info(
    `[ghl-client] /calendars/events keys=${keys.join(",")} ` +
    `events=${data.events?.length ?? "-"} appointments=${data.appointments?.length ?? "-"} data=${data.data?.length ?? "-"}`
  );

  return data.events ?? data.appointments ?? data.data ?? [];
}

/**
 * Lista todos los contactos de la ubicación con paginación.
 * Devuelve todos los contactos en un solo array (paginación interna).
 * GHL V2: GET /contacts?locationId=&limit=100&startAfterId=
 */
export async function listGHLContacts(
  apiKey: string,
  locationId: string
): Promise<GHLContact[]> {
  const all: GHLContact[] = [];
  let startAfterId: string | undefined;

  // Máximo 2000 contactos por seguridad en importaciones manuales
  const MAX_CONTACTS = 2000;

  while (all.length < MAX_CONTACTS) {
    const params: Record<string, string> = { locationId, limit: "100" };
    if (startAfterId) params.startAfterId = startAfterId;

    const data = await ghlFetch<{
      contacts?: GHLContact[];
      meta?: { startAfterId?: string; total?: number };
    }>(apiKey, "/contacts/", params);

    const page = data.contacts ?? [];
    all.push(...page);

    // Sin más páginas
    if (page.length < 100 || !data.meta?.startAfterId) break;
    startAfterId = data.meta.startAfterId;
  }

  return all;
}

/**
 * Obtiene un contacto individual por ID, incluyendo attributionSource (UTMs).
 * GHL V2: GET /contacts/{contactId}
 * Devuelve null si el contacto no existe o hay error de red.
 */
export async function getGHLContact(
  apiKey: string,
  contactId: string
): Promise<GHLContact | null> {
  try {
    const data = await ghlFetch<{ contact?: GHLContact }>(
      apiKey,
      `/contacts/${contactId}`
    );
    return data.contact ?? null;
  } catch (e) {
    // No lanzar — un contacto fallido no debe bloquear el sync de appointments
    console.warn(`[ghl-client] getGHLContact(${contactId}) falló:`, e);
    return null;
  }
}

// ─── Oportunidades (I-4) ──────────────────────────────────────────────────────
//
// Verificado el 2026-08-30 contra docs/external-apis/gohighlevel/.
//
// ⚠️ La documentación oficial NO expande el objeto `pipeline` ni el objeto
// `opportunity`: declara `pipelines: object[]` y `opportunity: object` a secas.
// Por eso los tipos de abajo marcan todo como opcional y se guarda siempre el
// objeto crudo. Regla 3 de CLAUDE.md: el primer response real manda.

/** Etapa de un pipeline. Nombres de campo inferidos, no documentados. */
export type GHLPipelineStage = {
  id?: string;
  _id?: string;
  name?: string;
  position?: number;
  [key: string]: unknown;
};

/** Pipeline de oportunidades. Nombres de campo inferidos, no documentados. */
export type GHLPipeline = {
  id?: string;
  _id?: string;
  name?: string;
  locationId?: string;
  stages?: GHLPipelineStage[];
  [key: string]: unknown;
};

/**
 * Oportunidad. Los campos son los que el payload de los webhooks sí documenta
 * (webhook/OpportunityCreate.md); la respuesta REST puede traer más.
 */
export type GHLOpportunity = {
  id?: string;
  _id?: string;
  name?: string;
  locationId?: string;
  contactId?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  status?: string;
  source?: string;
  monetaryValue?: number;
  dateAdded?: string;
  [key: string]: unknown;
};

/** Id de una entidad de GHL, que llega como `id` o como `_id` según el endpoint. */
export function ghlEntityId(entity: { id?: string; _id?: string }): string | null {
  return entity.id ?? entity._id ?? null;
}

/**
 * Lista los pipelines de la sub-cuenta con sus etapas.
 * GET /opportunities/pipelines?locationId= · header Version: v3
 */
export async function listGHLPipelines(
  apiKey: string,
  locationId: string
): Promise<GHLPipeline[]> {
  const data = await ghlFetch<{ pipelines?: GHLPipeline[] }>(
    apiKey,
    "/opportunities/pipelines",
    { locationId },
    GHL_OPPORTUNITIES_VERSION
  );
  return data.pipelines ?? [];
}

export type SearchOpportunitiesOptions = {
  pipelineId?: string;
  pipelineStageId?: string;
  /** `open` · `won` · `lost` · `abandoned` · `all` */
  status?: string;
  /** Fecha desde, en el formato que acepta GHL. */
  date?: string;
  endDate?: string;
  /** Tope de filas a traer en total. Protege de un recorrido sin fin. */
  maxRows?: number;
};

/**
 * Busca oportunidades paginando con cursor.
 *
 * Usa `startAfter` + `startAfterId` y no `page`: el paginado por número se
 * degrada y saltea filas si el dataset cambia mientras se recorre, que es
 * exactamente lo que pasa en un pipeline activo. `limit` tope 100.
 *
 * ⚠️ Esto devuelve el **estado actual**, no el historial. Para contar cuántas
 * oportunidades pasaron por una etapa durante un período hace falta
 * `ghl_stage_transitions` — ver lib/ghl/stage-transition.ts.
 */
export async function searchGHLOpportunities(
  apiKey: string,
  locationId: string,
  options: SearchOpportunitiesOptions = {}
): Promise<GHLOpportunity[]> {
  const maxRows = options.maxRows ?? 2000;
  const all: GHLOpportunity[] = [];
  let startAfter: string | undefined;
  let startAfterId: string | undefined;

  while (all.length < maxRows) {
    const params: Record<string, string> = {
      locationId,
      limit: "100",
      order: "added_asc",
    };
    if (options.pipelineId) params.pipelineId = options.pipelineId;
    if (options.pipelineStageId) params.pipelineStageId = options.pipelineStageId;
    if (options.status) params.status = options.status;
    if (options.date) params.date = options.date;
    if (options.endDate) params.endDate = options.endDate;
    if (startAfter) params.startAfter = startAfter;
    if (startAfterId) params.startAfterId = startAfterId;

    const data = await ghlFetch<{
      opportunities?: GHLOpportunity[];
      meta?: { startAfter?: number | string; startAfterId?: string };
    }>(apiKey, "/opportunities/search", params, GHL_OPPORTUNITIES_VERSION);

    const page = data.opportunities ?? [];
    all.push(...page);

    if (page.length < 100 || !data.meta?.startAfterId) break;
    startAfter = data.meta.startAfter !== undefined ? String(data.meta.startAfter) : undefined;
    startAfterId = data.meta.startAfterId;
  }

  return all;
}
