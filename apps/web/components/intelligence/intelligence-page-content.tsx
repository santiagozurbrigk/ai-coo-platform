import { Text } from "@ai-coo/ui";
import { IntelligenceEmptyState } from "@/components/intelligence/intelligence-empty-state";
import { formatRelativeTime } from "@/lib/format";
import { isIntelligenceSnapshotEmpty } from "@/lib/intelligence/utils";
import type { IntelligenceSnapshotView } from "@/app/intelligence/actions";
import { IntelligenceOverview } from "./intelligence-overview";

export function IntelligencePageContent({
  snapshot,
  isFounder = false,
}: {
  snapshot: IntelligenceSnapshotView;
  isFounder?: boolean;
}) {
  if (isIntelligenceSnapshotEmpty(snapshot)) {
    return <IntelligenceEmptyState isFounder={isFounder} />;
  }

  return (
    <div className="space-y-6">
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
      <IntelligenceOverview
        insights={snapshot.insights}
        recommendations={snapshot.recommendations}
        bottlenecks={snapshot.bottlenecks}
        opportunities={snapshot.opportunities}
        memoryChunks={snapshot.memoryChunks}
      />
    </div>
  );
}
