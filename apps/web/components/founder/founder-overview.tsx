import { AiCard, MetricBand, MetricStat, Text } from "@ai-coo/ui";
import { IntelligenceEmptyState } from "@/components/intelligence/intelligence-empty-state";
import { RecommendationCard } from "@/components/intelligence/recommendation-card";
import { formatRelativeTime } from "@/lib/format";
import { isIntelligenceSnapshotEmpty } from "@/lib/intelligence/utils";
import type { IntelligenceSnapshotView } from "@/app/intelligence/actions";
import type { IntelligenceRecommendation } from "@/types/intelligence";

const PRIORITY_ORDER: Record<IntelligenceRecommendation["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function FounderOverview({
  snapshot,
  isFounder = false,
}: {
  snapshot: IntelligenceSnapshotView;
  isFounder?: boolean;
}) {
  if (isIntelligenceSnapshotEmpty(snapshot)) {
    return <IntelligenceEmptyState isFounder={isFounder} />;
  }

  const briefing =
    [...snapshot.insights].sort((a, b) => b.confidence - a.confidence)[0] ??
    null;

  const recommendations = [...snapshot.recommendations].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  const highPriorityCount = snapshot.recommendations.filter(
    (r) => r.priority === "high"
  ).length;

  return (
    <div className="space-y-8">
      {snapshot.generatedAt ? (
        <Text muted className="text-sm">
          Última actualización: {formatRelativeTime(snapshot.generatedAt)} (
          {new Date(snapshot.generatedAt).toLocaleString("es", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
          )
        </Text>
      ) : null}

      {briefing ? (
        <AiCard
          title="Briefing del fundador"
          confidence={briefing.confidence}
          source={`${briefing.department}${
            briefing.createdAt ? ` · ${briefing.createdAt}` : ""
          }`}
        >
          {briefing.body}
        </AiCard>
      ) : null}

      <MetricBand>
        <MetricStat
          title="Decisiones prioritarias"
          value={highPriorityCount}
        />
        <MetricStat
          title="Cuellos de botella"
          value={snapshot.bottlenecks.length}
        />
        <MetricStat
          title="Oportunidades"
          value={snapshot.opportunities.length}
        />
      </MetricBand>

      {recommendations.length > 0 ? (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Prioridades estratégicas
            </h2>
            <Text muted className="text-sm">
              Acciones sugeridas a partir de los datos de tu operación
            </Text>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
