import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackTokenUsage, type TokenUsageModel } from "@/lib/track-token-usage";

export type ClaudeModel =
  | "claude-haiku-4-5"
  | "claude-sonnet-4-5"
  | "claude-sonnet-4-6";

const MODEL_MAP: Record<ClaudeModel, string> = {
  "claude-haiku-4-5": "claude-haiku-4-5-20251001",
  "claude-sonnet-4-5": "claude-sonnet-4-5-20250929",
  /** Alias de producto; API actual usa Sonnet 4.5 hasta disponibilidad de 4.6 */
  "claude-sonnet-4-6": "claude-sonnet-4-5-20250929",
};

const orgKeyCache = new Map<string, { key: string; cachedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getGlobalClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

// TODO: Phase 2 — routing por tarea: Haiku (clasificación/tagging), Sonnet (reportes), Opus (SOPs)
// TODO: Phase 2 — implementar prompt caching en todo contexto org (SOPs, frameworks, equipo)

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function invalidateOrgKeyCache(organizationId: string): void {
  orgKeyCache.delete(organizationId);
}

export async function getClientForOrg(
  organizationId?: string
): Promise<Anthropic | null> {
  if (!organizationId) {
    return getGlobalClient();
  }

  const cached = orgKeyCache.get(organizationId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return new Anthropic({ apiKey: cached.key });
  }

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("organizations")
      .select("claude_api_key_encrypted, claude_api_key_status")
      .eq("id", organizationId)
      .maybeSingle();

    if (
      data?.claude_api_key_encrypted &&
      data.claude_api_key_status === "valid"
    ) {
      orgKeyCache.set(organizationId, {
        key: data.claude_api_key_encrypted,
        cachedAt: Date.now(),
      });
      return new Anthropic({ apiKey: data.claude_api_key_encrypted });
    }
  } catch {
    // Fallback a key global
  }

  return getGlobalClient();
}

export type ClaudeJsonRequest = {
  organizationId: string;
  model: ClaudeModel;
  feature: string;
  system: string;
  user: string;
  maxTokens?: number;
};

export type ClaudeTextRequest = {
  organizationId: string;
  model: ClaudeModel;
  feature: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
};

export async function callClaudeText(
  req: ClaudeTextRequest
): Promise<string | null> {
  const client = await getClientForOrg(req.organizationId);
  if (!client) {
    console.warn("[callClaudeText] Sin API key (org BYOK ni ANTHROPIC_API_KEY)");
    return null;
  }

  const response = await client.messages.create({
    model: MODEL_MAP[req.model],
    max_tokens: req.maxTokens ?? 4096,
    system: req.system,
    messages: req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  await trackTokenUsage({
    organizationId: req.organizationId,
    model: req.model as TokenUsageModel,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    feature: req.feature,
  }).catch(() => {});

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;
  return textBlock.text.trim();
}

export async function callClaudeJson<T>(
  req: ClaudeJsonRequest
): Promise<T | null> {
  const client = await getClientForOrg(req.organizationId);
  if (!client) {
    console.warn("[callClaudeJson] Sin API key (org BYOK ni ANTHROPIC_API_KEY)");
    return null;
  }

  const response = await client.messages.create({
    model: MODEL_MAP[req.model],
    max_tokens: req.maxTokens ?? 2048,
    system: req.system,
    messages: [{ role: "user", content: req.user }],
  });

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  await trackTokenUsage({
    organizationId: req.organizationId,
    model: req.model as TokenUsageModel,
    inputTokens,
    outputTokens,
    feature: req.feature,
  }).catch(() => {});

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;

  const raw = textBlock.text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return null;
  }
}
