import { AiCard } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { es } from "@/lib/locale/es";
import { resolveInsightLink } from "@/lib/navigation/resolve-flow-link";
import type { IntelligenceInsight } from "@/types/intelligence";

export function InsightCard({ insight }: { insight: IntelligenceInsight }) {
  return (
    <div className="h-full flex flex-col">
      <AiCard
        title={insight.title}
        confidence={insight.confidence}
        source={`${insight.department} · ${insight.createdAt}`}
        variant="insight"
      >
        {insight.body}
      </AiCard>
      <FlowCta
        href={resolveInsightLink(insight)}
        label={es.common.takeAction}
      />
    </div>
  );
}
