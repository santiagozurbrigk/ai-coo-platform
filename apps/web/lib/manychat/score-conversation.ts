import { callClaudeJson } from "@/lib/ai/anthropic";
import { buildOrgContextText, getOrgContext } from "@/lib/ai/org-context";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ConversationFunnelStage,
  ConversationTagId,
  ObjectionCategory,
} from "@/types/sales";
import {
  buildConversationScoringPrompt,
  VALID_CONVERSATION_TAGS,
  VALID_FUNNEL_STAGES,
  type ClosingCallHint,
  type ConversationScoringMessage,
  type CrossChannelContext,
} from "./conversation-scoring-prompt";

export type ConversationScoringResult = {
  overall_score: number;
  engagement_score: number;
  intent_score: number;
  qualification_score: number;
  label: "hot" | "warm" | "cold" | "unqualified";
  summary: string;
  lead_tag?: string;
  pain_point?: string;
  funnel_stage?: string;
  link_shared?: boolean;
  whatsapp_number_shared?: boolean;
  booking_link_shared?: boolean;
  cross_channel_summary?: string | null;
  booking_signals?: string[];
  ghosting_signals?: string[];
  detected_objections?: Array<{ text: string; category: string }>;
  recommended_action?: string;
};

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function normalizeLabel(
  value: unknown
): ConversationScoringResult["label"] {
  const label = String(value ?? "").toLowerCase();
  if (
    label === "hot" ||
    label === "warm" ||
    label === "cold" ||
    label === "unqualified"
  ) {
    return label;
  }
  return "cold";
}

function normalizeTag(value: unknown): ConversationTagId | null {
  const tag = String(value ?? "").trim() as ConversationTagId;
  return VALID_CONVERSATION_TAGS.has(tag) ? tag : null;
}

function normalizeFunnelStage(value: unknown): ConversationFunnelStage | null {
  const stage = String(value ?? "").trim() as ConversationFunnelStage;
  return VALID_FUNNEL_STAGES.has(stage) ? stage : null;
}

function normalizeBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

function normalizeObjections(
  raw: ConversationScoringResult["detected_objections"]
): Array<{ text: string; category: ObjectionCategory }> {
  if (!Array.isArray(raw)) return [];
  const categories = new Set<ObjectionCategory>([
    "closing",
    "setting",
    "marketing",
  ]);
  return raw
    .filter((o) => o && typeof o.text === "string" && o.text.trim())
    .map((o) => ({
      text: o.text.trim(),
      category: categories.has(o.category as ObjectionCategory)
        ? (o.category as ObjectionCategory)
        : "setting",
    }));
}

function funnelStageFromClosingCall(
  status: ClosingCallHint["status"]
): ConversationFunnelStage | null {
  switch (status) {
    case "scheduled":
      return "agendado";
    case "no_show":
      return "no_show";
    case "closed":
      return "cerrado";
    default:
      return null;
  }
}

