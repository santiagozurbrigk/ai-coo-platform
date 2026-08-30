"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import {
  MetricBand,
  MetricStat,
  SectionHeader,
  cn,
  type MetricTrend,
} from "@ai-coo/ui";
import type { MarketingOverviewMetrics } from "@/types/marketing-insights";
import {
  additionalMarketingMetrics,
  mockMarketingOverview,
} from "@/mocks/marketing";
import { RateBar } from "./rate-bar";
import { brandColors } from "@/lib/brand";

const ACCENT = {
  reach: brandColors.primary,
  engagement: "#0F6E56",
  conversion: "#185FA5",
} as const;

function formatNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("es-ES");
}

function formatTrend(trend: number) {
  const sign = trend >= 0 ? "+" : "";
  return `${sign}${trend}%`;
}

function trendFromFormatted(value: string): MetricTrend {
  if (value.startsWith("-")) return "down";
  if (value.startsWith("+")) return "up";
  return "neutral";
}

function FunnelArrow() {
  return (
    <div className="hidden items-center justify-center px-1 text-muted-foreground lg:flex">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

function ConversionFunnelBand({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "metric-band overflow-hidden rounded-2xl border border-border bg-card shadow-band",
        "dark:border-glass dark:bg-glass dark:backdrop-blur-md"
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_28px_1fr_28px_1fr] lg:items-stretch">
        {children}
      </div>
    </div>
  );
}

function FunnelCell({ children }: { children: ReactNode }) {
  return (
    <div className="metric-band-cell min-w-0 border-border px-[var(--space-metric-band-x)] py-[var(--space-metric-band-y)] lg:border-l lg:first:border-l-0">
      {children}
    </div>
  );
}

export function MarketingMetricsSections({
  metrics: metricsProp,
}: {
  metrics?: MarketingOverviewMetrics;
}) {
  const m = metricsProp ?? mockMarketingOverview;
  const extra = additionalMarketingMetrics;
  const bookingToSalePct =
    m.bookingsInfluenced > 0
      ? Math.round((m.salesInfluenced / m.bookingsInfluenced) * 100)
      : 0;

  const storyReplies = metricsProp
    ? { value: m.storyReplies, trend: m.storyRepliesTrendPct }
    : extra.storyReplies;
  const totalComments = metricsProp
    ? { value: m.commentsTotal, trend: m.commentsTrendPct }
    : extra.totalComments;
  const profileGrowth = metricsProp
    ? {
        value: m.newFollowers,
        trend: m.profileGrowthTrendPct,
        label: "Nuevos seguidores",
      }
    : extra.profileGrowth;
  const viewsToFollowers = metricsProp
    ? { value: m.viewsToFollowersRate, trend: m.profileGrowthTrendPct }
    : extra.viewsToFollowersRate;

  const showEngagement =
    !metricsProp ||
    storyReplies.value > 0 ||
    totalComments.value > 0 ||
    profileGrowth.value > 0 ||
    m.followers > 0;

  return (
    <div className="space-y-6">
      <section>
        <SectionHeader title="Alcance y contenido" variant="uppercase" />
        <MetricBand glass>
          <MetricStat
            title="Alcance total"
            value={formatNum(m.totalReach)}
            subtitle="Últimos 30 días"
            trendValue={formatTrend(m.reachTrendPct)}
            trend={trendFromFormatted(formatTrend(m.reachTrendPct))}
            sparklinePreset="reach"
            sparklineColor={ACCENT.reach}
          />
          <MetricStat
            title="Interacciones totales"
            value={formatNum(m.totalInteractions)}
            subtitle={`Engagement ${m.engagementRatePct}%`}
            trendValue={formatTrend(m.interactionsTrendPct)}
            trend={trendFromFormatted(formatTrend(m.interactionsTrendPct))}
            sparklinePreset="engage"
            sparklineColor={ACCENT.reach}
          />
          <MetricStat title="Contenido publicado" value={String(m.contentPublished)}>
            <div className="flex flex-wrap gap-2">
              {[
                `${m.reelsCount} reels`,
                `${m.postsCount} posts`,
                `${m.storiesCount} stories`,
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border/40 bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </MetricStat>
        </MetricBand>
      </section>

      {showEngagement ? (
        <section>
          <SectionHeader title="Engagement" variant="uppercase" />
          <MetricBand glass>
            <MetricStat
              title="Respuestas a historias"
              value={formatNum(storyReplies.value)}
              subtitle="Últimos 30 días"
              trendValue={formatTrend(storyReplies.trend)}
              trend={trendFromFormatted(formatTrend(storyReplies.trend))}
              sparklinePreset="growth"
              sparklineColor={ACCENT.engagement}
            />
            <MetricStat
              title="Comentarios totales"
              value={formatNum(totalComments.value)}
              subtitle="Últimos 30 días"
              trendValue={formatTrend(totalComments.trend)}
              trend={trendFromFormatted(formatTrend(totalComments.trend))}
              sparklinePreset="comments"
              sparklineColor={ACCENT.engagement}
            />
            <MetricStat
              title="Crecimiento del perfil"
              value={`+${formatNum(profileGrowth.value)}`}
              subtitle={profileGrowth.label ?? "Nuevos seguidores"}
              trendValue={formatTrend(profileGrowth.trend)}
              trend={trendFromFormatted(formatTrend(profileGrowth.trend))}
            >
              <RateBar
                label="Views → Seguidores"
                value={viewsToFollowers.value}
                color={ACCENT.engagement}
              />
            </MetricStat>
          </MetricBand>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Conversión a ventas" variant="uppercase" />
        <ConversionFunnelBand>
          <FunnelCell>
            <MetricStat
              title="Conversaciones generadas"
              value={String(m.conversationsGenerated)}
              subtitle="Vinculadas a bandeja"
              sparklinePreset="convert"
              sparklineColor={ACCENT.conversion}
            />
          </FunnelCell>

          <FunnelArrow />

          <FunnelCell>
            <MetricStat
              title="Bookings influenciados"
              value={String(m.bookingsInfluenced)}
              subtitle={`${m.bookingsInfluencedPct}% del total de bookings`}
            >
              <RateBar
                label=""
                value={m.bookingsInfluencedPct}
                color={ACCENT.conversion}
              />
            </MetricStat>
          </FunnelCell>

          <FunnelArrow />

          <FunnelCell>
            <MetricStat
              title="Ventas influenciadas"
              value={String(m.salesInfluenced)}
              subtitle={`$${m.revenueInfluenced.toLocaleString("es-ES")} atribuidos`}
            >
              <RateBar
                label="Conv. booking → venta"
                value={bookingToSalePct}
                color={ACCENT.conversion}
              />
            </MetricStat>
          </FunnelCell>
        </ConversionFunnelBand>
      </section>
    </div>
  );
}
