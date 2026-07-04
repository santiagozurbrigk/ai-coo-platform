import { callClaudeJson } from "@/lib/ai/anthropic";
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";
import { searchRAG } from "./search";

export type ExtractedPlanDuration = {
  plan_name: string;
  duration_days: number | null;
  source_detail?: string;
  confidence: "high" | "medium" | "low";
};

/**
 * Infiere la duración de uno o más planes desde RAG (una vez por plan, no en render).
 */
export async function extractPlanDurationsFromRAG(
  organizationId: string,
  planNames: string[]
): Promise<ExtractedPlanDuration[]> {
  if (!planNames.length) return [];

  const uniquePlans = [...new Set(planNames.map((p) => p.trim()).filter(Boolean))];
  const results: ExtractedPlanDuration[] = [];

  for (const planName of uniquePlans) {
    const [docResults, sopResults] = await Promise.all([
      searchRAG({
        organizationId,
        query: `${planName} duración programa meses semanas acceso`,
        matchCount: 6,
        sourceTypes: ["business_context_note", "business_context_document"],
        minSimilarity: 0.55,
      }),
      searchRAG({
        organizationId,
        query: `${planName} programa mentoría curso duración`,
        matchCount: 4,
        sourceTypes: ["sop", "sales_framework", "product"],
        minSimilarity: 0.55,
      }),
    ]);

    const chunks = [...docResults, ...sopResults];
    if (!chunks.length) {
      results.push({
        plan_name: planName,
        duration_days: null,
        confidence: "low",
      });
      continue;
    }

    const context = chunks.map((c) => c.content).join("\n\n").slice(0, 5000);
    const sourceDetail = chunks[0]?.title ?? chunks[0]?.sourceType ?? "contexto RAG";

    const extracted = await callClaudeJson<{
      duration_days: number | null;
      reasoning: string;
      confidence: "high" | "medium" | "low";
    }>({
      task: "data_extraction",
      system:
        "Respondé únicamente con JSON válido. Si no hay información clara sobre la duración del programa, devolvé duration_days: null.",
      user: `Del siguiente contexto de negocio, determiná cuántos días dura el programa/plan "${planName}" desde que el cliente entra hasta que termina el acceso.

Reglas:
- Convertí meses a días (1 mes = 30 días), años a 365 días.
- Si solo hay duración ambigua o no aparece, duration_days debe ser null.
- No inventes duraciones.

CONTEXTO:
${wrapUntrustedContent("plan_context", context)}

JSON:
{
  "duration_days": <número entero positivo o null>,
  "reasoning": "<breve explicación>",
  "confidence": "<high|medium|low>"
}`,
      maxTokens: 400,
      feature: "plan_duration_extraction",
      organizationId,
    });

    results.push({
      plan_name: planName,
      duration_days:
        extracted?.duration_days != null && extracted.duration_days > 0
          ? Math.round(extracted.duration_days)
          : null,
      source_detail: sourceDetail,
      confidence: extracted?.confidence ?? "low",
    });
  }

  return results;
}
