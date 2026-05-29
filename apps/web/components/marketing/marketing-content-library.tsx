"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Heart, LayoutGrid, List, MessageCircle, Search } from "lucide-react";
import { Badge, Button, Input, cn } from "@ai-coo/ui";
import type { ContentAssetView } from "@/app/marketing/actions";
import { paths } from "@/routes";
import type { ContentLabel } from "@/lib/content/label-content";
import {
  ContentLabelBadge,
  ContentLabelFilterBadge,
} from "@/components/marketing/content-label-badge";
import { ContentLibraryEmptyState } from "@/components/marketing/content-library-empty-state";

type PlatformFilter = "all" | "instagram" | "youtube";
type LabelFilter = ContentLabel | "all";
type SortKey = "recent" | "views" | "conversions";

const PLATFORM_OPTIONS: { key: PlatformFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Más reciente" },
  { key: "views", label: "Más vistas" },
  { key: "conversions", label: "Más conversiones" },
];

export function MarketingContentLibrary({
  initialAssets,
}: {
  initialAssets: ContentAssetView[];
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [labelFilter, setLabelFilter] = useState<LabelFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...assets];
    if (platform !== "all") list = list.filter((a) => a.platform === platform);
    if (labelFilter !== "all") {
      list = list.filter((a) => a.effectiveLabel === labelFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.caption.toLowerCase().includes(q)
      );
    }
    const sorters: Record<
      SortKey,
      (a: ContentAssetView, b: ContentAssetView) => number
    > = {
      recent: (a, b) =>
        (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
      views: (a, b) => b.views - a.views,
      conversions: (a, b) =>
        b.conversationsGenerated +
        b.bookingsInfluenced +
        b.salesInfluenced -
        (a.conversationsGenerated +
          a.bookingsInfluenced +
          a.salesInfluenced),
    };
    list.sort(sorters[sort]);
    return list;
  }, [assets, platform, labelFilter, query, sort]);

  if (assets.length === 0) return <ContentLibraryEmptyState />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">Plataforma:</span>
        {PLATFORM_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setPlatform(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              platform === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">Etiqueta:</span>
        <ContentLabelFilterBadge
          label="all"
          active={labelFilter === "all"}
          onClick={() => setLabelFilter("all")}
        />
        {(["AUTORIDAD", "ATRACCION", "NUTRICION", "VENTA"] as ContentLabel[]).map(
          (l) => (
            <ContentLabelFilterBadge
              key={l}
              label={l}
              active={labelFilter === l}
              onClick={() => setLabelFilter(l)}
            />
          )
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs",
              view === "grid" && "bg-primary text-primary-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs",
              view === "list" && "bg-primary text-primary-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" /> Lista
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Ordenar:</span>
          <select
            className="h-9 rounded-md border border-border bg-background px-2 text-xs"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar contenido..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Ningún contenido coincide con los filtros seleccionados.
        </p>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <ContentGridCard
              key={asset.id}
              asset={asset}
              onLabelChange={(label) =>
                setAssets((prev) =>
                  prev.map((a) =>
                    a.id === asset.id
                      ? {
                          ...a,
                          manualLabel: label,
                          effectiveLabel: label ?? a.aiLabel,
                        }
                      : a
                  )
                )
              }
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3">Contenido</th>
                <th className="px-4 py-3">Plataforma</th>
                <th className="px-4 py-3">Etiqueta</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Vistas</th>
                <th className="px-4 py-3">Convs</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-border/50 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-medium max-w-xs truncate">
                    {asset.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {asset.platform === "youtube" ? "YouTube" : "Instagram"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ContentLabelBadge
                      assetId={asset.id}
                      aiLabel={asset.aiLabel}
                      manualLabel={asset.manualLabel}
                      confidence={asset.aiLabelConfidence}
                      onLabelChange={(label) =>
                        setAssets((prev) =>
                          prev.map((a) =>
                            a.id === asset.id
                              ? {
                                  ...a,
                                  manualLabel: label,
                                  effectiveLabel: label ?? a.aiLabel,
                                }
                              : a
                          )
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(asset.publishedAt)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatReach(asset.views)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {asset.conversationsGenerated}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={paths.platform.marketing.contentDetail(asset.id)}>
                        Ver detalle
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatReach(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ContentGridCard({
  asset,
  onLabelChange,
}: {
  asset: ContentAssetView;
  onLabelChange: (label: ContentLabel | null) => void;
}) {
  return (
    <div className="group rounded-xl border border-border overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link href={paths.platform.marketing.contentDetail(asset.id)}>
        <div className="relative">
          {asset.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.thumbnailUrl}
              alt=""
              className="h-44 w-full object-cover"
            />
          ) : (
            <div className="h-44 w-full bg-muted/40 flex items-center justify-center text-muted-foreground text-sm">
              Sin miniatura
            </div>
          )}
          <Badge className="absolute left-2 top-2" variant="secondary">
            {asset.platform === "youtube" ? "YouTube" : "Instagram"}
          </Badge>
        </div>
        <div className="p-3 space-y-2 bg-card/80">
          <p className="font-medium text-sm line-clamp-2">{asset.title}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" /> {formatReach(asset.views)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {formatReach(asset.likes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />{" "}
              {asset.conversationsGenerated} convs
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(asset.publishedAt)}
          </p>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <ContentLabelBadge
          assetId={asset.id}
          aiLabel={asset.aiLabel}
          manualLabel={asset.manualLabel}
          confidence={asset.aiLabelConfidence}
          onLabelChange={onLabelChange}
        />
      </div>
    </div>
  );
}
