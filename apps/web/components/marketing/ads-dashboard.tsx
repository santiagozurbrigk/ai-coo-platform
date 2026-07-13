"use client";

import { Fragment, useCallback, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { ArrowUpDown, ChevronDown, ExternalLink, Megaphone } from "lucide-react";
import {
  getMarketingAdsAction,
  type MarketingAdsFilters,
} from "@/app/marketing/content/ad-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterPills } from "@/components/marketing/filter-pills";
import type { ZernioAdMetrics, ZernioAdStatus, ZernioLinkedAd } from "@/lib/zernio/client";
import {
  formatActionKey,
  formatCurrency,
  formatMultiplier,
  formatNumber,
  formatPercent,
  formatSeconds,
  normalizeAdMetrics,
} from "@/lib/utils/format-ad-metrics";
import { Badge, cn, MetricStat, Skeleton } from "@ai-coo/ui";

type Props = {
  initialAds: ZernioLinkedAd[];
  initialError?: string | null;
  initialRangeDays?: 7 | 30 | 90;
};

type StatusFilter = "all" | "active" | "paused" | "error";
type PlatformFilter = "all" | "facebook" | "instagram";
type RangeDays = 7 | 30 | 90;

const TABLE_COLUMN_COUNT = 9;

type SortKey = "spend" | "impressions" | "roas" | "ctr" | "budget";
type SortDir = "asc" | "desc";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "paused", label: "Pausados" },
  { value: "error", label: "Error" },
];

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
];

const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: "Últimos 7d" },
  { value: 30, label: "Últimos 30d" },
  { value: 90, label: "Últimos 90d" },
];

const STATUS_LABELS: Record<ZernioAdStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  pending_review: "En revisión",
  rejected: "Rechazado",
  completed: "Finalizado",
  cancelled: "Cancelado",
  error: "Error",
};

function roasColorClass(roas: number): string {
  if (roas <= 0) return "text-muted-foreground";
  if (roas >= 2) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (roas >= 1) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function ctrColorClass(ctr: number): string {
  if (ctr <= 0) return "text-muted-foreground";
  if (ctr >= 2) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (ctr >= 1) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function resolveDateRange(days: RangeDays) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
}

function statusBadgeClass(status: ZernioAdStatus): string {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300";
    case "paused":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300";
    case "error":
    case "rejected":
      return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300";
    case "completed":
      return "border-muted bg-muted/50 text-muted-foreground";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}

function buildFilters(
  status: StatusFilter,
  platform: PlatformFilter,
  rangeDays: RangeDays
): MarketingAdsFilters {
  const range = resolveDateRange(rangeDays);
  return {
    ...range,
    ...(status !== "all" ? { status } : {}),
    ...(platform !== "all" ? { platform } : {}),
  };
}

function aggregateKpis(ads: ZernioLinkedAd[]) {
  const normalized = ads.map((ad) => normalizeAdMetrics(ad.metrics));

  const spend = normalized.reduce((sum, metrics) => sum + metrics.spend, 0);
  const impressions = normalized.reduce(
    (sum, metrics) => sum + metrics.impressions,
    0
  );
  const reach = normalized.reduce((sum, metrics) => sum + metrics.reach, 0);
  const conversions = normalized.reduce(
    (sum, metrics) => sum + metrics.conversions,
    0
  );
  const purchaseValue = normalized.reduce(
    (sum, metrics) => sum + metrics.purchaseValue,
    0
  );

  const roasValues = normalized.map((metrics) => metrics.roas).filter((value) => value > 0);
  const ctrValues = normalized.map((metrics) => metrics.ctr);
  const costPerConvValues = normalized
    .map((metrics) => metrics.costPerConversion)
    .filter((value) => value > 0);

  const roasAvg =
    roasValues.length > 0
      ? roasValues.reduce((sum, value) => sum + value, 0) / roasValues.length
      : 0;
  const ctrAvg =
    ctrValues.length > 0
      ? ctrValues.reduce((sum, value) => sum + value, 0) / ctrValues.length
      : 0;
  const costPerConvAvg =
    costPerConvValues.length > 0
      ? costPerConvValues.reduce((sum, value) => sum + value, 0) /
        costPerConvValues.length
      : 0;

  return {
    spend,
    impressions,
    reach,
    conversions,
    roasAvg,
    ctrAvg,
    costPerConvAvg,
    purchaseValue,
  };
}

function StatusSummary({ ads }: { ads: ZernioLinkedAd[] }) {
  const counts = useMemo(() => {
    const result = { active: 0, paused: 0, error: 0, other: 0 };
    for (const ad of ads) {
      if (ad.status === "active") result.active++;
      else if (ad.status === "paused") result.paused++;
      else if (ad.status === "error" || ad.status === "rejected") result.error++;
      else result.other++;
    }
    return result;
  }, [ads]);

  if (ads.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {counts.active > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {counts.active} activo{counts.active !== 1 ? "s" : ""}
        </span>
      )}
      {counts.paused > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {counts.paused} pausado{counts.paused !== 1 ? "s" : ""}
        </span>
      )}
      {counts.error > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          {counts.error} con error
        </span>
      )}
      {counts.other > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          {counts.other} otro{counts.other !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

function SpendBudgetBar({ spend, budgetAmount }: { spend: number; budgetAmount: number }) {
  if (budgetAmount <= 0) return <span className="text-sm tabular-nums">{formatCurrency(spend)}</span>;
  const pct = Math.min((spend / budgetAmount) * 100, 100);
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="min-w-[90px] space-y-1">
      <span className="text-sm tabular-nums">{formatCurrency(spend)}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}% del budget</span>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3 transition-opacity",
            active ? "opacity-100" : "opacity-40"
          )}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-muted/30 px-4 py-3">
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
          <div className="grid flex-1 grid-cols-4 gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h4>
  );
}

