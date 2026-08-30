/**
 * Cliente de la Analytics API de VTurb.
 *
 * VERIFICADO el 2026-08-30 contra docs/external-apis/vturb/ (openapi.json y las
 * páginas de la carpeta).
 *
 * | | |
 * |---|---|
 * | Base | `https://analytics.vturb.net` |
 * | Auth | headers `X-Api-Token` y `X-Api-Version` — **los dos obligatorios**, si falta uno la respuesta es 401 |
 * | Método | casi todo es POST con el filtro en el body; `/players/list` y `/quota/usage` son GET |
 *
 * ⚠️ **Discrepancia de versión sin resolver.** La página de autenticación dice que
 * `X-Api-Version` acepta "actualmente sólo `v1`", pero el spec declara
 * `info.version: "v3"`. Se manda `v1`, que es lo que dice la documentación de
 * autenticación, y queda para confirmar con la primera llamada real
 * (docs/PLAN_VERIFICACION.md).
 *
 * ⚠️ **`end_date` es opcional en varios endpoints y omitirlo cambia el resultado.**
 * Las release notes documentan un bug —vivo hasta 2026-05-07— donde tres endpoints
 * lo ignoraban y devolvían datos hasta "ahora", inflando cualquier ventana
 * histórica. Este cliente lo manda **siempre**, explícito.
 */

const VTURB_API_BASE = process.env.VTURB_API_BASE ?? "https://analytics.vturb.net";
const VTURB_API_VERSION = "v1";

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Player de VTurb. Los cuatro campos están documentados en `/players/list`. */
export type VTurbPlayer = {
  id: string;
  name?: string;
  /** Segundo del pitch. **0 si el player no lo tiene configurado.** */
  pitch_time?: number;
  /** Duración del video en segundos. */
  duration?: number;
  created_at?: string;
};

/**
 * Objeto `Stats` de `/sessions/stats`.
 *
 * ⚠️ **Ningún campo tiene descripción en el spec.** Los nombres son transparentes
 * pero la semántica exacta —qué cuenta como `viewed` contra `started`, qué
 * deduplican los sufijos `_uniq`— hay que confirmarla contra el dashboard de
 * VTurb. Por eso la respuesta cruda se persiste antes de interpretarse.
 */
export type VTurbStats = {
  total_viewed?: number;
  total_viewed_device_uniq?: number;
  total_viewed_session_uniq?: number;
  total_started?: number;
  total_started_device_uniq?: number;
  total_started_session_uniq?: number;
  total_finished?: number;
  total_clicked?: number;
  total_over_pitch?: number;
  total_under_pitch?: number;
  over_pitch_rate?: number;
  engagement_rate?: number;
  play_rate?: number;
  total_conversions?: number;
  overall_conversion_rate?: number;
  [key: string]: unknown;
};

/** Respuesta de `/times/user_engagement`: promedio y curva de retención. */
export type VTurbEngagement = {
  average_watched_time?: number;
  /** `average_watched_time / video_duration * 100`, según el spec. */
  engagement_rate?: number;
  /** Curva: cuántos usuarios llegaron a cada segundo del video. */
  grouped_timed?: { timed: number; total_users: number }[];
  [key: string]: unknown;
};

export type VTurbQuotaEntry = {
  metric?: string;
  interval_seconds?: number;
  used?: number;
  /** `null` cuando la cuota es ilimitada. */
  limit?: number | null;
  remaining?: number | null;
};

