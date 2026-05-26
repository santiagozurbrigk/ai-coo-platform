"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge, Input, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { ContentAsset, ContentType } from "@/types/marketing-insights";
import { CONTENT_FILTER_OPTIONS, CONTENT_TYPE_LABEL } from "./content-labels";
import { ContentThumbnail } from "./content-thumbnail";
import { EmptyState } from "@/components/shared/empty-state";

export function ContentLibraryGrid({ assets }: { assets: ContentAsset[] }) {
  const [filter, setFilter] = useState<ContentType | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = assets;
    if (filter !== "all") list = list.filter((a) => a.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q));
    }
    return list;
  }, [assets, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar contenido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CONTENT_FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin contenido"
          description="No hay piezas que coincidan con el filtro o la búsqueda."
        />
      ) : (
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
          {filtered.map((asset) => (
            <Link
              key={asset.id}
              href={paths.platform.sales.marketingInsights.content(asset.id)}
              className="mb-4 block break-inside-avoid"
            >
              <ContentThumbnail content={asset} size="lg" />
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium leading-snug">{asset.title}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-2xs">
                    {CONTENT_TYPE_LABEL[asset.type]}
                  </Badge>
                  <span className="text-2xs text-muted-foreground">{asset.publishDate}</span>
                </div>
                <p className="text-2xs text-muted-foreground">
                  {asset.interactions.toLocaleString("es")} interacciones ·{" "}
                  {asset.bookingsInfluenced} agend. · {asset.salesInfluenced} ventas
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
