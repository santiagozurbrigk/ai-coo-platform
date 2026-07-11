import {
  parseAnthropicErrorBody,
  type AnthropicErrorBody,
} from "@/lib/ai/validate-claude-key";

function extractAnthropicError(
  error: unknown
): { status: number; body: AnthropicErrorBody | null } | null {
  if (error && typeof error === "object") {
    const candidate = error as {
      status?: number;
      error?: unknown;
      message?: string;
    };

    if (typeof candidate.status === "number") {
      if (candidate.error && typeof candidate.error === "object") {
        return {
          status: candidate.status,
          body: candidate.error as AnthropicErrorBody,
        };
      }

      if (typeof candidate.message === "string") {
        const fromMessage = parseAnthropicErrorFromMessage(candidate.message);
        if (fromMessage) return fromMessage;
      }
    }
  }

  if (error instanceof Error) {
    return parseAnthropicErrorFromMessage(error.message);
  }

  return null;
}

function parseAnthropicErrorFromMessage(
  message: string
): { status: number; body: AnthropicErrorBody | null } | null {
  const match = message.match(/^(\d{3})\s+(\{[\s\S]*\})/);
  if (!match) return null;

  return {
    status: Number.parseInt(match[1]!, 10),
    body: parseAnthropicErrorBody(match[2]!),
  };
}

/** Solo fallos de autenticación explícitos — no rate limit, timeouts ni errores de modelo. */
export function isAnthropicAuthFailure(error: unknown): boolean {
  const parsed = extractAnthropicError(error);
  if (!parsed) return false;

  if (parsed.status === 429) return false;

  const errorType = parsed.body?.error?.type ?? "";
  const message = (parsed.body?.error?.message ?? "").toLowerCase();

  if (parsed.status === 401) return true;

  if (parsed.status === 403) {
    return (
      errorType === "authentication_error" ||
      errorType === "permission_error" ||
      message.includes("not authorized") ||
      message.includes("authentication") ||
      message.includes("invalid api key") ||
      message.includes("invalid x-api-key")
    );
  }

  return errorType === "authentication_error";
}

export const NO_AI_CREDENTIALS_MESSAGE =
  "Reconectá tus credenciales de IA en Configuración → IA.";

export function noAiCredentialsError(): Error {
  return new Error(NO_AI_CREDENTIALS_MESSAGE);
}
