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
  detectAgentComplexity,
  getClientForOrg,
  isAnthropicConfigured,
} from "@/lib/ai/anthropic";
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
  AgentMessage,
  AgentWorkspaceData,
  BusinessStage,
} from "@/types/agent";

const AGENT_ERROR_REPLY =
  "No pudimos generar la respuesta. Intentá de nuevo en unos segundos.";

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
    note:
      "isAnthropicConfigured() es solo diagnóstico global; callClaudeText() resuelve BYOK vía resolveClientForOrg()",
  });

  let rawAssistant: string | null = null;
  let claudeThrew = false;

  // callClaudeText() resuelve BYOK de la org o ANTHROPIC_API_KEY global internamente;
  // no usar isAnthropicConfigured() como gate (solo chequea key global).
  try {
    rawAssistant = await callClaudeText({
      organizationId,
      task: agentTask,
      feature: "agent_chat",
      cachedSystemPrompt: orgContextText,
      system,
      messages: claudeMessages,
    });
    console.error("[Agent:Claude] callClaudeText returned", {
      organizationId,
      hasText: Boolean(rawAssistant?.trim()),
      textLength: rawAssistant?.length ?? 0,
      textPreview: rawAssistant?.slice(0, 120) ?? null,
      returnedNull: rawAssistant === null,
      returnedEmpty: rawAssistant?.trim() === "",
    });
  } catch (claudeErr) {
    claudeThrew = true;
    console.error("[Agent:Claude] callClaudeText threw", {
      organizationId,
      err: claudeErr,
      message: claudeErr instanceof Error ? claudeErr.message : String(claudeErr),
      stack: claudeErr instanceof Error ? claudeErr.stack : undefined,
    });
    rawAssistant = null;
  }

  if (!rawAssistant) {
    console.error("[Agent:Claude] sin respuesta del modelo", {
      organizationId,
      claudeThrew,
      isAnthropicConfigured: anthropicConfigured,
      orgClaudeClientAvailable,
    });
    throw new Error(AGENT_ERROR_REPLY);
  }

  const actions = parseAgentActions(rawAssistant);
  const actionResult = await executeAgentActions(
    supabase,
    organizationId,
    actions
  );
  const displayContent = cleanAgentResponse(rawAssistant);

  const { error: assistantErr } = await supabase.from("agent_messages").insert({
    conversation_id: conversationId,
    organization_id: organizationId,
    role: "assistant",
    content: displayContent,
    action_type: actionResult?.actionType ?? null,
    action_ref_id: actionResult?.actionRefId ?? null,
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
