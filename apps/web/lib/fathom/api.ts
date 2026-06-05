const FATHOM_API_BASE =
  process.env.FATHOM_API_BASE?.trim() ?? "https://api.fathom.ai/external/v1";

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

async function parseFathomError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.message ?? body.error ?? res.statusText;
  } catch {
    return res.statusText || "Error desconocido";
  }
}

/** Valida la API key listando una reunión (llamada de prueba). */
export async function validateFathomApiKey(apiKey: string): Promise<void> {
  const url = new URL(`${FATHOM_API_BASE}/meetings`);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: fathomHeaders(apiKey),
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    throw new FathomApiError(
      "API key de Fathom inválida. Revisala en fathom.video/settings/api.",
      res.status
    );
  }

  if (!res.ok) {
    const detail = await parseFathomError(res);
    throw new FathomApiError(
      `No se pudo validar la API key de Fathom: ${detail}`,
      res.status
    );
  }
}

export type FathomMeetingRecord = {
  id: string;
  title: string;
  transcript?: string;
  summary?: string;
  durationSeconds?: number;
  callDate?: string;
  url?: string;
};

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
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

  return {
    id,
    title,
    transcript: extractTranscript(obj.transcript),
    summary: pickString(obj, ["summary", "ai_summary", "default_summary"]),
    durationSeconds: pickNumber(obj, [
      "duration_seconds",
      "duration",
      "duration_in_seconds",
    ]),
    callDate: pickString(obj, [
      "recorded_at",
      "created_at",
      "start_time",
      "scheduled_start_time",
    ]),
    url: pickString(obj, ["url", "share_url", "record_url", "recording_url"]),
  };
}

export type ListFathomMeetingsOptions = {
  createdAfter?: string;
  includeTranscript?: boolean;
  maxPages?: number;
};

export async function listFathomMeetings(
  apiKey: string,
  options: ListFathomMeetingsOptions = {}
): Promise<FathomMeetingRecord[]> {
  const meetings: FathomMeetingRecord[] = [];
  let cursor: string | undefined;
  const maxPages = options.maxPages ?? 20;

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(`${FATHOM_API_BASE}/meetings`);
    if (cursor) url.searchParams.set("cursor", cursor);
    if (options.createdAfter) {
      url.searchParams.set("created_after", options.createdAfter);
    }
    if (options.includeTranscript !== false) {
      url.searchParams.set("include_transcript", "true");
    }

    const res = await fetch(url.toString(), {
      headers: fathomHeaders(apiKey),
      cache: "no-store",
    });

    if (res.status === 401 || res.status === 403) {
      throw new FathomApiError(
        "API key de Fathom inválida o revocada.",
        res.status
      );
    }

    if (!res.ok) {
      const detail = await parseFathomError(res);
      throw new FathomApiError(
        `Error al listar reuniones de Fathom: ${detail}`,
        res.status
      );
    }

    const data = (await res.json()) as {
      items?: unknown[];
      meetings?: unknown[];
      calls?: unknown[];
      data?: unknown[];
      next_cursor?: string | null;
      cursor?: string | null;
    };

    const items = data.items ?? data.meetings ?? data.calls ?? data.data ?? [];
    for (const item of items) {
      const mapped = mapFathomMeeting(item);
      if (mapped) meetings.push(mapped);
    }

    const next = data.next_cursor ?? data.cursor;
    if (!next || typeof next !== "string") break;
    cursor = next;
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
