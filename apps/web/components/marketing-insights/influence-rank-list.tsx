import Link from "next/link";
import { Badge } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import type { ContentAsset, InfluenceRankItem } from "@/types/marketing-insights";
import { ContentThumbnail } from "./content-thumbnail";

export function InfluenceRankList({
  title,
  items,
  assets,
}: {
  title: string;
  items: InfluenceRankItem[];
  assets: ContentAsset[];
}) {
  return (
    <Panel title={title}>
      <ul className="space-y-3">
        {items.map((item) => {
          const asset = assets.find((a) => a.id === item.contentId);
          if (!asset) return null;
          return (
            <li key={item.contentId}>
              <Link
                href={paths.platform.sales.marketingInsights.content(item.contentId)}
                className="flex gap-3 rounded-lg border border-border/60 p-2 transition-colors hover:border-primary/25 hover:bg-muted/25"
              >
                <div className="w-20 shrink-0">
                  <ContentThumbnail content={asset} size="sm" className="h-16" />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="ai" className="text-2xs">
                      #{item.rank}
                    </Badge>
                    <p className="truncate text-sm font-medium">{asset.title}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.metricLabel}</p>
                  <p className="text-sm font-semibold text-primary">{item.metricValue}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