function AdExpandedDetails({ metrics }: { metrics: ZernioAdMetrics }) {
  const actionEntries = Object.entries(metrics.actions).filter(
    ([, value]) => value > 0
  );
  const showVideo = metrics.videoPlayActions > 0;
  const showActions = actionEntries.length > 0;

  return (
    <div className="space-y-5 bg-muted/10 px-4 py-5">
      <section className="space-y-3">
        <SectionTitle>Performance</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <DetailMetric label="Spend" value={formatCurrency(metrics.spend)} />
          <DetailMetric label="Impressions" value={formatNumber(metrics.impressions)} />
          <DetailMetric label="Reach" value={formatNumber(metrics.reach)} />
          <DetailMetric label="Clicks" value={formatNumber(metrics.clicks)} />
          <DetailMetric label="CTR" value={formatPercent(metrics.ctr)} />
          <DetailMetric label="CPC" value={formatCurrency(metrics.cpc)} />
          <DetailMetric label="CPM" value={formatCurrency(metrics.cpm)} />
          <DetailMetric label="Engagement" value={formatNumber(metrics.engagement)} />
        </div>
      </section>

      <section className="space-y-3 border-t pt-5">
        <SectionTitle>Conversiones</SectionTitle>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <DetailMetric label="Conversions" value={formatNumber(metrics.conversions)} />
          <DetailMetric
            label="Cost/Conv"
            value={formatCurrency(metrics.costPerConversion)}
          />
          <DetailMetric
            label="Purchase Value"
            value={formatCurrency(metrics.purchaseValue)}
          />
          <DetailMetric label="ROAS" value={formatMultiplier(metrics.roas)} />
        </div>
      </section>

      {showVideo ? (
        <section className="space-y-3 border-t pt-5">
          <SectionTitle>Video</SectionTitle>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <DetailMetric
              label="Reproducciones"
              value={formatNumber(metrics.videoPlayActions)}
            />
            <DetailMetric
              label="30 seg"
              value={formatNumber(metrics.video30SecWatchedActions)}
            />
            <DetailMetric
              label="ThruPlay"
              value={formatNumber(metrics.videoThruplayWatchedActions)}
            />
            <DetailMetric
              label="Tiempo promedio"
              value={formatSeconds(metrics.videoAvgTimeWatchedActions)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <DetailMetric
              label="Visto 25%"
              value={formatNumber(metrics.videoP25WatchedActions)}
            />
            <DetailMetric
              label="Visto 50%"
              value={formatNumber(metrics.videoP50WatchedActions)}
            />
            <DetailMetric
              label="Visto 75%"
              value={formatNumber(metrics.videoP75WatchedActions)}
            />
            <DetailMetric
              label="Visto 95%"
              value={formatNumber(metrics.videoP95WatchedActions)}
            />
            <DetailMetric
              label="Visto 100%"
              value={formatNumber(metrics.videoP100WatchedActions)}
            />
          </div>
        </section>
      ) : null}

      {showActions ? (
        <section className="space-y-3 border-t pt-5">
          <SectionTitle>Acciones de Meta</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actionEntries.map(([key, count]) => {
              const monetaryValue = metrics.actionValues[key];
              return (
                <div key={key} className="rounded-md border bg-background p-3">
                  <p className="text-xs font-medium">{formatActionKey(key)}</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">
                    {formatNumber(count)}
                  </p>
                  {monetaryValue != null && monetaryValue > 0 ? (
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {formatCurrency(monetaryValue)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {metrics.lastSyncedAt ? (
        <p className="border-t pt-4 text-xs text-muted-foreground">
          Última sync: {new Date(metrics.lastSyncedAt).toLocaleString("es-AR")}
        </p>
      ) : null}
    </div>
  );
}

function AdPreview({ ad }: { ad: ZernioLinkedAd }) {
  const [imageFailed, setImageFailed] = useState(false);
  const thumbnail = ad.creative?.thumbnailUrl;

  if (thumbnail && !imageFailed) {
    return (
      <Image
        src={thumbnail}
        alt=""
        width={40}
        height={40}
        unoptimized
        className="h-10 w-10 rounded-md bg-muted object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Megaphone className="h-4 w-4" aria-hidden="true" />
    </div>
  );
}

function AdTableRow({
  ad,
  expanded,
  onToggle,
}: {
  ad: ZernioLinkedAd;
  expanded: boolean;
  onToggle: () => void;
}) {
  const metrics = normalizeAdMetrics(ad.metrics);
  const budgetLabel =
    ad.budget?.type === "daily"
      ? `${formatCurrency(ad.budget.amount)}/día`
      : `${formatCurrency(ad.budget?.amount ?? 0)}/total`;

  const permalink = ad.creative?.instagramPermalinkUrl;

  return (
    <Fragment>
      <tr className="border-b">
        <td className="px-2 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-expanded={expanded}
            aria-label={expanded ? "Ocultar métricas" : "Ver métricas completas"}
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        </td>
        <td className="px-4 py-3">
          <AdPreview ad={ad} />
        </td>
        <td className="px-4 py-3">
          <div className="min-w-[200px]">
            <p className="text-sm font-medium">{ad.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{ad.campaignName}</p>
            {permalink ? (
              <a
                href={permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver en Instagram
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge
            variant="outline"
            className={cn("capitalize", statusBadgeClass(ad.status))}
          >
            {STATUS_LABELS[ad.status] ?? ad.status}
          </Badge>
        </td>
        <td className="px-4 py-3 text-sm tabular-nums">{budgetLabel}</td>
        <td className="px-4 py-3">
          <SpendBudgetBar spend={metrics.spend} budgetAmount={ad.budget?.amount ?? 0} />
        </td>
        <td className="px-4 py-3 text-sm tabular-nums">
          {formatNumber(metrics.impressions)}
        </td>
        <td className={cn("px-4 py-3 text-sm tabular-nums", roasColorClass(metrics.roas))}>
          {formatMultiplier(metrics.roas)}
        </td>
        <td className={cn("px-4 py-3 text-sm tabular-nums", ctrColorClass(metrics.ctr))}>
          {formatPercent(metrics.ctr)}
        </td>
      </tr>

      {expanded ? (
        <tr className="border-b bg-muted/5">
          <td colSpan={TABLE_COLUMN_COUNT} className="p-0">
            <AdExpandedDetails metrics={metrics} />
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

export function AdsDashboard({
  initialAds,
  initialError = null,
  initialRangeDays = 30,
}: Props) {
  const [ads, setAds] = useState(initialAds);
  const [error, setError] = useState<string | null>(initialError);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [rangeDays, setRangeDays] = useState<RangeDays>(initialRangeDays);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pending, startTransition] = useTransition();

  const kpis = useMemo(() => aggregateKpis(ads), [ads]);

  const sortedAds = useMemo(() => {
    if (!sortKey) return ads;
    return [...ads].sort((a, b) => {
      const ma = normalizeAdMetrics(a.metrics);
      const mb = normalizeAdMetrics(b.metrics);
      let valA = 0;
      let valB = 0;
      if (sortKey === "spend") { valA = ma.spend; valB = mb.spend; }
      else if (sortKey === "impressions") { valA = ma.impressions; valB = mb.impressions; }
      else if (sortKey === "roas") { valA = ma.roas; valB = mb.roas; }
      else if (sortKey === "ctr") { valA = ma.ctr; valB = mb.ctr; }
      else if (sortKey === "budget") { valA = a.budget?.amount ?? 0; valB = b.budget?.amount ?? 0; }
      return sortDir === "desc" ? valB - valA : valA - valB;
    });
  }, [ads, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const refetch = useCallback(
    (status: StatusFilter, platform: PlatformFilter, range: RangeDays) => {
      startTransition(async () => {
        const result = await getMarketingAdsAction(
          buildFilters(status, platform, range)
        );
        setAds(result.ads);
        setError(result.error ?? null);
        setExpandedIds(new Set());
      });
    },
    []
  );

  const handleStatusChange = (value: string) => {
    const next = value as StatusFilter;
    setStatusFilter(next);
    refetch(next, platformFilter, rangeDays);
  };

  const handlePlatformChange = (value: string) => {
    const next = value as PlatformFilter;
    setPlatformFilter(next);
    refetch(statusFilter, next, rangeDays);
  };

  const handleRangeChange = (value: string) => {
    const next = Number(value) as RangeDays;
    setRangeDays(next);
    refetch(statusFilter, platformFilter, next);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Anuncios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Meta Ads sincronizados en vivo desde Zernio
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricStat title="Gasto total" value={formatCurrency(kpis.spend)} />
        <MetricStat title="Impresiones" value={formatNumber(kpis.impressions)} />
        <MetricStat title="Alcance" value={formatNumber(kpis.reach)} />
        <MetricStat title="Conversiones totales" value={formatNumber(kpis.conversions)} />
        <MetricStat title="ROAS promedio" value={formatMultiplier(kpis.roasAvg)} />
        <MetricStat title="CTR promedio" value={formatPercent(kpis.ctrAvg)} />
        <MetricStat
          title="Costo/Conversión promedio"
          value={formatCurrency(kpis.costPerConvAvg)}
        />
        <MetricStat
          title="Valor de compras total"
          value={formatCurrency(kpis.purchaseValue)}
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <FilterPills
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusChange}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Plataforma</p>
          <FilterPills
            options={PLATFORM_OPTIONS}
            value={platformFilter}
            onChange={handlePlatformChange}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Período</p>
          <FilterPills
            options={RANGE_OPTIONS.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
            value={String(rangeDays)}
            onChange={handleRangeChange}
          />
        </div>
      </div>

      {pending ? <TableSkeleton /> : null}

      {!pending && error && ads.length === 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!pending && !error && ads.length === 0 ? (
        <EmptyState
          title="No hay anuncios"
          description="Cuando crees o boosteés contenido desde Meta Ads, aparecerán aquí automáticamente."
        />
      ) : null}

      {!pending && ads.length > 0 ? (
        <>
          <StatusSummary ads={ads} />
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-left">
              <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-10 px-2 py-3" aria-label="Expandir" />
                  <th className="px-4 py-3 font-medium">Preview</th>
                  <th className="px-4 py-3 font-medium">Nombre + Campaña</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <SortableHeader label="Budget" sortKey="budget" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Spend" sortKey="spend" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Impressions" sortKey="impressions" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="ROAS" sortKey="roas" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="CTR" sortKey="ctr" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {sortedAds.map((ad) => (
                  <AdTableRow
                    key={ad._id}
                    ad={ad}
                    expanded={expandedIds.has(ad._id)}
                    onToggle={() => toggleExpanded(ad._id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
