const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

export type ClaudeKeyValidationResult =
  | { ok: true }
  | { ok: false; reason: "format" | "invalid" | "network" };

export function assertClaudeKeyFormat(apiKey: string): void {
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith("sk-ant-")) {
    throw new Error("La API key debe empezar con sk-ant-");
  }
}

export async function validateClaudeApiKey(
  apiKey: string
): Promise<ClaudeKeyValidationResult> {
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith("sk-ant-")) {
    return { ok: false, reason: "format" };
  }

  try {
    const testResponse = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "x-api-key": trimmed,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });

    if (!testResponse.ok) {
      return { ok: false, reason: "invalid" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export function validationErrorMessage(
  reason: Exclude<ClaudeKeyValidationResult, { ok: true }>["reason"]
): string {
  if (reason === "format") {
    return "La API key no es válida. Verificá que empiece con sk-ant-";
  }
  if (reason === "invalid") {
    return "La API key es válida pero no tiene créditos disponibles";
  }
  return "No se pudo verificar la key. Intentá de nuevo.";
}
