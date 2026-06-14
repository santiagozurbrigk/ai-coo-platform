import { callClaudeText } from "@/lib/ai/anthropic";
import type { ContentLabel } from "@/lib/content/label-content";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = { insight: string; expiresAt: number };
const cache = new Map<string, CacheEntry>();

export type DistributionStats = {
  counts: Record<ContentLabel, number>;
  total: number;
  percentages: Record<ContentLabel, number>;
  topConversationsLabel: ContentLabel | null;
  conversionsPerLabel: Record<ContentLabel, number>;
};

export function buildDistributionStats(
  assets: {
    effectiveLabel: ContentLabel | null;
    conversationsGenerated: number;
    bookingsInfluenced: number;
    salesInfluenced: number;
  }[]
): DistributionStats {
  const counts: Record<ContentLabel, number> = {
    AUTORIDAD: 0,
    ATRACCION: 0,
    NUTRICION: 0,
    VENTA: 0,
  };
  const conversionsPerLabel: Record<ContentLabel, number> = {
    AUTORIDAD: 0,
    ATRACCION: 0,
    NUTRICION: 0,
    VENTA: 0,
  };

  for (const a of assets) {
    if (!a.effectiveLabel) continue;
    counts[a.effectiveLabel]++;
    conversionsPerLabel[a.effectiveLabel] +=
      a.conversationsGenerated + a.bookingsInfluenced + a.salesInfluenced;
  }

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const percentages = {} as Record<ContentLabel, number>;
  for (const label of Object.keys(counts) as ContentLabel[]) {
    percentages[label] =
      total > 0 ? Math.round((counts[label] / total) * 100) : 0;
  }

  let topConversationsLabel: ContentLabel | null = null;
  let topConv = -1;
  for (const label of Object.keys(conversionsPerLabel) as ContentLabel[]) {
    if (conversionsPerLabel[label] > topConv) {
      topConv = conversionsPerLabel[label];
      topConversationsLabel = label;
    }
  }

  return {
    counts,
    total,
    percentages,
    topConversationsLabel,
    conversionsPerLabel,
  };
}

export async function generateDistributionInsight(params: {
  organizationId: string;
  stats: DistributionStats;
}): Promise<string | null> {
  if (params.stats.total < 10) return null;

  const cached = cache.get(params.organizationId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.insight;
  }

  const { percentages, topConversationsLabel, conversionsPerLabel } =
    params.stats;

  const prompt = `Analiza esta distribución de contenido de un negocio de infoproductos:

AUTORIDAD: ${percentages.AUTORIDAD}%
ATRACCION: ${percentages.ATRACCION}%
NUTRICION: ${percentages.NUTRICION}%
VENTA: ${percentages.VENTA}%

Correlación con ventas:
- Contenido que más genera conversaciones: ${topConversationsLabel ?? "N/A"}
- Conversiones por tipo: AUTORIDAD=${conversionsPerLabel.AUTORIDAD}, ATRACCION=${conversionsPerLabel.ATRACCION}, NUTRICION=${conversionsPerLabel.NUTRICION}, VENTA=${conversionsPerLabel.VENTA}

Da UN insight accionable en máximo 2 oraciones en español.
Sé específico con los números reales, no genérico.`;

  const insight = await callClaudeText({
    organizationId: params.organizationId,
    task: "data_extraction",
    feature: "content_distribution_insight",
    system: "Respondé en español, máximo 2 oraciones.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 256,
  });

  if (!insight) return null;

  cache.set(params.organizationId, {
    insight,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return insight;
}
