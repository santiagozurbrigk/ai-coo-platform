import type {
  Conversation,
  ConversationAiLabel,
  ConversationAnalysis,
  ConversationTagId,
  LeadQualificationScore,
  ObjectionCategory,
  SalesMessage,
} from "@/types/sales";
import type { ConversationStatus } from "@ai-coo/types";
import { getQualificationTier } from "@/lib/sales/qualification-score";

export type ConversationRow = {
  id: string;
  organization_id: string;
  lead_name: string;
  status: ConversationStatus;
  tag: ConversationTagId | null;
  last_message: string;
  last_message_at: string;
  unread: boolean;
  messages: SalesMessage[];
  analysis: ConversationAnalysis;
  external_ref: string | null;
  source?: "manychat" | "instagram" | "manual" | "whatsapp" | null;
  ai_score?: number | null;
  ai_engagement_score?: number | null;
  ai_intent_score?: number | null;
  ai_qualification_score?: number | null;
  ai_label?: ConversationAiLabel | null;
  ai_summary?: string | null;
  ai_detected_objections?: Array<{ text: string; category: string }> | null;
  ai_booking_signals?: string[] | null;
  ai_ghosting_signals?: string[] | null;
  ai_recommended_action?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_link_id?: string | null;
  source_video_title?: string | null;
  last_analyzed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

function labelToTier(label: ConversationAiLabel | null | undefined) {
  if (label === "hot") return "high" as const;
  if (label === "warm") return "medium" as const;
  return "low" as const;
}

function ghostingRiskFromAi(
  label: ConversationAiLabel | null | undefined,
  signals: string[]
): ConversationAnalysis["ghostingRisk"] {
  if (label === "cold" || label === "unqualified" || signals.length >= 2) {
    return "high";
  }
  if (label === "warm" || signals.length >= 1) return "medium";
  return "low";
}

function buildQualificationScore(row: ConversationRow): LeadQualificationScore | undefined {
  if (row.ai_score == null) return undefined;

  const overall = row.ai_score;
  return {
    overall,
    tier: row.ai_label ? labelToTier(row.ai_label) : getQualificationTier(overall),
    engagement: row.ai_engagement_score ?? overall,
    intent: row.ai_intent_score ?? overall,
    qualification: row.ai_qualification_score ?? overall,
  };
}

function buildAnalysisFromRow(row: ConversationRow): ConversationAnalysis {
  const base = row.analysis ?? {
    responseTimeMinutes: 0,
    ghostingRisk: "medium" as const,
    bookingSignal: false,
    insights: [],
  };

  const bookingSignals = row.ai_booking_signals ?? [];
  const ghostingSignals = row.ai_ghosting_signals ?? [];
  const qualificationScore = buildQualificationScore(row);

  if (!qualificationScore && row.ai_score == null) {
    return base;
  }

  const insights: string[] = [];
  if (row.ai_summary?.trim()) insights.push(row.ai_summary.trim());
  if (row.ai_recommended_action?.trim()) {
    insights.push(`Acción recomendada: ${row.ai_recommended_action.trim()}`);
  }
  for (const signal of bookingSignals) {
    insights.push(`Señal positiva: ${signal}`);
  }
  for (const signal of ghostingSignals) {
    insights.push(`Riesgo: ${signal}`);
  }
  if (insights.length === 0 && base.insights.length > 0) {
    insights.push(...base.insights);
  }

  return {
    ...base,
    qualificationScore,
    bookingSignal: bookingSignals.length > 0 || base.bookingSignal,
    ghostingRisk: ghostingRiskFromAi(row.ai_label, ghostingSignals),
    insights: insights.length > 0 ? insights : base.insights,
  };
}

function normalizeObjections(
  raw: ConversationRow["ai_detected_objections"]
): Array<{ text: string; category: ObjectionCategory }> | undefined {
  if (!raw?.length) return undefined;
  const categories = new Set<ObjectionCategory>([
    "closing",
    "setting",
    "marketing",
  ]);
  return raw
    .filter((o) => o?.text?.trim())
    .map((o) => ({
      text: o.text.trim(),
      category: categories.has(o.category as ObjectionCategory)
        ? (o.category as ObjectionCategory)
        : "setting",
    }));
}

export function rowToConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    leadName: row.lead_name,
    status: row.status,
    tag: row.tag ?? undefined,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    unread: row.unread,
    messages: row.messages ?? [],
    analysis: buildAnalysisFromRow(row),
    aiScore: row.ai_score ?? undefined,
    aiLabel: row.ai_label ?? undefined,
    aiSummary: row.ai_summary ?? undefined,
    aiBookingSignals: row.ai_booking_signals ?? undefined,
    aiGhostingSignals: row.ai_ghosting_signals ?? undefined,
    aiDetectedObjections: normalizeObjections(row.ai_detected_objections),
    aiRecommendedAction: row.ai_recommended_action ?? undefined,
    sourceVideoTitle: row.source_video_title ?? undefined,
    utmCampaign: row.utm_campaign ?? undefined,
    lastAnalyzedAt: row.last_analyzed_at ?? undefined,
    source: row.source ?? "manychat",
  };
}

export function conversationToInsertRow(
  conv: Omit<Conversation, "id">,
  organizationId: string,
  externalRef?: string
): Omit<ConversationRow, "id" | "created_at" | "updated_at"> {
  return {
    organization_id: organizationId,
    lead_name: conv.leadName,
    status: conv.status,
    tag: conv.tag ?? null,
    last_message: conv.lastMessage,
    last_message_at: conv.lastMessageAt,
    unread: conv.unread,
    messages: conv.messages,
    analysis: conv.analysis,
    external_ref: externalRef ?? null,
  };
}

export function patchToConversationUpdateRow(
  patch: Partial<Pick<Conversation, "tag">>
): Partial<ConversationRow> {
  const row: Partial<ConversationRow> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.tag !== undefined) {
    row.tag = patch.tag ?? null;
  }
  return row;
}
