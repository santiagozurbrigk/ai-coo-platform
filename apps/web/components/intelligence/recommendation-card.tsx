import { Badge } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { es } from "@/lib/locale/es";
import { flowLinks } from "@/lib/navigation/flow-links";
import { Panel } from "@/components/shared";
import type { IntelligenceRecommendation } from "@/types/intelligence";

export function RecommendationCard({ item }: { item: IntelligenceRecommendation }) {
  const variant =
    item.priority === "high"
      ? "destructive"
      : item.priority === "medium"
        ? "warning"
        : "secondary";

  return (
    <Panel>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm">{item.title}</p>
        <Badge variant={variant} className="shrink-0">
          {es.status.priority[item.priority]}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{item.action}</p>
      <FlowCta
        href={flowLinks.recommendation(item.id)}
        label={es.common.takeAction}
      />
    </Panel>
  );
}
