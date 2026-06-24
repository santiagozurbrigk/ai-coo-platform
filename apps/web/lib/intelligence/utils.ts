import type { IntelligenceSnapshotView } from "@/app/intelligence/actions";

export function isIntelligenceSnapshotEmpty(
  snapshot: IntelligenceSnapshotView
): boolean {
  if (!snapshot.generatedAt) return true;
  return (
    snapshot.insights.length === 0 &&
    snapshot.recommendations.length === 0 &&
    snapshot.bottlenecks.length === 0 &&
    snapshot.opportunities.length === 0
  );
}
