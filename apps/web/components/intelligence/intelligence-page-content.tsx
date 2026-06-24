import { Brain } from "lucide-react";
import { Text } from "@ai-coo/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime } from "@/lib/format";
import { isIntelligenceSnapshotEmpty } from "@/lib/intelligence/utils";
import type { IntelligenceSnapshotView } from "@/app/intelligence/actions";
import { IntelligenceOverview } from "./intelligence-overview";

export function IntelligencePageContent({
  snapshot,
}: {
  snapshot: IntelligenceSnapshotView;
}) {
  if (isIntelligenceSnapshotEmpty(snapshot)) {
    return (
      <EmptyState
        icon={<Brain className="h-8 w-8" />}
        title="Todavía no hay suficientes datos para generar insights"
        description="El análisis cruzado con IA corre automáticamente dos veces al día. Volvé a revisar en las próximas horas cuando haya actividad en ventas, operaciones o finanzas."
      />
    );
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
