import { callClaudeJson } from "@/lib/ai/anthropic";
import type { MarketingAiInsight } from "@/types/marketing-insights";

export async function analyzeContentSalesPatterns(params: {
  organizationId: string;
  rankSummary: string;
  journeysSummary: string;
  assetsSummary: string;
}): Promise<MarketingAiInsight[] | null> {
  const result = await callClaudeJson<{
    insights: { title: string; body: string; confidence: number }[];
  }>({
    organizationId: params.organizationId,
    task: "sales_analysis",
    feature: "content_sales_patterns",
    system: `Eres analista de marketing para infoproductos.
Identificá patrones de qué tipo de contenido convierte mejor (formato, etiqueta, tema).
Responde SOLO JSON en español. Máximo 4 insights accionables.`,
    user: `Ranking de contenido por ventas:
${params.rankSummary.slice(0, 12_000)}

Journeys de compradores (muestra):
${params.journeysSummary.slice(0, 12_000)}

Biblioteca de contenido (muestra):
${params.assetsSummary.slice(0, 12_000)}

JSON:
{"insights":[{"title":"...","body":"...","confidence":0.0-1.0}]}`,
    maxTokens: 2048,
  });

  if (!result?.insights?.length) return null;

  return result.insights.slice(0, 4).map((item, i) => ({
    id: `pattern-${i}`,
    title: item.title,
    body: item.body,
    confidence: Math.min(1, Math.max(0, Number(item.confidence ?? 0.7))),
  }));
}
