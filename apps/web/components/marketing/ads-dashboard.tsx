"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { ExternalLink, Megaphone } from "lucide-react";
import {
  getMarketingAdsAction,
  type MarketingAdsFilters,
} from "@/app/marketing/content/ad-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterPills } from "@/components/marketing/filter-pills";
import type { ZernioAdStatus, ZernioLinkedAd } from "@/lib/zernio/client";
import { Badge, cn, MetricBand, MetricStat, Skeleton } from "@ai-coo/ui";

type Props = {
  initialAds: ZernioLinkedAd[];
  initialError?: string | null;
  initialRangeDays?: 7 | 30 | 90;
};

type StatusFilter = "all" | "active" | "paused" | "error";
type PlatformFilter = "all" | "facebook" | "instagram";
type RangeDays = 7 | 30 | 90;

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

function formatMoney(value: number): string {
  return `$${value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatNumber(value: number): string {
  return value.toLocaleString("es-AR");
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
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
  const spend = ads.reduce((sum, ad) => sum + (ad.metrics?.spend ?? 0), 0);
  const impressions = ads.reduce(
    (sum, ad) => sum + (ad.metrics?.impressions ?? 0),
    0
  );
  const roasValues = ads
    .map((ad) => ad.metrics?.roas ?? 0)
    .filter((value) => value > 0);
  const ctrValues = ads.map((ad) => ad.metrics?.ctr ?? 0);

  const roasAvg =
    roasValues.length > 0
      ? roasValues.reduce((sum, value) => sum + value, 0) / roasValues.length
      : 0;
  const ctrAvg =
    ctrValues.length > 0
      ? ctrValues.reduce((sum, value) => sum + value, 0) / ctrValues.length
      : 0;

  return { spend, impressions, roasAvg, ctrAvg };
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-muted/30 px-4 py-3">
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
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

function AdTableRow({ ad }: { ad: ZernioLinkedAd }) {
  const metrics = ad.metrics ?? {
    spend: 0,
    impressions: 0,
    ctr: 0,
    roas: 0,
    reach: 0,
    clicks: 0,
    cpc: 0,
    cpm: 0,
    conversions: 0,
    costPerConversion: 0,
  };

  const budgetLabel =
    ad.budget?.type === "daily"
      ? `${formatMoney(ad.budget.amount)}/día`
      : `${formatMoney(ad.budget?.amount ?? 0)}/total`;

  const permalink = ad.creative?.instagramPermalinkUrl;

  const handleRowClick = () => {
    if (!permalink) return;
    window.open(permalink, "_blank", "noopener,noreferrer");
  };

  return (
    <tr
      className={cn(
        "border-b last:border-b-0",
        permalink && "cursor-pointer hover:bg-muted/40"
      )}
      onClick={handleRowClick}
      onKeyDown={(event) => {
        if (!permalink) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleRowClick();
        }
      }}
      tabIndex={permalink ? 0 : undefined}
      role={permalink ? "link" : undefined}
      aria-label={permalink ? `Ver en Instagram: ${ad.name}` : undefined}
    >
      <td className="px-4 py-3">
        <AdPreview ad={ad} />
      </td>
      <td className="px-4 py-3">
        <div className="min-w-[180px]">
          <p className="text-sm font-medium">{ad.name}</p>
          {permalink ? (
            <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary">
              Ver en Instagram
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{ad.campaignName}</td>
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          className={cn("capitalize", statusBadgeClass(ad.status))}
        >
          {STATUS_LABELS[ad.status] ?? ad.status}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums">{budgetLabel}</td>
      <td className="px-4 py-3 text-sm tabular-nums">{formatMoney(metrics.spend)}</td>
      <td className="px-4 py-3 text-sm tabular-nums">
        {formatNumber(metrics.impressions)}
      </td>
      <td className="px-4 py-3 text-sm tabular-nums">{formatPercent(metrics.ctr)}</td>
      <td className="px-4 py-3 text-sm tabular-nums">{metrics.roas.toFixed(2)}x</td>
    </tr>
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
  const [pending, startTransition] = useTransition();

  const kpis = useMemo(() => aggregateKpis(ads), [ads]);

  const refetch = useCallback(
    (status: StatusFilter, platform: PlatformFilter, range: RangeDays) => {
      startTransition(async () => {
        const result = await getMarketingAdsAction(
          buildFilters(status, platform, range)
        );
        setAds(result.ads);
        setError(result.error ?? null);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Anuncios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Meta Ads sincronizados en vivo desde Zernio
        </p>
      </div>

      <MetricBand glass>
        <MetricStat title="Gasto total" value={formatMoney(kpis.spend)} />
        <MetricStat title="Impresiones" value={formatNumber(kpis.impressions)} />
        <MetricStat title="ROAS promedio" value={`${kpis.roasAvg.toFixed(2)}x`} />
        <MetricStat title="CTR promedio" value={formatPercent(kpis.ctrAvg)} />
      </MetricBand>

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
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-left">
            <thead className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Preview</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Campaña</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Gasto</th>
                <th className="px-4 py-3 font-medium">Impresiones</th>
                <th className="px-4 py-3 font-medium">CTR</th>
                <th className="px-4 py-3 font-medium">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <AdTableRow key={ad._id} ad={ad} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
