import { callClaudeJson } from "@/lib/ai/anthropic";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ObjectionCategory } from "@/types/sales";
import {
  buildConversationScoringPrompt,
  type ConversationScoringMessage,
} from "./conversation-scoring-prompt";

export type ConversationScoringResult = {
  overall_score: number;
  engagement_score: number;
  intent_score: number;
  qualification_score: number;
  label: "hot" | "warm" | "cold" | "unqualified";
  summary: string;
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

export async function scoreConversation({
  organizationId,
  conversationId,
  messages,
  leadName,
  formAnswers,
}: {
  organizationId: string;
  conversationId: string;
  messages: ConversationScoringMessage[];
  leadName?: string;
  formAnswers?: Record<string, string>;
}): Promise<void> {
  if (!messages?.length) return;

  const supabase = createAdminClient();

  try {
    const [{ data: org }, resolvedFormAnswers] = await Promise.all([
      supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .maybeSingle(),
      formAnswers
        ? Promise.resolve(formAnswers)
        : fetchFormAnswersForLead(organizationId, leadName),
    ]);

    const { system, user } = buildConversationScoringPrompt(
      messages,
      { name: leadName, formAnswers: resolvedFormAnswers },
      { businessType: "infoproducto", productName: org?.name ?? undefined }
    );

    const raw = await callClaudeJson<ConversationScoringResult>({
      organizationId,
      model: "claude-haiku-4-5",
      feature: "conversation_scoring",
      system,
      user,
      maxTokens: 1000,
    });

    if (!raw) {
      console.warn(
        `[ConversationScoring] Sin respuesta IA para conversación ${conversationId}`
      );
      return;
    }

    const analysis: ConversationScoringResult = {
      overall_score: clampScore(raw.overall_score),
      engagement_score: clampScore(raw.engagement_score),
      intent_score: clampScore(raw.intent_score),
      qualification_score: clampScore(raw.qualification_score),
      label: normalizeLabel(raw.label),
      summary: String(raw.summary ?? "").trim(),
      booking_signals: Array.isArray(raw.booking_signals)
        ? raw.booking_signals.map(String)
        : [],
      ghosting_signals: Array.isArray(raw.ghosting_signals)
        ? raw.ghosting_signals.map(String)
        : [],
      detected_objections: normalizeObjections(raw.detected_objections),
      recommended_action: String(raw.recommended_action ?? "").trim(),
    };

    const { error } = await supabase
      .from("conversations")
      .update({
        ai_score: analysis.overall_score,
        ai_engagement_score: analysis.engagement_score,
        ai_intent_score: analysis.intent_score,
        ai_qualification_score: analysis.qualification_score,
        ai_label: analysis.label,
        ai_summary: analysis.summary || null,
        ai_booking_signals: analysis.booking_signals ?? [],
        ai_ghosting_signals: analysis.ghosting_signals ?? [],
        ai_detected_objections: analysis.detected_objections ?? [],
        ai_recommended_action: analysis.recommended_action || null,
        last_analyzed_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    console.log(
      `[ConversationScoring] ✅ Scored conversation ${conversationId}: ${analysis.label} (${analysis.overall_score})`
    );
  } catch (err) {
    console.error(
      `[ConversationScoring] ❌ Error scoring conversation ${conversationId}:`,
      err
    );
  }
}
