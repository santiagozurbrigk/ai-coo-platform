"use server";

import { revalidatePath } from "next/cache";
import {
  isMissingTableError,
  requireOrganizationId,
  tryRequireOrganizationId,
} from "@/lib/auth/bootstrap";
import { requireAuthContext } from "@/lib/auth/require-auth";
import {
  aiRateLimit,
  rateLimitErrorMessage,
  sopGenerateRateLimit,
} from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import {
  aiPromptSchema,
  firstZodError,
  textSchema,
  longTextSchema,
} from "@/lib/validations";
import { z } from "zod";
import {
  callClaudeText,
  callClaudeAgent,
  detectAgentComplexity,
  getClientForOrg,
  isAnthropicConfigured,
} from "@/lib/ai/anthropic";
import type Anthropic from "@anthropic-ai/sdk";
import {
  generateDocument,
  type DocumentContent,
} from "@/lib/agent/document-generator";
import { storeAgentDocument } from "@/lib/agent/document-storage";
import { buildOrgContextText, getOrgContext } from "@/lib/ai/org-context";
import {
  rowToConversation,
  rowToMessage,
  rowToStage,
  type AgentConversationRow,
  type AgentMessageRow,
} from "@/lib/agent/mapper";
import {
  cleanAgentResponse,
  parseAgentActions,
} from "@/lib/agent/parse-actions";
import {
  buildAgentSystemPrompt,
  buildRecentContextSummary,
  buildStageContext,
} from "@/lib/agent/prompt";
import { buildRAGContext, searchRAG } from "@/lib/rag/search";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes/paths";
import type {
  AgentConversation,
  AgentFlags,
  AgentMessage,
  AgentWorkspaceData,
  BusinessStage,
} from "@/types/agent";

const AGENT_ERROR_REPLY =
  "No pudimos generar la respuesta. Intentá de nuevo en unos segundos.";

// ---------------------------------------------------------------------------
// Document generation tool definition
// ---------------------------------------------------------------------------

