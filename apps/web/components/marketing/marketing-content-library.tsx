"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, List, Search } from "lucide-react";
import { Badge, Button, Input, cn } from "@ai-coo/ui";
import type { ContentAssetView } from "@/app/marketing/actions";
import { paths } from "@/routes";
import type { ContentLabel } from "@/lib/content/label-content";
import {
  filterAndSortContent,
  type ContentSortKey,
  type ContentTypeFilter,
  type DistributionFilter,
  type PeriodFilter,
  type ReelTypeFilter,
} from "@/lib/marketing/content-filters";
import {
  ContentLabelBadge,
  ContentLabelFilterBadge,
} from "@/components/marketing/content-label-badge";
import { ContentLibraryEmptyState } from "@/components/marketing/content-library-empty-state";
import { FilterPills } from "@/components/marketing/filter-pills";
import {
  segmentedNavContainerClass,
  segmentedNavItemClass,
} from "@/components/shared/segmented-nav-styles";

type PlatformFilter = "all" | "instagram" | "youtube";
type LabelFilter = ContentLabel | "all";

const CONTENT_TYPE_TABS: { value: ContentTypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "reel", label: "Reels" },
  { value: "post", label: "Posts" },
  { value: "story", label: "Stories" },
  { value: "carousel", label: "Carousels" },
  { value: "vsl", label: "VSLs" },
];

const REEL_TYPE_TABS: { value: ReelTypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "reel", label: "Reel" },
  { value: "trial_reel", label: "Trial Reel" },
];

const DISTRIBUTION_TABS: { value: DistributionFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "organic", label: "Orgánico" },
  { value: "paid", label: "Pautado" },
];

const SORT_OPTIONS: { value: ContentSortKey; label: string }[] = [
  { value: "date_desc", label: "Más reciente" },
  { value: "date_asc", label: "Más antiguo" },
  { value: "views_total", label: "Views totales" },
  { value: "views_organic", label: "Views orgánico" },
  { value: "likes", label: "Likes" },
  { value: "saves", label: "Guardados" },
  { value: "comments", label: "Comentarios" },
  { value: "shares", label: "Compartidos" },
  { value: "multiplier", label: "Multiplicador ×" },
];

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "30d", label: "Últimos 30 días" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "all", label: "Todo el tiempo" },
];

const PLATFORM_OPTIONS: { key: PlatformFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
];

const LIST_COLUMNS: {
  key: ContentSortKey;
  label: string;
  align?: "right";
}[] = [
  { key: "date_desc", label: "Fecha" },
  { key: "views_total", label: "Views", align: "right" },
  { key: "views_organic", label: "Views org.", align: "right" },
  { key: "likes", label: "Likes", align: "right" },
  { key: "saves", label: "Guardados", align: "right" },
  { key: "comments", label: "Comentarios", align: "right" },
  { key: "shares", label: "Compartidos", align: "right" },
  { key: "multiplier", label: "×", align: "right" },
];

export function MarketingContentLibrary({
  initialAssets,
  hasRealData = true,
}: {
  initialAssets: ContentAssetView[];
  hasRealData?: boolean;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [labelFilter, setLabelFilter] = useState<LabelFilter>("all");
  const [contentType, setContentType] = useState<ContentTypeFilter>("all");
  const [reelType, setReelType] = useState<ReelTypeFilter>("all");
  const [distribution, setDistribution] = useState<DistributionFilter>("all");
  const [sortBy, setSortBy] = useState<ContentSortKey>("date_desc");
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = filterAndSortContent(assets, {
      type: contentType,
      reelType,
      distribution,
      sortBy,
      period,
      query,
    });
    if (platform !== "all") {
      list = list.filter((a) => a.platform === platform);
    }
    if (labelFilter !== "all") {
      list = list.filter((a) => a.effectiveLabel === labelFilter);
    }
    return list;
  }, [
    assets,
    contentType,
    reelType,
    distribution,
    sortBy,
    period,
    query,
    platform,
    labelFilter,
  ]);

  if (assets.length === 0) return <ContentLibraryEmptyState />;

  return (
    <div className="space-y-4">
      {!hasRealData ? (
        <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
          Sin datos reales aún — conectá Instagram o YouTube en Integraciones
        </span>
      ) : null}
      <div className="space-y-3 rounded-xl border border-border bg-card/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPills
            options={CONTENT_TYPE_TABS}
            value={contentType}
            onChange={(v) => {
              const next = v as ContentTypeFilter;
              setContentType(next);
              if (next !== "reel") {
                setReelType("all");
                setDistribution("all");
              }
            }}
          />
        </div>

        <AnimatePresence initial={false}>
          {contentType === "reel" ? (
            <motion.div
              key="reel-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tipo:</span>
                  <FilterPills
                    options={REEL_TYPE_TABS}
                    value={reelType}
                    onChange={(v) => setReelType(v as ReelTypeFilter)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Distribución:
                  </span>
                  <FilterPills
                    options={DISTRIBUTION_TABS}
                    value={distribution}
                    onChange={(v) => setDistribution(v as DistributionFilter)}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ContentSortKey)}
              className="cursor-pointer rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/50"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">Período:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
              className="cursor-pointer rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted/50"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full max-w-xs sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 pl-9 text-xs"
              placeholder="Buscar contenido..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">Plataforma:</span>
        <FilterPills
          options={PLATFORM_OPTIONS.map(({ key, label }) => ({
            value: key,
            label,
          }))}
          value={platform}
          onChange={(value) => setPlatform(value as PlatformFilter)}
        />
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
        <div className={segmentedNavContainerClass}>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              segmentedNavItemClass(view === "grid"),
              "inline-flex items-center gap-1"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              segmentedNavItemClass(view === "list"),
              "inline-flex items-center gap-1"
            )}
          >
            <List className="h-3.5 w-3.5" /> Lista
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} pieza{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Ningún contenido coincide con los filtros seleccionados.
        </p>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <ContentListTable
          assets={filtered}
          sortBy={sortBy}
          onSort={setSortBy}
          onLabelChange={(assetId, label) =>
            setAssets((prev) =>
              prev.map((a) =>
                a.id === assetId
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
      )}
    </div>
  );
}

