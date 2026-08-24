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

// ─── Tipos de respuesta GHL ───────────────────────────────────────────────────

export type GHLCalendar = {
  id: string;
  name: string;
  description?: string;
  locationId: string;
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
  params?: Record<string, string>
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
      Version: GHL_API_VERSION,
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
 * startTime y endTime en ISO 8601 (ej: "2024-01-01T00:00:00Z").
 *
 * GHL V2 limita a 20 por página; se itera hasta obtener todos.
 */
export async function listGHLAppointments(
  apiKey: string,
  locationId: string,
  calendarId: string,
  startTime: string,
  endTime: string
): Promise<GHLAppointment[]> {
  const all: GHLAppointment[] = [];
  let currentPage = 1;

  while (true) {
    const data = await ghlFetch<{
      appointments?: GHLAppointment[];
      meta?: { currentPage?: number; nextPage?: number | null };
    }>(apiKey, "/calendars/appointments", {
      locationId,
      calendarId,
      startTime,
      endTime,
      includeAll: "true",
      page: String(currentPage),
    });

    const page = data.appointments ?? [];
    all.push(...page);

    const nextPage = data.meta?.nextPage ?? null;
    if (!nextPage || page.length === 0) break;
    currentPage = nextPage;
  }

  return all;
}
