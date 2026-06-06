const FATHOM_API_BASE =
  process.env.FATHOM_API_BASE?.trim() ?? "https://api.fathom.ai/external/v1";

/** Documentado: GET /external/v1/meetings — legacy no oficial: /v1/calls */
export const FATHOM_LIST_MEETINGS_PATH = "/meetings";
export const FATHOM_LEGACY_CALLS_URL = "https://api.fathom.ai/v1/calls";

export class FathomApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "FathomApiError";
  }
}

function fathomHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "X-Api-Key": apiKey,
    Accept: "application/json",
  };
}

async function parseFathomErrorFromText(rawText: string, statusText: string): Promise<string> {
  try {
    const body = JSON.parse(rawText) as { message?: string; error?: string };
    return body.message ?? body.error ?? statusText;
  } catch {
    return statusText || "Error desconocido";
  }
}

function logFathomApiKeyDebug(apiKey: string | undefined | null, context: string) {
  console.log(`[Fathom:${context}] API key length:`, apiKey?.length ?? "MISSING");
  console.log(`[Fathom:${context}] API key prefix:`, apiKey?.slice(0, 8) ?? "MISSING");
}

function logFathomHttpDebug(
  context: string,
  endpoint: string,
  res: Response,
  rawText: string
) {
  console.log(`[Fathom:${context}] Endpoint:`, endpoint);
  console.log(`[Fathom:${context}] Status:`, res.status);
  console.log(
    `[Fathom:${context}] Headers:`,
    Object.fromEntries(res.headers.entries())
  );
  console.log(`[Fathom:${context}] Raw response:`, rawText.slice(0, 500));
}

export type FathomListPayload = {
  items: unknown[];
  nextCursor: string | null;
  topLevelKeys: string[];
  isDirectArray: boolean;
};

/** Normaliza listados: array directo, { items }, { data }, { calls }, paginación next_cursor. */
export function parseFathomListPayload(data: unknown): FathomListPayload {
  if (Array.isArray(data)) {
    return {
      items: data,
      nextCursor: null,
      topLevelKeys: ["<array>"],
      isDirectArray: true,
    };
  }

  if (!data || typeof data !== "object") {
    return {
      items: [],
      nextCursor: null,
      topLevelKeys: [],
      isDirectArray: false,
    };
  }

  const obj = data as Record<string, unknown>;
  const topLevelKeys = Object.keys(obj);
  const rawItems =
    obj.items ?? obj.meetings ?? obj.calls ?? obj.data ?? obj.results ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];
  const nextRaw = obj.next_cursor ?? obj.cursor ?? null;

  console.log("[Fathom] Parsed list payload:", {
    topLevelKeys,
    itemCount: items.length,
    next_cursor: nextRaw,
    hasDataArray: Array.isArray(obj.data),
    hasItemsArray: Array.isArray(obj.items),
    hasCallsArray: Array.isArray(obj.calls),
  });

  return {
    items,
    nextCursor: typeof nextRaw === "string" && nextRaw.length > 0 ? nextRaw : null,
    topLevelKeys,
    isDirectArray: false,
  };
}

async function fetchFathomListPage(
  apiKey: string,
  listUrl: URL,
  context: string,
  debug: boolean
): Promise<{ res: Response; rawText: string; endpoint: string }> {
  const endpoint = listUrl.toString();
  logFathomApiKeyDebug(apiKey, context);

  const res = await fetch(endpoint, {
    headers: fathomHeaders(apiKey),
    cache: "no-store",
  });

  const rawText = await res.text();
  if (debug) {
    logFathomHttpDebug(context, endpoint, res, rawText);
  }

  return { res, rawText, endpoint };
}