function ContentListTable({
  assets,
  sortBy,
  onSort,
  onLabelChange,
}: {
  assets: ContentAssetView[];
  sortBy: ContentSortKey;
  onSort: (key: ContentSortKey) => void;
  onLabelChange: (assetId: string, label: ContentLabel | null) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-3">Contenido</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Distribución</th>
            {LIST_COLUMNS.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "cursor-pointer px-4 py-3 hover:text-foreground",
                  col.align === "right" && "text-right",
                  (sortBy === col.key ||
                    (col.key === "date_desc" && sortBy === "date_asc")) &&
                    "text-foreground"
                )}
                onClick={() => {
                  if (col.key === "date_desc") {
                    onSort(sortBy === "date_desc" ? "date_asc" : "date_desc");
                  } else {
                    onSort(col.key);
                  }
                }}
              >
                {col.label}
                {sortBy === col.key ||
                (col.key === "date_desc" && sortBy === "date_asc")
                  ? " ↓"
                  : ""}
              </th>
            ))}
            <th className="px-4 py-3 text-right">Convs</th>
            <th className="px-4 py-3 text-right">Bookings</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr
              key={asset.id}
              className="border-b border-border/50 hover:bg-muted/20"
            >
              <td className="max-w-xs truncate px-4 py-3 font-medium">
                {asset.title}
              </td>
              <td className="px-4 py-3">
                <ContentTypeBadge asset={asset} />
              </td>
              <td className="px-4 py-3 capitalize text-muted-foreground">
                {asset.distribution === "paid" ? "Pautado" : "Orgánico"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(asset.publishedAt)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatReach(asset.views)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatReach(asset.viewsOrganic)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatReach(asset.likes)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatReach(asset.saves)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatReach(asset.comments)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatReach(asset.shares)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                ×{asset.multiplier}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {asset.conversationsGenerated}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {asset.bookingsInfluenced}
              </td>
              <td className="px-4 py-3">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={paths.platform.marketing.contentDetail(asset.id)}>
                    Ver
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentTypeBadge({ asset }: { asset: ContentAssetView }) {
  const type = asset.contentType ?? "post";
  const label =
    type === "reel" && asset.reelType === "trial_reel"
      ? "Trial Reel"
      : type.charAt(0).toUpperCase() + type.slice(1);
  return <Badge variant="secondary">{label}</Badge>;
}

function contentTypeEmoji(type: string | null) {
  if (type === "reel") return "🎬";
  if (type === "story") return "⭕";
  if (type === "vsl") return "📺";
  if (type === "carousel") return "🖼️";
  return "📄";
}

function ContentGridCard({
  asset,
  onLabelChange,
}: {
  asset: ContentAssetView;
  onLabelChange: (label: ContentLabel | null) => void;
}) {
  const type = asset.contentType ?? "post";

  return (
    <div className="content-card group overflow-hidden rounded-xl border border-border transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link href={paths.platform.marketing.contentDetail(asset.id)}>
        <div className="relative aspect-[9/16] overflow-hidden rounded-t-xl bg-muted/40">
          {asset.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/60 to-muted text-4xl">
              {contentTypeEmoji(type)}
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
              {contentTypeEmoji(type)}{" "}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
            {asset.reelType === "trial_reel" ? (
              <span className="rounded-md border border-amber-500/30 bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400 backdrop-blur-sm">
                Trial
              </span>
            ) : null}
            {asset.distribution === "paid" ? (
              <span className="rounded-md border border-blue-500/30 bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-400 backdrop-blur-sm">
                Pautado
              </span>
            ) : null}
          </div>
          {asset.multiplier >= 1.5 ? (
            <div className="absolute bottom-2 right-2">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm",
                  asset.multiplier >= 3
                    ? "border-green-500/30 bg-green-500/20 text-green-400"
                    : asset.multiplier >= 2
                      ? "border-violet-500/30 bg-violet-500/20 text-violet-400"
                      : "border-white/15 bg-white/10 text-white/60"
                )}
              >
                ×{asset.multiplier}
              </span>
            </div>
          ) : null}
        </div>
        <div className="space-y-1 px-2 pb-2 pt-2">
          <p className="truncate text-xs font-medium text-foreground">
            {asset.title}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span>👁 {formatReach(asset.views)}</span>
            <span>❤️ {formatReach(asset.likes)}</span>
            {asset.saves > 0 ? (
              <span>🔖 {formatReach(asset.saves)}</span>
            ) : null}
            {asset.storyReplies > 0 ? (
              <span>💬 {formatReach(asset.storyReplies)}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/80">
            <span>{asset.conversationsGenerated} convs</span>
            <span>{asset.bookingsInfluenced} bookings</span>
          </div>
        </div>
      </Link>
      <div className="px-2 pb-3">
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