export class VTurbApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Cuándo reintentar, si VTurb lo indicó en un 429. */
    public readonly resetsAt: string | null = null
  ) {
    super(message);
    this.name = "VTurbApiError";
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

type QuotaErrorBody = {
  error?: string;
  code?: number;
  details?: { resets_at?: string };
};

async function vturbFetch<T>(
  apiKey: string,
  path: string,
  init: { method: "GET"; params?: Record<string, string> } | { method: "POST"; body: unknown }
): Promise<T> {
  const url = new URL(`${VTURB_API_BASE}${path}`);
  if (init.method === "GET" && init.params) {
    for (const [k, v] of Object.entries(init.params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const resp = await fetch(url.toString(), {
    method: init.method,
    headers: {
      "X-Api-Token": apiKey,
      "X-Api-Version": VTURB_API_VERSION,
      Accept: "application/json",
      ...(init.method === "POST" ? { "Content-Type": "application/json" } : {}),
    },
    body: init.method === "POST" ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!resp.ok) {
    let message = `VTurb API error ${resp.status}`;
    let resetsAt: string | null = null;
    try {
      const body = (await resp.json()) as QuotaErrorBody;
      if (body.error) message = body.error;
      // En un 429 VTurb dice cuándo reintentar. Usarlo es mejor que un backoff
      // a ciegas, que puede volver a pegarle a la cuota.
      if (body.details?.resets_at) resetsAt = body.details.resets_at;
    } catch {
      // Cuerpo no JSON: queda el mensaje genérico.
    }
    throw new VTurbApiError(resp.status, message, resetsAt);
  }

  return resp.json() as Promise<T>;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * Lista los players de la cuenta.
 *
 * Es también la validación de la API key: si el token o la versión están mal,
 * VTurb devuelve 401.
 */
export async function listVTurbPlayers(
  apiKey: string,
  options: { name?: string; nameMatch?: "contains" | "starts_with" | "ends_with" | "exact" } = {}
): Promise<VTurbPlayer[]> {
  const params: Record<string, string> = {};
  if (options.name) {
    params.name = options.name;
    // `name_match` sin `name` devuelve 400.
    if (options.nameMatch) params.name_match = options.nameMatch;
  }

  const data = await vturbFetch<VTurbPlayer[] | { players?: VTurbPlayer[] }>(
    apiKey,
    "/players/list",
    { method: "GET", params }
  );

  // El spec declara un array pelado; se acepta el envelope por tolerancia.
  return Array.isArray(data) ? data : (data.players ?? []);
}

export type VTurbPeriodRequest = {
  playerId: string;
  startDate: string;
  endDate: string;
  timezone?: string;
  videoDuration?: number;
  /**
   * Segundo del pitch con el que calcular `total_over_pitch`.
   *
   * Si no se manda, VTurb usa el que tenga configurado el player. Mandarlo
   * explícito es lo que permite medir M12 en un player que tiene `pitch_time = 0`.
   */
  pitchTime?: number;
};

/** Estadísticas agregadas del período. De acá salen M08, M10 y M12. */
export async function getVTurbSessionStats(
  apiKey: string,
  request: VTurbPeriodRequest
): Promise<VTurbStats> {
  return vturbFetch<VTurbStats>(apiKey, "/sessions/stats", {
    method: "POST",
    body: {
      player_id: request.playerId,
      start_date: request.startDate,
      end_date: request.endDate,
      ...(request.timezone ? { timezone: request.timezone } : {}),
      ...(request.videoDuration ? { video_duration: request.videoDuration } : {}),
      ...(request.pitchTime ? { pitch_time: request.pitchTime } : {}),
    },
  });
}

/**
 * Retención: promedio y curva por segundo. De acá sale M11.
 *
 * `video_duration` es **requerido** por este endpoint (a diferencia de
 * `/sessions/stats`, donde es opcional), así que hay que tener el player
 * sincronizado antes de poder pedirlo.
 */
export async function getVTurbUserEngagement(
  apiKey: string,
  request: VTurbPeriodRequest & { videoDuration: number }
): Promise<VTurbEngagement> {
  return vturbFetch<VTurbEngagement>(apiKey, "/times/user_engagement", {
    method: "POST",
    body: {
      player_id: request.playerId,
      video_duration: request.videoDuration,
      start_date: request.startDate,
      end_date: request.endDate,
      ...(request.timezone ? { timezone: request.timezone } : {}),
    },
  });
}

/**
 * Estado de las cuotas en vivo.
 *
 * La doc marca `read_bytes` como *"la señal más confiable para dimensionar el
 * uso"*, porque una sola llamada HTTP puede contar como más de una `query`.
 * Cuesta 1 query contra el límite por minuto.
 */
export async function getVTurbQuotaUsage(apiKey: string): Promise<VTurbQuotaEntry[]> {
  const data = await vturbFetch<VTurbQuotaEntry[] | { usage?: VTurbQuotaEntry[] }>(
    apiKey,
    "/quota/usage",
    { method: "GET" }
  );
  return Array.isArray(data) ? data : (data.usage ?? []);
}
