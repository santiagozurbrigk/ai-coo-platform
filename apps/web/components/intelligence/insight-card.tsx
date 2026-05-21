import { AiCard } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { es } from "@/lib/locale/es";
import { flowLinks } from "@/lib/navigation/flow-links";
import type { IntelligenceInsight } from "@/types/intelligence";

export function InsightCard({ insight }: { insight: IntelligenceInsight }) {
  return (
    <div className="h-full flex flex-col">
      <AiCard
        title={insight.title}
        confidence={insight.confidence}
        source={`${insight.department} · ${insight.createdAt}`}
      >
        {insight.body}
      </AiCard>
      <FlowCta
        href={flowLinks.insight(insight.id)}
        label={es.common.takeAction}
      />
    </div>
  );
}
