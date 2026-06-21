"use client";

import { ArrowRight } from "lucide-react";
import { MetricCard, SectionHeader, type MetricTrend } from "@ai-coo/ui";
import type { MarketingOverviewMetrics } from "@/types/marketing-insights";
import {
  additionalMarketingMetrics,
  mockMarketingOverview,
} from "@/mocks/marketing";
import { RateBar } from "./rate-bar";

const ACCENT = {
  reach: "#7C3AED",
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

  return (
    <div className="space-y-6">
      <section>
        <SectionHeader title="Alcance y contenido" variant="uppercase" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Alcance total"
            value={formatNum(m.totalReach)}
            subtitle="Últimos 30 días"
            trendValue={formatTrend(m.reachTrendPct)}
            trend={trendFromFormatted(formatTrend(m.reachTrendPct))}
            sparklinePreset="reach"
            sparklineColor={ACCENT.reach}
            glass
            showProgressBar={false}
          />
          <MetricCard
            title="Interacciones totales"
            value={formatNum(m.totalInteractions)}
            subtitle={`Engagement ${m.engagementRatePct}%`}
            trendValue={formatTrend(m.interactionsTrendPct)}
            trend={trendFromFormatted(formatTrend(m.interactionsTrendPct))}
            sparklinePreset="engage"
            sparklineColor={ACCENT.reach}
            glass
            showProgressBar={false}
          />
          <MetricCard
            title="Contenido publicado"
            value={String(m.contentPublished)}
            glass
            showProgressBar={false}
          >
            <div className="mt-2 flex flex-wrap gap-2">
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
          </MetricCard>
        </div>
      </section>

      {!metricsProp ? (
        <section>
          <SectionHeader title="Engagement" variant="uppercase" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Respuestas a historias"
              value={formatNum(extra.storyReplies.value)}
              subtitle="Últimos 30 días"
              trendValue={formatTrend(extra.storyReplies.trend)}
              trend={trendFromFormatted(formatTrend(extra.storyReplies.trend))}
              sparklinePreset="growth"
              sparklineColor={ACCENT.engagement}
              glass
              showProgressBar={false}
            />
            <MetricCard
              title="Comentarios totales"
              value={formatNum(extra.totalComments.value)}
              subtitle="Últimos 30 días"
              trendValue={formatTrend(extra.totalComments.trend)}
              trend={trendFromFormatted(formatTrend(extra.totalComments.trend))}
              sparklinePreset="comments"
              sparklineColor={ACCENT.engagement}
              glass
              showProgressBar={false}
            />
            <MetricCard
              title="Crecimiento del perfil"
              value={`+${formatNum(extra.profileGrowth.value)}`}
              subtitle={extra.profileGrowth.label ?? "Nuevos seguidores"}
              trendValue={formatTrend(extra.profileGrowth.trend)}
              trend={trendFromFormatted(formatTrend(extra.profileGrowth.trend))}
              glass
              showProgressBar={false}
            >
              <RateBar
                label="Views → Seguidores"
                value={extra.viewsToFollowersRate.value}
                color={ACCENT.engagement}
              />
            </MetricCard>
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Conversión a ventas" variant="uppercase" />
        <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_28px_1fr_28px_1fr] lg:gap-0">
          <MetricCard
            title="Conversaciones generadas"
            value={String(m.conversationsGenerated)}
            subtitle="Vinculadas a bandeja"
            sparklinePreset="convert"
            sparklineColor={ACCENT.conversion}
            glass
            showProgressBar={false}
          />

          <div className="hidden items-center justify-center text-muted-foreground lg:flex">
            <ArrowRight className="h-4 w-4" />
          </div>

          <MetricCard
            title="Bookings influenciados"
            value={String(m.bookingsInfluenced)}
            subtitle={`${m.bookingsInfluencedPct}% del total de bookings`}
            glass
            showProgressBar={false}
          >
            <RateBar
              label=""
              value={m.bookingsInfluencedPct}
              color={ACCENT.conversion}
            />
          </MetricCard>

          <div className="hidden items-center justify-center text-muted-foreground lg:flex">
            <ArrowRight className="h-4 w-4" />
          </div>

          <MetricCard
            title="Ventas influenciadas"
            value={String(m.salesInfluenced)}
            subtitle={`$${m.revenueInfluenced.toLocaleString("es-ES")} atribuidos`}
            glass
            showProgressBar={false}
          >
            <RateBar
              label="Conv. booking → venta"
              value={bookingToSalePct}
              color={ACCENT.conversion}
            />
          </MetricCard>
        </div>
      </section>
    </div>
  );
}
