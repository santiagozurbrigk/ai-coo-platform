import Anthropic from "@anthropic-ai/sdk";
import { mapAnthropicCallError, type ClaudeKeySource } from "@/lib/ai/anthropic-errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/security/encryption";
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
  | "sales_analysis"
  | "intelligence_analysis"
  | "tone_analysis";

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
  intelligence_analysis: AI_MODELS.SONNET,
  tone_analysis: AI_MODELS.SONNET,
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

const PROMPT_CACHING_BETA = "prompt-caching-2024-07-31";

type CachedSystemBlock = {
  type: "text";
  text: string;
  cache_control: { type: "ephemeral" };
};

type SystemBlock = CachedSystemBlock | { type: "text"; text: string };

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

function buildSystemParam(
  cachedSystemPrompt?: string,
  system?: string
): string | SystemBlock[] | undefined {
  if (cachedSystemPrompt?.trim()) {
    const blocks: SystemBlock[] = [
      {
        type: "text",
        text: cachedSystemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ];
    if (system?.trim()) {
      blocks.push({ type: "text", text: system });
    }
    return blocks;
  }
  return system;
}

type ClaudeUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
};

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

type ClientResolution = {
  client: Anthropic | null;
  keySource: ClaudeKeySource | "none";
};

async function resolveClientForOrg(
  organizationId?: string
): Promise<ClientResolution> {
  if (!organizationId) {
    const client = getGlobalClient();
    return { client, keySource: client ? "global" : "none" };
  }

  const cached = orgKeyCache.get(organizationId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return {
      client: new Anthropic({ apiKey: cached.key }),
      keySource: "byok",
    };
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
      (data.claude_api_key_status === "valid" ||
        data.claude_api_key_status === "valid_no_credits")
    ) {
      let apiKey: string;
      try {
        apiKey = decrypt(data.claude_api_key_encrypted);
      } catch {
        console.warn(
          "[getClientForOrg] No se pudo descifrar BYOK key para org",
          organizationId
        );
        const client = getGlobalClient();
        return { client, keySource: client ? "global" : "none" };
      }

      orgKeyCache.set(organizationId, {
        key: apiKey,
        cachedAt: Date.now(),
      });
      return {
        client: new Anthropic({ apiKey }),
        keySource: "byok",
      };
    }
  } catch {
    // Fallback a key global
  }

  const client = getGlobalClient();
  return { client, keySource: client ? "global" : "none" };
}

export async function getClientForOrg(
  organizationId?: string
): Promise<Anthropic | null> {
  const { client } = await resolveClientForOrg(organizationId);
  return client;
}

export type ClaudeJsonRequest = {
  organizationId: string;
  task?: AITask;
  model?: ClaudeModel | string;
  feature: string;
  system?: string;
  cachedSystemPrompt?: string;
  user: string;
  maxTokens?: number;
};

export type ClaudeTextRequest = {
  organizationId: string;
  task?: AITask;
  model?: ClaudeModel | string;
  feature: string;
  system?: string;
  cachedSystemPrompt?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
};

async function trackUsage(
  organizationId: string,
  logicalModel: string,
  feature: string,
  usage: ClaudeUsage
) {
  await trackTokenUsage({
    organizationId,
    model: logicalModel,
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    cacheReadTokens: usage.cache_read_input_tokens ?? 0,
    cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
    feature,
  }).catch(() => {});
}

async function createClaudeMessage(
  client: Anthropic,
  keySource: ClaudeKeySource,
  params: {
    apiModel: string;
    maxTokens: number;
    system?: string;
    cachedSystemPrompt?: string;
    messages: Anthropic.MessageParam[];
  }
): Promise<Anthropic.Message> {
  const system = buildSystemParam(params.cachedSystemPrompt, params.system);
  const request = {
    model: params.apiModel,
    max_tokens: params.maxTokens,
    messages: params.messages,
    ...(system !== undefined && { system }),
  };

  try {
    if (params.cachedSystemPrompt?.trim()) {
      return await client.beta.messages.create({
        ...request,
        betas: [PROMPT_CACHING_BETA],
      });
    }

    return await client.messages.create(request);
  } catch (error) {
    throw mapAnthropicCallError(error, keySource);
  }
}

