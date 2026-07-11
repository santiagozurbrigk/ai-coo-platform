import {
  isAnthropicNoCreditsError,
  parseAnthropicErrorBody,
  type AnthropicErrorBody,
} from "@/lib/ai/validate-claude-key";

export type ClaudeKeySource = "api_key" | "global";

function isOrgOwnedKey(source: ClaudeKeySource): boolean {
  return source === "api_key";
}

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

export function claudeNoCreditsUserMessage(keySource: ClaudeKeySource): string {
  if (isOrgOwnedKey(keySource)) {
    return "No se pudo generar el contenido con IA: tu cuenta de Claude no tiene créditos disponibles. Revisá tu configuración en Settings → IA, o contactá al soporte si el problema persiste.";
  }

  return "No se pudo generar el contenido con IA: el servicio no está disponible momentáneamente por falta de capacidad de IA. Contactá al soporte si el problema persiste.";
}

export function mapAnthropicCallError(
  error: unknown,
  keySource: ClaudeKeySource
): Error {
  const parsed = extractAnthropicError(error);
  if (parsed && isAnthropicNoCreditsError(parsed.status, parsed.body)) {
    return new Error(claudeNoCreditsUserMessage(keySource));
  }

  if (error instanceof Error) return error;
  return new Error("No se pudo completar la solicitud a Claude.");
}