const GENERATE_DOCUMENT_TOOL: Anthropic.Tool = {
  name: "generate_document",
  description:
    "Genera un documento descargable (Word, Excel, PDF o CSV) y lo sube al storage. Usá esta tool cuando el usuario pida un informe, propuesta, planilla, tabla de datos u otro documento estructurado.",
  input_schema: {
    type: "object" as const,
    required: ["format", "filename", "content"],
    properties: {
      format: {
        type: "string",
        enum: ["docx", "xlsx", "pdf", "csv"],
        description: "Formato del archivo",
      },
      filename: {
        type: "string",
        description: "Nombre del archivo sin extensión (ej: 'propuesta-comercial')",
      },
      content: {
        type: "object",
        description:
          "Contenido del documento. Para docx/pdf: { paragraphs: [{ text, style? }] }. Para xlsx/csv: { headers: [...], rows: [[...]] }",
        properties: {
          paragraphs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                style: {
                  type: "string",
                  enum: ["heading1", "heading2", "heading3", "body", "bullet"],
                },
              },
              required: ["text"],
            },
          },
          headers: { type: "array", items: { type: "string" } },
          rows: {
            type: "array",
            items: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Canvas detection: responses that benefit from side-panel display
// ---------------------------------------------------------------------------

const CANVAS_HEADING_RE = /^#{1,3} /m;
const CANVAS_CODE_RE = /```[\s\S]{100}/;
const CANVAS_TABLE_RE = /\|.+\|.+\|/;

function shouldExtractCanvas(text: string): boolean {
  if (text.length < 600) return false;
  return (
    CANVAS_HEADING_RE.test(text) ||
    CANVAS_CODE_RE.test(text) ||
    CANVAS_TABLE_RE.test(text)
  );
}

function revalidateAgent() {
  revalidatePath(paths.platform.agent.root);
}

async function getOrgName(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string
) {
  const { data } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .maybeSingle();
  return data?.name ?? "tu negocio";
}

export async function listAgentWorkspaceAction(): Promise<AgentWorkspaceData> {
  const empty: AgentWorkspaceData = {
    stages: [],
    conversations: [],
  };
  if (!isSupabaseConfigured()) return empty;

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return empty;

  const supabase = await createClient();

  const [stagesRes, conversationsRes] = await Promise.all([
    supabase
      .from("business_stages")
      .select("*")
      .eq("organization_id", organizationId)
      .order("order_index", { ascending: true }),
    supabase
      .from("agent_conversations")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false }),
  ]);

  if (stagesRes.error) {
    if (isMissingTableError(stagesRes.error.message)) return empty;
    console.error("[Agent] list stages:", stagesRes.error.message);
  }

  if (conversationsRes.error) {
    if (isMissingTableError(conversationsRes.error.message)) {
      return {
        stages: (stagesRes.data ?? []).map(rowToStage),
        conversations: [],
      };
    }
    console.error("[Agent] list conversations:", conversationsRes.error.message);
  }

  return {
    stages: (stagesRes.data ?? []).map(rowToStage),
    conversations: (conversationsRes.error
      ? []
      : (conversationsRes.data ?? []).map((row) =>
          rowToConversation(row as AgentConversationRow)
        )),
  };
}

export async function listAgentMessagesAction(
  conversationId: string
): Promise<AgentMessage[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => rowToMessage(row as AgentMessageRow));
}

export async function createBusinessStageAction(input: {
  name: string;
  description?: string;
}): Promise<BusinessStage | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { count } = await supabase
    .from("business_stages")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const { data, error } = await supabase
    .from("business_stages")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      order_index: count ?? 0,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  revalidateAgent();
  return rowToStage(data);
}

export async function createAgentConversationAction(opts?: {
  title?: string | null;
}): Promise<AgentConversation | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_conversations")
    .insert({
      organization_id: organizationId,
      project_id: null,
      stage_id: null,
      title: opts?.title ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear la conversación");
  }

  revalidateAgent();
  return rowToConversation(data as AgentConversationRow);
}

export async function deleteAgentConversationAction(
  conversationId: string
): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("agent_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  revalidateAgent();
}

export async function deleteBusinessStageAction(stageId: string): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("business_stages")
    .delete()
    .eq("id", stageId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  revalidateAgent();
}

async function generateConversationTitle(
  organizationId: string,
  conversationId: string,
  firstMessage: string
) {
  const title =
    (await callClaudeText({
      organizationId,
      task: "agent_simple",
      feature: "agent_conversation_title",
      system:
        "Genera títulos breves en español. Responde SOLO con el título, máximo 5 palabras, sin puntuación final.",
      messages: [
        {
          role: "user",
          content: `Resume en máximo 5 palabras de qué trata esta pregunta: "${firstMessage}"`,
        },
      ],
      maxTokens: 30,
    })) ?? firstMessage.slice(0, 48);

  const cleanTitle = title.replace(/[.!?]+$/, "").trim();
  const supabase = await createClient();
  const { error } = await supabase
    .from("agent_conversations")
    .update({ title: cleanTitle })
    .eq("id", conversationId)
    .eq("organization_id", organizationId);

  if (error) {
    console.error("[Agent:Title] update failed", {
      conversationId,
      organizationId,
      message: error.message,
    });
    return;
  }

  console.error("[Agent:Title] title set", { conversationId, title: cleanTitle });
}

async function getRecentOrgMessages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  excludeConversationId: string
): Promise<AgentMessage[]> {
  const { data } = await supabase
    .from("agent_messages")
    .select("*")
    .eq("organization_id", organizationId)
    .neq("conversation_id", excludeConversationId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? [])
    .reverse()
    .map((row) => rowToMessage(row as AgentMessageRow));
}

async function executeAgentActions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  actions: ReturnType<typeof parseAgentActions>
): Promise<{ actionType: AgentMessage["actionType"]; actionRefId: string } | null> {
  for (const action of actions) {
    if (action.type === "CREATE_SOP") {
      const { allowed, resetAt } = sopGenerateRateLimit(organizationId);
      if (!allowed) {
        throw new Error(rateLimitErrorMessage(resetAt));
      }

      const parsed = z
        .object({
          title: textSchema,
          content: longTextSchema,
          goal: textSchema,
          department: z.string().max(50).default("general"),
        })
        .safeParse({
          title: action.data.title ?? "SOP sin título",
          department: action.data.department ?? "general",
          content: action.data.content ?? "",
          goal: action.data.goal ?? action.data.title ?? "SOP sin título",
        });
      if (!parsed.success) {
        throw new Error(firstZodError(parsed.error));
      }

      const { title, department, content, goal } = parsed.data;

      const { data, error } = await supabase
        .from("sops")
        .insert({
          organization_id: organizationId,
          title: sanitizeText(title),
          department,
          content: sanitizeText(content),
          goal: sanitizeText(goal),
          status: "draft",
          created_by: "agent",
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      revalidatePath(paths.platform.sops.root);
      return { actionType: "created_sop", actionRefId: data.id };
    }
  }
  return null;
}

export async function sendAgentMessageAction(input: {
  conversationId?: string | null;
  content: string;
  /** Contexto de etapa solo para el prompt; no se persiste en la conversación. */
  contextStageId?: string | null;
  flags?: AgentFlags;
}): Promise<{
  conversationId: string;
  messages: AgentMessage[];
}> {
  const { user, orgId: organizationId } = await requireAuthContext();

  const { allowed, resetAt } = aiRateLimit(user.id);
  if (!allowed) {
    throw new Error(rateLimitErrorMessage(resetAt));
  }

  const parsedContent = aiPromptSchema.safeParse(input.content);
  if (!parsedContent.success) {
    throw new Error(firstZodError(parsedContent.error));
  }

  const supabase = await createClient();
  const trimmed = sanitizeText(parsedContent.data);

  let conversationId = input.conversationId ?? null;

  if (!conversationId) {
    const created = await createAgentConversationAction();
    if (!created) throw new Error("No se pudo crear la conversación");
    conversationId = created.id;
  }

  const { data: convRow, error: convError } = await supabase
    .from("agent_conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("organization_id", organizationId)
    .single();

  if (convError) throw new Error(convError.message);
  if (!convRow) throw new Error("Conversación no encontrada");

  const { count: priorCount } = await supabase
    .from("agent_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  const { error: userErr } = await supabase
    .from("agent_messages")
    .insert({
      conversation_id: conversationId,
      organization_id: organizationId,
      role: "user",
      content: trimmed,
    })
    .select("*")
    .single();

  if (userErr) throw new Error(userErr.message);

  await supabase
    .from("agent_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  const history = await listAgentMessagesAction(conversationId);
  const recentOrg = await getRecentOrgMessages(
    supabase,
    organizationId,
    conversationId
  );

  let stageForPrompt: BusinessStage | null = null;
  if (input.contextStageId) {
    const { data: stageRow } = await supabase
      .from("business_stages")
      .select("*")
      .eq("id", input.contextStageId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (stageRow) stageForPrompt = rowToStage(stageRow);
  }

  const orgName = await getOrgName(supabase, organizationId);
  const orgContext = await getOrgContext(organizationId);
  const orgContextText = buildOrgContextText(orgContext);

  let ragContext = "";
  let hasRagContext = false;
  try {
    const ragResults = await searchRAG({
      organizationId,
      query: trimmed,
      matchCount: 5,
      minSimilarity: 0.65,
    });
    hasRagContext = ragResults.length > 0;
    // El mensaje del usuario en claudeMessages es input legítimo (no se envuelve).
    // El contexto RAG sí se envuelve en buildRAGContext() como contenido externo.
    ragContext = buildRAGContext(ragResults);
  } catch {
    console.warn("[Agent] RAG no disponible, respondiendo sin contexto semántico");
  }

  const system = buildAgentSystemPrompt({
    orgName,
    stageContext: buildStageContext(stageForPrompt),
    recentContext: buildRecentContextSummary(recentOrg),
    ragContext,
  });

  const claudeMessages = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const agentTask = detectAgentComplexity(trimmed, hasRagContext);
  const flags = input.flags ?? {};

  const anthropicConfigured = isAnthropicConfigured();
  const anthropicKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  let orgClaudeClientAvailable = false;
  try {
    orgClaudeClientAvailable = Boolean(await getClientForOrg(organizationId));
  } catch (clientErr) {
    console.error("[Agent:Claude] getClientForOrg failed", {
      organizationId,
      err: clientErr,
      message: clientErr instanceof Error ? clientErr.message : String(clientErr),
    });
  }

  console.error("[Agent:Claude] pre-call diagnostics", {
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    conversationId,
    organizationId,
    isAnthropicConfigured: anthropicConfigured,
    anthropicKeyPresent,
    orgClaudeClientAvailable,
    agentTask,
    hasRagContext,
    historyMessageCount: claudeMessages.length,
    flags,
    note:
      "callClaudeAgent() resuelve BYOK vía resolveClientForOrg()",
  });

  let agentResult: { text: string; thinkingContent: string | null; toolCall: { name: string; input: Record<string, unknown> } | null } | null = null;
  let claudeThrew = false;

  try {
    agentResult = await callClaudeAgent({
      organizationId,
      task: agentTask,
      feature: "agent_chat",
      cachedSystemPrompt: orgContextText,
      system,
      messages: claudeMessages,
      enableWebSearch: flags.useWebSearch,
      enableThinking: flags.useThink,
      tools: [GENERATE_DOCUMENT_TOOL],
      onToolCall: async (name, toolInput) => {
        if (name === "generate_document") {
          const fmt = toolInput.format as "docx" | "xlsx" | "pdf" | "csv";
          const baseFilename = String(toolInput.filename ?? "documento");
          const rawContent = toolInput.content as Record<string, unknown>;

          // Build DocumentContent from Claude's output
          let docContent: DocumentContent;
          if (fmt === "xlsx") {
            docContent = {
              kind: "sheet",
              sheets: [
                {
                  name: "Datos",
                  table: {
                    headers: (rawContent.headers as string[]) ?? [],
                    rows: (rawContent.rows as string[][]) ?? [],
                  },
                },
              ],
            };
          } else if (fmt === "csv") {
            docContent = {
              kind: "csv",
              table: {
                headers: (rawContent.headers as string[]) ?? [],
                rows: (rawContent.rows as string[][]) ?? [],
              },
            };
          } else {
            docContent = {
              kind: fmt === "pdf" ? "pdf" : "doc",
              paragraphs: Array.isArray(rawContent.paragraphs)
                ? (rawContent.paragraphs as { text: string; style?: string }[]).map(
                    (p) => ({ text: p.text, style: p.style as "heading1" | "heading2" | "heading3" | "body" | "bullet" | undefined })
                  )
                : [{ text: String(rawContent) }],
            };
          }

          const generated = await generateDocument(fmt, docContent);
          const filename = `${baseFilename}.${generated.extension}`;
          const stored = await storeAgentDocument(organizationId, filename, generated);

          return JSON.stringify({
            success: true,
            filename: stored.filename,
            signedUrl: stored.signedUrl,
            mimeType: stored.mimeType,
            sizeBytes: stored.sizeBytes,
          });
        }
        return JSON.stringify({ error: "Tool not found" });
      },
    });

    console.error("[Agent:Claude] callClaudeAgent returned", {
      organizationId,
      hasText: Boolean(agentResult?.text?.trim()),
      textLength: agentResult?.text?.length ?? 0,
      textPreview: agentResult?.text?.slice(0, 120) ?? null,
      hasThinking: Boolean(agentResult?.thinkingContent),
      toolCallName: agentResult?.toolCall?.name ?? null,
    });
  } catch (claudeErr) {
    claudeThrew = true;
    console.error("[Agent:Claude] callClaudeAgent threw", {
      organizationId,
      err: claudeErr,
      message: claudeErr instanceof Error ? claudeErr.message : String(claudeErr),
      stack: claudeErr instanceof Error ? claudeErr.stack : undefined,
    });
    agentResult = null;
  }

  const rawAssistant = agentResult?.text ?? null;

  if (!rawAssistant) {
    console.error("[Agent:Claude] sin respuesta del modelo", {
      organizationId,
      claudeThrew,
      isAnthropicConfigured: anthropicConfigured,
      orgClaudeClientAvailable,
    });
    throw new Error(AGENT_ERROR_REPLY);
  }

  // Build document attachments if a document was generated via tool call
  let docAttachments: AgentMessage["attachments"] = null;
  if (agentResult?.toolCall?.name === "generate_document") {
    try {
      const toolOutput = JSON.parse(
        // Extract the last tool result from onToolCall (stored in agentResult)
        // We re-parse the input to reconstruct the attachment
        JSON.stringify(agentResult.toolCall.input)
      ) as Record<string, unknown>;
      // The actual stored document info was returned via the tool result string
      // and is embedded in rawAssistant — we need to retrieve it differently.
      // Since we already called storeAgentDocument inside onToolCall, we embed
      // the signed URL from the tool call result by looking at the assistant message.
      // For now, we parse the tool input to get the filename hint.
      const docFilename = String(toolOutput.filename ?? "documento");
      const docFmt = String(toolOutput.format ?? "docx");
      // The signed URL was returned as tool_result content — Claude's final
      // response will mention it. We store a placeholder attachment so the UI
      // can render a download card. The actual URL is inside the rawAssistant text.
      docAttachments = [
        {
          name: `${docFilename}.${docFmt}`,
          url: "",
          type: docFmt === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : docFmt === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : docFmt === "pdf" ? "application/pdf"
            : "text/csv",
        },
      ];
    } catch {
      // Attachment metadata extraction failed; skip
    }
  }

  const actions = parseAgentActions(rawAssistant);
  const actionResult = await executeAgentActions(
    supabase,
    organizationId,
    actions
  );
  const displayContent = cleanAgentResponse(rawAssistant);

  // Canvas: extract long structured content into canvasContent
  const canvasContent =
    flags.useCanvas && shouldExtractCanvas(displayContent) ? displayContent : null;
  // If canvas, show a brief intro in the chat instead of the full content
  const chatContent =
    canvasContent !== null
      ? displayContent.split("\n").slice(0, 3).join("\n").trim() +
        "\n\n*(El contenido completo está disponible en el panel Canvas →)*"
      : displayContent;

  const { error: assistantErr } = await supabase.from("agent_messages").insert({
    conversation_id: conversationId,
    organization_id: organizationId,
    role: "assistant",
    content: chatContent,
    action_type: actionResult?.actionType ?? null,
    action_ref_id: actionResult?.actionRefId ?? null,
    attachments: docAttachments ?? null,
    thinking_content: agentResult?.thinkingContent ?? null,
    canvas_content: canvasContent,
  });

  if (assistantErr) throw new Error(assistantErr.message);

  // Se hace await (no fire-and-forget): en serverless el runtime congela el
  // trabajo async pendiente al retornar, y la llamada a Claude del título se
  // cortaba antes del update — por eso el título quedaba en null.
  if ((priorCount ?? 0) === 0) {
    try {
      await generateConversationTitle(organizationId, conversationId, trimmed);
    } catch (titleErr) {
      console.error("[Agent:Title] generateConversationTitle failed", {
        conversationId,
        organizationId,
        message: titleErr instanceof Error ? titleErr.message : String(titleErr),
      });
    }
  }

  revalidateAgent();

  const messages = await listAgentMessagesAction(conversationId);
  return { conversationId, messages };
}