export async function callClaudeText(
  req: ClaudeTextRequest
): Promise<string | null> {
  const { client, keySource } = await resolveClientForOrg(req.organizationId);
  if (!client || keySource === "none") {
    console.warn("[callClaudeText] Sin API key (org BYOK ni ANTHROPIC_API_KEY)");
    return null;
  }

  const logicalModel = resolveLogicalModel(req);
  const apiModel = resolveApiModelId(logicalModel);

  const response = await createClaudeMessage(client, keySource, {
    apiModel,
    maxTokens: req.maxTokens ?? 4096,
    system: req.system,
    cachedSystemPrompt: req.cachedSystemPrompt,
    messages: req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  await trackUsage(
    req.organizationId,
    logicalModel,
    req.feature,
    response.usage as ClaudeUsage
  );

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return null;
  return textBlock.text.trim();
}

export type AgentToolInput = {
  name: string;
  input: Record<string, unknown>;
};

export type ClaudeAgentResult = {
  text: string;
  thinkingContent: string | null;
  /** Last tool call (kept for backward compatibility with generate_document) */
  toolCall: AgentToolInput | null;
  /** All tool calls across all agentic iterations */
  toolCalls: AgentToolInput[];
};

export type ClaudeAgentRequest = {
  organizationId: string;
  task?: AITask;
  model?: ClaudeModel | string;
  feature: string;
  system?: string;
  cachedSystemPrompt?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  enableWebSearch?: boolean;
  enableThinking?: boolean;
  thinkingBudget?: number;
  tools?: Anthropic.Tool[];
  onToolCall?: (name: string, input: Record<string, unknown>) => Promise<string>;
};

/**
 * Extended Claude call for the Agent module.
 * Supports web search, extended thinking, and custom tool calling.
 */
export async function callClaudeAgent(
  req: ClaudeAgentRequest
): Promise<ClaudeAgentResult> {
  const { client, keySource } = await resolveClientForOrg(req.organizationId);
  if (!client || keySource === "none") {
    console.warn("[callClaudeAgent] Sin API key (org BYOK ni ANTHROPIC_API_KEY)");
    return { text: "", thinkingContent: null, toolCall: null };
  }

  const logicalModel = resolveLogicalModel(req);
  const apiModel = resolveApiModelId(logicalModel);
  const maxTokens = req.maxTokens ?? 8192;
  const thinkingBudget = req.thinkingBudget ?? 6000;

  const systemParam = buildSystemParam(req.cachedSystemPrompt, req.system);

  const tools: Anthropic.Tool[] = [...(req.tools ?? [])];
  if (req.enableWebSearch) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools.push({ type: "web_search_20250305", name: "web_search" } as any);
  }

  const messages: Anthropic.MessageParam[] = req.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestBase: Record<string, any> = {
    model: apiModel,
    max_tokens: maxTokens,
    messages,
    ...(systemParam !== undefined && { system: systemParam }),
    ...(tools.length > 0 && { tools }),
    ...(req.enableThinking && {
      thinking: { type: "enabled", budget_tokens: thinkingBudget },
    }),
  };

  let response: Anthropic.Message;
  try {
    if (req.cachedSystemPrompt?.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response = (await client.beta.messages.create({
        ...requestBase,
        betas: [PROMPT_CACHING_BETA],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as Anthropic.Message;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response = (await (client.messages.create as (p: any) => Promise<Anthropic.Message>)(requestBase));
    }
  } catch (error) {
    throw mapAnthropicCallError(error, keySource);
  }

  await trackUsage(
    req.organizationId,
    logicalModel,
    req.feature,
    response.usage as ClaudeUsage
  );

  // Extract thinking blocks from the first response
  const thinkingBlocks = response.content.filter((b) => b.type === "thinking");
  const thinkingContent =
    thinkingBlocks.length > 0
      ? JSON.stringify(
          thinkingBlocks.map((b) =>
            b.type === "thinking"
              ? { text: (b as { type: "thinking"; thinking: string }).thinking }
              : {}
          )
        )
      : null;

  // ---- Agentic tool-use loop (max 4 iterations) ----
  const MAX_AGENT_ITERATIONS = 4;
  const allToolCalls: AgentToolInput[] = [];
  let currentResponse = response;
  let iteration = 0;

  while (iteration < MAX_AGENT_ITERATIONS && req.onToolCall) {
    const toolUseBlocks = currentResponse.content.filter(
      (b) => b.type === "tool_use"
    );
    if (toolUseBlocks.length === 0) break;

    // Execute ALL tool_use blocks in this iteration in parallel
    const toolResults = await Promise.all(
      toolUseBlocks.map(async (block) => {
        const tb = block as Anthropic.ToolUseBlock;
        allToolCalls.push({
          name: tb.name,
          input: tb.input as Record<string, unknown>,
        });
        const resultStr = await req.onToolCall!(
          tb.name,
          tb.input as Record<string, unknown>
        );
        return {
          type: "tool_result" as const,
          tool_use_id: tb.id,
          content: resultStr,
        };
      })
    );

    // Append assistant message + tool results to the running message list
    messages.push({ role: "assistant", content: currentResponse.content });
    messages.push({ role: "user", content: toolResults });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextRequest: Record<string, any> = {
      model: apiModel,
      max_tokens: maxTokens,
      messages,
      ...(systemParam !== undefined && { system: systemParam }),
      ...(tools.length > 0 && { tools }),
    };

    let nextResponse: Anthropic.Message;
    try {
      if (req.cachedSystemPrompt?.trim()) {
        nextResponse = (await client.beta.messages.create({
          ...nextRequest,
          betas: [PROMPT_CACHING_BETA],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)) as Anthropic.Message;
      } else {
        nextResponse = (await (
          client.messages.create as (p: unknown) => Promise<Anthropic.Message>
        )(nextRequest));
      }
    } catch (error) {
      throw mapAnthropicCallError(error, keySource);
    }

    await trackUsage(
      req.organizationId,
      logicalModel,
      req.feature,
      nextResponse.usage as ClaudeUsage
    );

    currentResponse = nextResponse;
    iteration++;
  }

  const finalTextBlock = currentResponse.content.find((b) => b.type === "text");
  const lastToolCall = allToolCalls.length > 0 ? allToolCalls[allToolCalls.length - 1]! : null;

  return {
    text: finalTextBlock && finalTextBlock.type === "text" ? finalTextBlock.text.trim() : "",
    thinkingContent,
    toolCall: lastToolCall,
    toolCalls: allToolCalls,
  };
}

export async function callClaudeJson<T>(
  req: ClaudeJsonRequest
): Promise<T | null> {
  const { client, keySource } = await resolveClientForOrg(req.organizationId);
  if (!client || keySource === "none") {
    console.warn("[callClaudeJson] Sin API key (org BYOK ni ANTHROPIC_API_KEY)");
    return null;
  }

  const logicalModel = resolveLogicalModel(req);
  const apiModel = resolveApiModelId(logicalModel);

  const response = await createClaudeMessage(client, keySource, {
    apiModel,
    maxTokens: req.maxTokens ?? 2048,
    system: req.system,
    cachedSystemPrompt: req.cachedSystemPrompt,
    messages: [{ role: "user", content: req.user }],
  });

  await trackUsage(
    req.organizationId,
    logicalModel,
    req.feature,
    response.usage as ClaudeUsage
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
