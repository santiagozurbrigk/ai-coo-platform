import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackTokenUsage } from "@/lib/track-token-usage";

/** IDs de modelo para la API de Anthropic */
export const AI_MODELS = {
  HAIKU: "claude-haiku-4-5-20251001",
  SONNET: "claude-sonnet-4-6",
} as const;

export type AITask =
  | "conversation_scoring"
  | "content_labeling"
  | "booking_detection"
  | "data_extraction"
  | "agent_simple"
  | "call_analysis"
  | "weekly_report"
  | "sop_generation"
  | "agent_complex"
  | "product_extraction"
  | "sales_analysis";

const TASK_MODEL_MAP: Record<AITask, string> = {
  conversation_scoring: AI_MODELS.HAIKU,
  content_labeling: AI_MODELS.HAIKU,
  booking_detection: AI_MODELS.HAIKU,
  data_extraction: AI_MODELS.HAIKU,
  agent_simple: AI_MODELS.HAIKU,

  call_analysis: AI_MODELS.SONNET,
  weekly_report: AI_MODELS.SONNET,
  sop_generation: AI_MODELS.SONNET,
  agent_complex: AI_MODELS.SONNET,
  product_extraction: AI_MODELS.SONNET,
  sales_analysis: AI_MODELS.SONNET,
};

/** Alias hasta disponibilidad GA de Sonnet 4.6 en la API */
const API_MODEL_ALIASES: Record<string, string> = {
  "claude-sonnet-4-6": "claude-sonnet-4-5-20250929",
};

/** Alias cortos legacy (override manual) */
export type ClaudeModel =
  | "claude-haiku-4-5"
  | "claude-sonnet-4-5"
  | "claude-sonnet-4-6";

const LEGACY_MODEL_MAP: Record<ClaudeModel, string> = {
  "claude-haiku-4-5": AI_MODELS.HAIKU,
  "claude-sonnet-4-5": "claude-sonnet-4-5-20250929",
  "claude-sonnet-4-6": AI_MODELS.SONNET,
};

export function getModelForTask(task: AITask): string {
  return TASK_MODEL_MAP[task];
}

export function detectAgentComplexity(
  message: string,
  hasRAGContext: boolean
): AITask {
  const simplePatterns = [
    /^(qué|cuál|cuánto|cuántos|cuántas|dónde|quién|cómo se llama)/i,
    /^(dame|mostrame|listame|decime)/i,
    /\?((\s*)$)/,
  ];

  const complexPatterns = [
    /analiz/i,
    /recomiend/i,
    /estrategia/i,
    /por qué/i,
    /cómo puedo mejorar/i,
    /qué debería/i,
    /compara/i,
    /explica/i,
  ];

  const isComplex =
    complexPatterns.some((p) => p.test(message)) ||
    hasRAGContext ||
    message.length > 200;

  const isSimple =
    !isComplex &&
    simplePatterns.some((p) => p.test(message)) &&
    message.length < 100;

  if (isSimple) return "agent_simple";
  return "agent_complex";
}

function resolveLogicalModel(opts: {
  task?: AITask;
  model?: ClaudeModel | string;
}): string {
  if (opts.model) {
    if (opts.model in LEGACY_MODEL_MAP) {
      return LEGACY_MODEL_MAP[opts.model as ClaudeModel];
    }
    return opts.model;
  }
  if (opts.task) return getModelForTask(opts.task);
  return AI_MODELS.HAIKU;
}

function resolveApiModelId(logicalModel: string): string {
  return API_MODEL_ALIASES[logicalModel] ?? logicalModel;
}

const orgKeyCache = new Map<string, { key: string; cachedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getGlobalClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

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
  task?: AITask;
  model?: ClaudeModel | string;
  feature: string;
  system: string;
  user: string;
  maxTokens?: number;
};

export type ClaudeTextRequest = {
  organizationId: string;
  task?: AITask;
  model?: ClaudeModel | string;
  feature: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
};

async function trackUsage(
  organizationId: string,
  logicalModel: string,
  feature: string,
  inputTokens: number,
  outputTokens: number
) {
  await trackTokenUsage({
    organizationId,
    model: logicalModel,
    inputTokens,
    outputTokens,
    feature,
  }).catch(() => {});
}

export async function callClaudeText(
  req: ClaudeTextRequest
): Promise<string | null> {
  const client = await getClientForOrg(req.organizationId);
  if (!client) {
    console.warn("[callClaudeText] Sin API key (org BYOK ni ANTHROPIC_API_KEY)");
    return null;
  }

  const logicalModel = resolveLogicalModel(req);
  const apiModel = resolveApiModelId(logicalModel);

  const response = await client.messages.create({
    model: apiModel,
    max_tokens: req.maxTokens ?? 4096,
    system: req.system,
    messages: req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  await trackUsage(
    req.organizationId,
    logicalModel,
    req.feature,
    response.usage.input_tokens,
    response.usage.output_tokens
  );

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

  const logicalModel = resolveLogicalModel(req);
  const apiModel = resolveApiModelId(logicalModel);

  const response = await client.messages.create({
    model: apiModel,
    max_tokens: req.maxTokens ?? 2048,
    system: req.system,
    messages: [{ role: "user", content: req.user }],
  });

  await trackUsage(
    req.organizationId,
    logicalModel,
    req.feature,
    response.usage.input_tokens,
    response.usage.output_tokens
  );

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