/** Valida la API key listando una reunión (llamada de prueba). */
export async function validateFathomApiKey(apiKey: string): Promise<void> {
  const url = new URL(`${FATHOM_API_BASE}${FATHOM_LIST_MEETINGS_PATH}`);
  url.searchParams.set("limit", "1");

  const { res, rawText } = await fetchFathomListPage(
    apiKey,
    url,
    "validate",
    true
  );

  if (res.status === 401 || res.status === 403) {
    throw new FathomApiError(
      "API key de Fathom inválida. Revisala en fathom.video/settings/api.",
      res.status
    );
  }

  if (!res.ok) {
    const detail = await parseFathomErrorFromText(rawText, res.statusText);
    throw new FathomApiError(
      `No se pudo validar la API key de Fathom: ${detail}`,
      res.status
    );
  }
}

export type FathomListProbeResult = {
  endpoint: string;
  status: number;
  rawPreview: string;
  topLevelKeys: string[];
  itemCount: number;
  nextCursor: string | null;
};

/** Probe de diagnóstico — usa el endpoint documentado GET /external/v1/meetings. */
export async function probeFathomListEndpoint(
  apiKey: string,
  context = "probe"
): Promise<FathomListProbeResult> {
  const url = new URL(`${FATHOM_API_BASE}${FATHOM_LIST_MEETINGS_PATH}`);
  url.searchParams.set("limit", "5");
  url.searchParams.set("include_transcript", "true");

  const { res, rawText, endpoint } = await fetchFathomListPage(
    apiKey,
    url,
    context,
    true
  );

  let parsed: FathomListPayload = {
    items: [],
    nextCursor: null,
    topLevelKeys: [],
    isDirectArray: false,
  };

  if (rawText.trim()) {
    try {
      parsed = parseFathomListPayload(JSON.parse(rawText) as unknown);
    } catch (e) {
      console.error(`[Fathom:${context}] JSON parse error:`, e);
    }
  }

  if (res.status === 404) {
    console.warn(
      `[Fathom:${context}] ${endpoint} returned 404 — documented path is GET ${FATHOM_API_BASE}${FATHOM_LIST_MEETINGS_PATH}`
    );
    const legacyRes = await fetch(FATHOM_LEGACY_CALLS_URL, {
      headers: fathomHeaders(apiKey),
      cache: "no-store",
    });
    const legacyText = await legacyRes.text();
    console.log(`[Fathom:${context}] Legacy /v1/calls status:`, legacyRes.status);
    console.log(`[Fathom:${context}] Legacy raw:`, legacyText.slice(0, 500));
  }

  return {
    endpoint,
    status: res.status,
    rawPreview: rawText.slice(0, 500),
    topLevelKeys: parsed.topLevelKeys,
    itemCount: parsed.items.length,
    nextCursor: parsed.nextCursor,
  };
}

export type FathomMeetingRecord = {
  id: string;
  recording_id: string;
  title: string;
  meeting_title?: string;
  transcript?: string;
  /** Transcript crudo de la API (array/objeto) — se serializa a text en sync. */
  transcriptRaw?: unknown;
  summary?: string;
  durationSeconds?: number;
  callDate?: string;
  recording_start_time?: string;
  scheduled_start_time?: string;
  recording_end_time?: string;
  url?: string;
};

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function extractTranscript(raw: unknown): string | undefined {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const lines = raw
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (!entry || typeof entry !== "object") return "";
        const seg = entry as Record<string, unknown>;
        return typeof seg.text === "string" ? seg.text : "";
      })
      .filter(Boolean);
    if (lines.length) return lines.join("\n");
    return undefined;
  }
  if (!raw || typeof raw !== "object") return undefined;

  const obj = raw as Record<string, unknown>;
  if (typeof obj.text === "string") return obj.text;
  if (Array.isArray(obj.segments)) {
    const lines = obj.segments
      .map((s) => {
        if (!s || typeof s !== "object") return "";
        const seg = s as Record<string, unknown>;
        return typeof seg.text === "string" ? seg.text : "";
      })
      .filter(Boolean);
    if (lines.length) return lines.join("\n");
  }
  return undefined;
}

