import Anthropic from "@anthropic-ai/sdk";
import {
  getModelForTask,
  type AITask,
  type ClaudeModel,
} from "@/lib/ai/anthropic";
import { mapAnthropicCallError } from "@/lib/ai/anthropic-errors";
import { resolveCredentialForOrg } from "@/lib/ai/credential-resolver";
import { trackTokenUsage } from "@/lib/track-token-usage";
import {
  resolveAgentMaxTokens,
  resolveAgentThinkingBudget,
} from "@/lib/agent/max-tokens";
import type { AgentSseEmitter } from "@/lib/agent/sse";

const PROMPT_CACHING_BETA = "prompt-caching-2024-07-31";

const API_MODEL_ALIASES: Record<string, string> = {
  "claude-sonnet-4-6": "claude-sonnet-4-5-20250929",
};

const LEGACY_MODEL_MAP: Record<string, string> = {
  "claude-haiku-4-5": "claude-haiku-4-5-20251001",
  "claude-sonnet-4-5": "claude-sonnet-4-5-20250929",
  "claude-sonnet-4-6": "claude-sonnet-4-6",
};

type CachedSystemBlock = {
  type: "text";
  text: string;
  cache_control: { type: "ephemeral" };
};

type SystemBlock = CachedSystemBlock | { type: "text"; text: string };

function resolveLogicalModel(opts: {
  task?: AITask;
  model?: ClaudeModel | string;
}): string {
  if (opts.model) {
    if (opts.model in LEGACY_MODEL_MAP) {
      return LEGACY_MODEL_MAP[opts.model]!;
    }
    return opts.model;
  }
  if (opts.task) return getModelForTask(opts.task);
  return getModelForTask("agent_simple");
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

async function trackUsage(
  organizationId: string,
  logicalModel: string,
  feature: string,
  usage: Anthropic.Usage
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

export type StreamClaudeAgentRequest = {
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
  useCanvas?: boolean;
  thinkingBudget?: number;
  tools?: Anthropic.Tool[];
  onToolCall?: (name: string, input: Record<string, unknown>) => Promise<string>;
  emitter: AgentSseEmitter;
  signal?: AbortSignal;
};

export type StreamClaudeAgentResult = {
  text: string;
  thinkingContent: string | null;
};

const MAX_AGENT_ITERATIONS = 4;

function extractThinkingContent(message: Anthropic.Message): string | null {
  const thinkingBlocks = message.content.filter((b) => b.type === "thinking");
  if (thinkingBlocks.length === 0) return null;
  return JSON.stringify(
    thinkingBlocks.map((b) =>
      b.type === "thinking"
        ? { text: (b as { type: "thinking"; thinking: string }).thinking }
        : {}
    )
  );
}

function extractText(message: Anthropic.Message): string {
  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";
}

async function runStreamTurn(
  client: Anthropic,
  params: {
    apiModel: string;
    maxTokens: number;
    systemParam: string | SystemBlock[] | undefined;
    messages: Anthropic.MessageParam[];
    tools: Anthropic.Tool[];
    enableThinking: boolean;
    thinkingBudget: number;
    cachedSystemPrompt?: string;
    emitter: AgentSseEmitter;
    signal?: AbortSignal;
  }
): Promise<Anthropic.Message> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestBase: Record<string, any> = {
    model: params.apiModel,
    max_tokens: params.maxTokens,
    messages: params.messages,
    ...(params.systemParam !== undefined && { system: params.systemParam }),
    ...(params.tools.length > 0 && { tools: params.tools }),
    ...(params.enableThinking && {
      thinking: { type: "enabled", budget_tokens: params.thinkingBudget },
    }),
  };

  if (params.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const stream = params.cachedSystemPrompt?.trim()
    ? client.beta.messages.stream({
        ...requestBase,
        betas: [PROMPT_CACHING_BETA],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    : client.messages.stream(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestBase as any
      );

  stream.on("text", (textDelta) => {
    if (textDelta) {
      params.emitter.emit("delta", { type: "text", content: textDelta });
    }
  });

  if (params.signal) {
    const onAbort = () => stream.abort();
    params.signal.addEventListener("abort", onAbort, { once: true });
    try {
      return await stream.finalMessage();
    } finally {
      params.signal.removeEventListener("abort", onAbort);
    }
  }

  return stream.finalMessage();
}

export async function streamClaudeAgent(
  req: StreamClaudeAgentRequest
): Promise<StreamClaudeAgentResult | null> {
  const logicalModel = resolveLogicalModel(req);
  const apiModel = resolveApiModelId(logicalModel);
  const maxTokens =
    req.maxTokens ??
    resolveAgentMaxTokens({
      enableThinking: req.enableThinking,
      useCanvas: req.useCanvas,
    });
  const thinkingBudget =
    req.thinkingBudget ?? resolveAgentThinkingBudget(req.enableThinking);

  const resolution = await resolveCredentialForOrg(req.organizationId);
  if (!resolution.client || resolution.source === "none") {
    console.warn("[streamClaudeAgent] Sin credencial (org ni ANTHROPIC_API_KEY global)");
    return null;
  }

  const keySource = resolution.source === "api_key" ? "api_key" : "global";

  try {
    const client = resolution.client;
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

    let currentResponse = await runStreamTurn(client, {
      apiModel,
      maxTokens,
      systemParam,
      messages,
      tools,
      enableThinking: Boolean(req.enableThinking),
      thinkingBudget,
      cachedSystemPrompt: req.cachedSystemPrompt,
      emitter: req.emitter,
      signal: req.signal,
    });

    await trackUsage(
      req.organizationId,
      logicalModel,
      req.feature,
      currentResponse.usage
    );

    const thinkingContent = extractThinkingContent(currentResponse);
    let iteration = 0;

    while (iteration < MAX_AGENT_ITERATIONS && req.onToolCall) {
      const toolUseBlocks = currentResponse.content.filter(
        (b) => b.type === "tool_use"
      );
      if (toolUseBlocks.length === 0) break;

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of toolUseBlocks) {
        const tb = block as Anthropic.ToolUseBlock;
        req.emitter.emit("tool_start", {
          type: "tool_start",
          toolName: tb.name,
        });

        const resultStr = await req.onToolCall(
          tb.name,
          tb.input as Record<string, unknown>
        );

        req.emitter.emit("tool_end", {
          type: "tool_end",
          toolName: tb.name,
          result: resultStr.slice(0, 200),
        });

        toolResults.push({
          type: "tool_result",
          tool_use_id: tb.id,
          content: resultStr,
        });
      }

      messages.push({ role: "assistant", content: currentResponse.content });
      messages.push({ role: "user", content: toolResults });

      currentResponse = await runStreamTurn(client, {
        apiModel,
        maxTokens,
        systemParam,
        messages,
        tools,
        enableThinking: false,
        thinkingBudget,
        cachedSystemPrompt: undefined,
        emitter: req.emitter,
        signal: req.signal,
      });

      await trackUsage(
        req.organizationId,
        logicalModel,
        req.feature,
        currentResponse.usage
      );

      if (currentResponse.stop_reason === "max_tokens") {
        console.warn("[streamClaudeAgent] Respuesta truncada (max_tokens)", {
          iteration,
          maxTokens,
        });
      }

      iteration++;
    }

    if (currentResponse.stop_reason === "max_tokens") {
      console.warn("[streamClaudeAgent] Respuesta truncada por max_tokens", {
        maxTokens,
        enableThinking: req.enableThinking,
      });
    }

    return {
      text: extractText(currentResponse),
      thinkingContent,
    };
  } catch (error) {
    throw mapAnthropicCallError(error, keySource);
  }
}
