import { AI_MODELS } from "@/lib/ai/anthropic";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
export const OAUTH_PROBE_INTERVAL_MS = 24 * 60 * 60 * 1000;

/** Verifica si pasaron más de 24hs desde el último probe. */
export function shouldRunOAuthProbe(lastProbeAt: string | null): boolean {
  if (!lastProbeAt) return true;
  const elapsed = Date.now() - new Date(lastProbeAt).getTime();
  return elapsed >= OAUTH_PROBE_INTERVAL_MS;
}

/**
 * Llamada mínima con Haiku para verificar si el OAuth token volvió a funcionar.
 */
export async function probeOAuthTokenRequest(oauthToken: string): Promise<boolean> {
  try {
    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODELS.HAIKU,
        max_tokens: 1,
        messages: [{ role: "user", content: "x" }],
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}