export function mapFathomMeeting(raw: unknown): FathomMeetingRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const id = pickString(obj, [
    "recording_id",
    "call_id",
    "id",
    "meeting_id",
  ]);
  if (!id) return null;

  const title =
    pickString(obj, ["title", "meeting_title", "name"]) ?? "Llamada Fathom";
  const meetingTitle = pickString(obj, ["meeting_title", "title"]);

  const recordingStart = pickString(obj, [
    "recording_start_time",
    "recorded_at",
    "created_at",
    "start_time",
  ]);
  const scheduledStart = pickString(obj, ["scheduled_start_time"]);
  const recordingEnd = pickString(obj, ["recording_end_time", "scheduled_end_time"]);

  return {
    id,
    recording_id: id,
    title,
    meeting_title: meetingTitle,
    transcript: extractTranscript(obj.transcript),
    transcriptRaw: obj.transcript,
    summary: pickString(obj, ["summary", "ai_summary", "default_summary"]),
    durationSeconds: pickNumber(obj, [
      "duration_seconds",
      "duration",
      "duration_in_seconds",
    ]),
    callDate: recordingStart ?? scheduledStart,
    recording_start_time: recordingStart,
    scheduled_start_time: scheduledStart,
    recording_end_time: recordingEnd,
    url: pickString(obj, ["url", "share_url", "record_url", "recording_url"]),
  };
}

export type ListFathomMeetingsOptions = {
  createdAfter?: string;
  includeTranscript?: boolean;
  maxPages?: number;
  /** Loguea status, headers, respuesta cruda y shape de paginación (cron/debug). */
  debug?: boolean;
  debugContext?: string;
};

export async function listFathomMeetings(
  apiKey: string,
  options: ListFathomMeetingsOptions = {}
): Promise<FathomMeetingRecord[]> {
  const meetings: FathomMeetingRecord[] = [];
  let cursor: string | undefined;
  const maxPages = options.maxPages ?? 20;
  const debug = options.debug ?? false;
  const context = options.debugContext ?? "list";

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(`${FATHOM_API_BASE}${FATHOM_LIST_MEETINGS_PATH}`);
    if (cursor) url.searchParams.set("cursor", cursor);
    if (options.createdAfter) {
      url.searchParams.set("created_after", options.createdAfter);
    }
    if (options.includeTranscript !== false) {
      url.searchParams.set("include_transcript", "true");
    }

    const { res, rawText, endpoint } = await fetchFathomListPage(
      apiKey,
      url,
      `${context}:page${page}`,
      debug || page === 0
    );

    if (res.status === 401 || res.status === 403) {
      throw new FathomApiError(
        "API key de Fathom inválida o revocada.",
        res.status
      );
    }

    if (!res.ok) {
      const detail = await parseFathomErrorFromText(rawText, res.statusText);
      throw new FathomApiError(
        `Error al listar reuniones de Fathom (${endpoint}): ${detail}`,
        res.status
      );
    }

    let data: unknown;
    try {
      data = rawText.trim() ? JSON.parse(rawText) : {};
    } catch (e) {
      console.error(`[Fathom:${context}] Invalid JSON on page ${page}:`, e);
      throw new FathomApiError("Respuesta JSON inválida de Fathom.", res.status);
    }

    const { items, nextCursor } = parseFathomListPayload(data);
    for (const item of items) {
      const mapped = mapFathomMeeting(item);
      if (mapped) {
        meetings.push(mapped);
      } else if (debug) {
        const keys =
          item && typeof item === "object"
            ? Object.keys(item as Record<string, unknown>)
            : [];
        console.warn("[Fathom] Skipped unmapped meeting item:", {
          keys,
          recording_id:
            item && typeof item === "object"
              ? (item as Record<string, unknown>).recording_id
              : undefined,
        });
      }
    }

    if (!nextCursor) break;
    cursor = nextCursor;
  }

  if (debug) {
    console.log(`[Fathom:${context}] Total meetings mapped:`, meetings.length);
  }

  return meetings;
}

export async function fetchFathomMeetingTitle(
  apiKey: string,
  meetingId: string
): Promise<string | null> {
  try {
    const res = await fetch(`${FATHOM_API_BASE}/meetings/${meetingId}`, {
      headers: fathomHeaders(apiKey),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return (
      pickString(data, ["title", "meeting_title", "name"]) ?? null
    );
  } catch {
    return null;
  }
}