async function fetchFormAnswersForLead(
  organizationId: string,
  leadName?: string
): Promise<Record<string, string> | undefined> {
  if (!leadName?.trim()) return undefined;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("closing_calls")
    .select("form_answers, lead_name")
    .eq("organization_id", organizationId)
    .ilike("lead_name", leadName.trim())
    .order("scheduled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const answers = data?.form_answers as
    | Array<{ question?: string; answer?: string }>
    | null
    | undefined;
  if (!answers?.length) return undefined;

  const record: Record<string, string> = {};
  for (const item of answers) {
    const q = item.question?.trim();
    const a = item.answer?.trim();
    if (q && a) record[q] = a;
  }
  return Object.keys(record).length > 0 ? record : undefined;
}

async function fetchClosingCallHint(
  organizationId: string,
  leadName?: string
): Promise<ClosingCallHint | undefined> {
  if (!leadName?.trim()) return undefined;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("closing_calls")
    .select("status, scheduled_at")
    .eq("organization_id", organizationId)
    .ilike("lead_name", leadName.trim())
    .order("scheduled_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.status || !data.scheduled_at) return undefined;

  const status = data.status as ClosingCallHint["status"];
  if (
    status !== "scheduled" &&
    status !== "closed" &&
    status !== "not_closed" &&
    status !== "no_show"
  ) {
    return undefined;
  }

  return {
    status,
    scheduledAt: data.scheduled_at as string,
  };
}

type SisterInstagramRow = {
  messages: Array<{ sender?: string; content?: string }> | null;
  ai_summary: string | null;
  ai_link_shared: boolean | null;
  ai_whatsapp_number_shared: boolean | null;
};

async function fetchCrossChannelInstagramContext(
  organizationId: string,
  leadName?: string
): Promise<CrossChannelContext | undefined> {
  if (!leadName?.trim()) return undefined;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("conversations")
    .select(
      "messages, ai_summary, ai_link_shared, ai_whatsapp_number_shared"
    )
    .eq("organization_id", organizationId)
    .eq("source", "instagram")
    .ilike("lead_name", leadName.trim())
    .or("ai_link_shared.eq.true,ai_whatsapp_number_shared.eq.true")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = data as SisterInstagramRow | null;
  if (!row) return undefined;

  const messages = row.messages ?? [];
  const messagesText = messages
    .slice(-15)
    .map((m) => {
      const role = m.sender === "team" ? "SETTER" : "LEAD";
      return `[${role}]: ${m.content ?? ""}`;
    })
    .join("\n");

  if (!messagesText.trim() && !row.ai_summary?.trim()) return undefined;

  return {
    source: "instagram",
    summary: row.ai_summary?.trim() || undefined,
    messagesText: messagesText || row.ai_summary?.trim() || "",
  };
}

export async function scoreConversation({
  organizationId,
  conversationId,
  messages,
  leadName,
  formAnswers,
  source,
}: {
  organizationId: string;
  conversationId: string;
  messages: ConversationScoringMessage[];
  leadName?: string;
  formAnswers?: Record<string, string>;
  source?: string;
}): Promise<boolean> {
  if (!messages?.length) return false;

  const supabase = createAdminClient();

  try {
    const [
      { data: org },
      resolvedFormAnswers,
      closingCallHint,
      crossChannelContext,
    ] = await Promise.all([
      supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .maybeSingle(),
      formAnswers
        ? Promise.resolve(formAnswers)
        : fetchFormAnswersForLead(organizationId, leadName),
      fetchClosingCallHint(organizationId, leadName),
      source === "whatsapp"
        ? fetchCrossChannelInstagramContext(organizationId, leadName)
        : Promise.resolve(undefined),
    ]);

    const { system, user } = buildConversationScoringPrompt(
      messages,
      {
        name: leadName,
        formAnswers: resolvedFormAnswers,
        closingCall: closingCallHint,
        crossChannel: crossChannelContext,
      },
      { businessType: "infoproducto", productName: org?.name ?? undefined }
    );

    const orgContext = await getOrgContext(organizationId);
    const orgContextText = buildOrgContextText(orgContext);

    const raw = await callClaudeJson<ConversationScoringResult>({
      organizationId,
      task: "conversation_scoring",
      feature: "conversation_scoring",
      cachedSystemPrompt: orgContextText,
      system,
      user,
      maxTokens: 1500,
    });

    if (!raw) {
      console.warn(
        `[ConversationScoring] Sin respuesta IA para conversación ${conversationId}`
      );
      return false;
    }

    const closingOverride = closingCallHint
      ? funnelStageFromClosingCall(closingCallHint.status)
      : null;

    const aiTag = normalizeTag(raw.lead_tag);
    const aiFunnelStage =
      closingOverride ?? normalizeFunnelStage(raw.funnel_stage);

    const crossChannelSummary =
      crossChannelContext && raw.cross_channel_summary?.trim()
        ? raw.cross_channel_summary.trim()
        : crossChannelContext?.summary ?? null;

    const analysis: ConversationScoringResult = {
      overall_score: clampScore(raw.overall_score),
      engagement_score: clampScore(raw.engagement_score),
      intent_score: clampScore(raw.intent_score),
      qualification_score: clampScore(raw.qualification_score),
      label: normalizeLabel(raw.label),
      summary: String(raw.summary ?? "").trim(),
      lead_tag: aiTag ?? undefined,
      pain_point: String(raw.pain_point ?? "").trim(),
      funnel_stage: aiFunnelStage ?? undefined,
      link_shared: normalizeBoolean(raw.link_shared),
      whatsapp_number_shared: normalizeBoolean(raw.whatsapp_number_shared),
      booking_link_shared: normalizeBoolean(raw.booking_link_shared),
      cross_channel_summary: crossChannelSummary,
      booking_signals: Array.isArray(raw.booking_signals)
        ? raw.booking_signals.map(String)
        : [],
      ghosting_signals: Array.isArray(raw.ghosting_signals)
        ? raw.ghosting_signals.map(String)
        : [],
      detected_objections: normalizeObjections(raw.detected_objections),
      recommended_action: String(raw.recommended_action ?? "").trim(),
    };

    const updatePayload: Record<string, unknown> = {
      ai_score: analysis.overall_score,
      ai_engagement_score: analysis.engagement_score,
      ai_intent_score: analysis.intent_score,
      ai_qualification_score: analysis.qualification_score,
      ai_label: analysis.label,
      ai_summary: analysis.summary || null,
      ai_pain_point: analysis.pain_point || null,
      ai_funnel_stage: aiFunnelStage,
      ai_link_shared: analysis.link_shared,
      ai_whatsapp_number_shared: analysis.whatsapp_number_shared,
      ai_booking_link_shared: analysis.booking_link_shared,
      ai_cross_channel_source: crossChannelContext ? "instagram" : null,
      ai_cross_channel_summary: crossChannelSummary,
      ai_booking_signals: analysis.booking_signals ?? [],
      ai_ghosting_signals: analysis.ghosting_signals ?? [],
      ai_detected_objections: analysis.detected_objections ?? [],
      ai_recommended_action: analysis.recommended_action || null,
      last_analyzed_at: new Date().toISOString(),
    };
    if (aiTag) {
      updatePayload.ai_tag = aiTag;
      updatePayload.tag = aiTag;
    }

    const { error } = await supabase
      .from("conversations")
      .update(updatePayload)
      .eq("id", conversationId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    console.log(
      `[ConversationScoring] ✅ Scored conversation ${conversationId}: ${analysis.label} (${analysis.overall_score})`
    );
    return true;
  } catch (err) {
    console.error(
      `[ConversationScoring] ❌ Error scoring conversation ${conversationId}:`,
      err
    );
    return false;
  }
}
