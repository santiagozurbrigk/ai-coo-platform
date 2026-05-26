"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Heart, LayoutGrid, List, MessageCircle, Search } from "lucide-react";
import { Badge, Button, Input, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { ContentAsset, ContentType } from "@/types/marketing-insights";
import { mockContentAssets } from "@/mocks/marketing-insights";
import { useMarketingData } from "@/providers";
import { CONTENT_FILTER_OPTIONS, CONTENT_TYPE_LABEL } from "@/components/marketing-insights/content-labels";
import { ContentThumbnail } from "@/components/marketing-insights/content-thumbnail";
import { InstagramEmptyState } from "./instagram-empty-state";

type SortKey =
  | "recent"
  | "reach"
  | "interactions"
  | "conversations"
  | "bookings"
  | "sales";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Más reciente" },
  { key: "reach", label: "Mayor alcance" },
  { key: "interactions", label: "Más interacciones" },
  { key: "conversations", label: "Más conversaciones" },
  { key: "bookings", label: "Más bookings" },
  { key: "sales", label: "Más ventas" },
];

export function MarketingContentLibrary() {
  const { instagramConnected } = useMarketingData();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<ContentType | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...mockContentAssets];
    if (filter !== "all") list = list.filter((a) => a.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q));
    }
    const sorters: Record<SortKey, (a: ContentAsset, b: ContentAsset) => number> = {
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      reach: (a, b) => b.reach - a.reach,
      interactions: (a, b) => b.interactions - a.interactions,
      conversations: (a, b) => b.conversationsGenerated - a.conversationsGenerated,
      bookings: (a, b) => b.bookingsInfluenced - a.bookingsInfluenced,
      sales: (a, b) => b.salesInfluenced - a.salesInfluenced,
    };
    list.sort(sorters[sort]);
    return list;
  }, [filter, query, sort]);

  if (!instagramConnected) return <InstagramEmptyState />;

  return (
    <div className="space-y-4">
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

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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
                "rounded-md px-3 py-1.5 text-xs font-medium",
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <ContentGridCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3">Contenido</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Alcance</th>
                <th className="px-4 py-3">Interacciones</th>
                <th className="px-4 py-3">Convs</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Ventas</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ContentThumbnail content={asset} size="sm" className="h-10 w-10" />
                      <span className="font-medium">{asset.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{CONTENT_TYPE_LABEL[asset.type]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{asset.publishDate}</td>
                  <td className="px-4 py-3 tabular-nums">{formatReach(asset.reach)}</td>
                  <td className="px-4 py-3 tabular-nums">{asset.interactions.toLocaleString("es-ES")}</td>
                  <td className="px-4 py-3 tabular-nums">{asset.conversationsGenerated}</td>
                  <td className="px-4 py-3 tabular-nums">{asset.bookingsInfluenced}</td>
                  <td className="px-4 py-3 tabular-nums">{asset.salesInfluenced}</td>
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

function ContentGridCard({ asset }: { asset: ContentAsset }) {
  return (
    <Link
      href={paths.platform.marketing.contentDetail(asset.id)}
      className="group rounded-xl border border-border overflow-hidden transition-all hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative">
        <ContentThumbnail content={asset} size="md" className="h-44 w-full rounded-none" />
        <Badge className="absolute left-2 top-2" variant="secondary">
          {CONTENT_TYPE_LABEL[asset.type]}
        </Badge>
      </div>
      <div className="p-3 space-y-2 bg-card/80">
        <p className="font-medium text-sm line-clamp-2">{asset.title}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {formatReach(asset.reach)}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {formatReach(asset.interactions)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> {asset.conversationsGenerated} convs
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{asset.publishDate}</p>
        <p className="text-xs">
          Bookings: <strong>{asset.bookingsInfluenced}</strong> · Ventas:{" "}
          <strong>{asset.salesInfluenced}</strong>
        </p>
      </div>
    </Link>
  );
}
