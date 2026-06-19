const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";

export type ClaudeKeyValidationResult =
  | { ok: true; status: "valid" }
  | { ok: true; status: "valid_no_credits" }
  | { ok: false; reason: "format" | "auth" | "invalid" | "network" };

type AnthropicErrorBody = {
  type?: string;
  error?: {
    type?: string;
    message?: string;
  };
};

export function assertClaudeKeyFormat(apiKey: string): void {
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith("sk-ant-")) {
    throw new Error("La API key debe empezar con sk-ant-");
  }
}

function parseAnthropicErrorBody(text: string): AnthropicErrorBody | null {
  try {
    return JSON.parse(text) as AnthropicErrorBody;
  } catch {
    return null;
  }
}

/** Anthropic devuelve 400 + invalid_request_error cuando la key es válida pero no hay créditos. */
function isNoCreditsError(status: number, body: AnthropicErrorBody | null): boolean {
  if (status !== 400 || !body?.error) return false;

  const errorType = body.error.type ?? "";
  const message = (body.error.message ?? "").toLowerCase();

  if (errorType === "billing_error") return true;

  return (
    message.includes("credit balance") ||
    message.includes("insufficient credit") ||
    message.includes("purchase credits") ||
    message.includes("plans & billing") ||
    message.includes("plans and billing") ||
    message.includes("spend limit") ||
    message.includes("usage is blocked due to insufficient credits")
  );
}

function isAuthError(status: number, body: AnthropicErrorBody | null): boolean {
  if (status === 401) return true;
  return body?.error?.type === "authentication_error";
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

    if (testResponse.ok) {
      return { ok: true, status: "valid" };
    }

    const bodyText = await testResponse.text();
    const body = parseAnthropicErrorBody(bodyText);

    if (isNoCreditsError(testResponse.status, body)) {
      return { ok: true, status: "valid_no_credits" };
    }

    if (isAuthError(testResponse.status, body)) {
      return { ok: false, reason: "auth" };
    }

    return { ok: false, reason: "invalid" };
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
  if (reason === "auth") {
    return "La API key no es válida o fue revocada. Verificá en console.anthropic.com";
  }
  if (reason === "invalid") {
    return "No se pudo validar la API key con Anthropic. Verificá que sea correcta.";
  }
  return "No se pudo verificar la key. Intentá de nuevo.";
}
