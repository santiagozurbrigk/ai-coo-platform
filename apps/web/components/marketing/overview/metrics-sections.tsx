"use client";

import { ArrowRight } from "lucide-react";
import type { MarketingOverviewMetrics } from "@/types/marketing-insights";
import {
  additionalMarketingMetrics,
  mockMarketingOverview,
} from "@/mocks/marketing";
import { MarketingOverviewMetricCard } from "./metric-card";
import { RateBar } from "./rate-bar";
import { SectionHeader } from "./section-header";

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
        <SectionHeader label="Alcance y contenido" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MarketingOverviewMetricCard
            label="Alcance total"
            value={formatNum(m.totalReach)}
            sub="Últimos 30 días"
            badge={formatTrend(m.reachTrendPct)}
            sparkline="reach"
            sparklineColor={ACCENT.reach}
          />
          <MarketingOverviewMetricCard
            label="Interacciones totales"
            value={formatNum(m.totalInteractions)}
            sub={`Engagement ${m.engagementRatePct}%`}
            badge={formatTrend(m.interactionsTrendPct)}
            sparkline="engage"
            sparklineColor={ACCENT.reach}
          />
          <MarketingOverviewMetricCard
            label="Contenido publicado"
            value={String(m.contentPublished)}
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
          </MarketingOverviewMetricCard>
        </div>
      </section>

      {!metricsProp ? (
      <section>
        <SectionHeader label="Engagement" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MarketingOverviewMetricCard
            label="Respuestas a historias"
            value={formatNum(extra.storyReplies.value)}
            sub="Últimos 30 días"
            badge={formatTrend(extra.storyReplies.trend)}
            sparkline="growth"
            sparklineColor={ACCENT.engagement}
          />
          <MarketingOverviewMetricCard
            label="Comentarios totales"
            value={formatNum(extra.totalComments.value)}
            sub="Últimos 30 días"
            badge={formatTrend(extra.totalComments.trend)}
            sparkline="comments"
            sparklineColor={ACCENT.engagement}
          />
          <MarketingOverviewMetricCard
            label="Crecimiento del perfil"
            value={`+${formatNum(extra.profileGrowth.value)}`}
            sub={extra.profileGrowth.label ?? "Nuevos seguidores"}
            badge={formatTrend(extra.profileGrowth.trend)}
          >
            <RateBar
              label="Views → Seguidores"
              value={extra.viewsToFollowersRate.value}
              color={ACCENT.engagement}
            />
          </MarketingOverviewMetricCard>
        </div>
      </section>
      ) : null}

      <section>
        <SectionHeader label="Conversión a ventas" />
        <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_28px_1fr_28px_1fr] lg:gap-0">
          <MarketingOverviewMetricCard
            label="Conversaciones generadas"
            value={String(m.conversationsGenerated)}
            sub="Vinculadas a bandeja"
            sparkline="convert"
            sparklineColor={ACCENT.conversion}
          />

          <div className="hidden items-center justify-center text-muted-foreground lg:flex">
            <ArrowRight className="h-4 w-4" />
          </div>

          <MarketingOverviewMetricCard
            label="Bookings influenciados"
            value={String(m.bookingsInfluenced)}
            sub={`${m.bookingsInfluencedPct}% del total de bookings`}
          >
            <RateBar label="" value={m.bookingsInfluencedPct} color={ACCENT.conversion} />
          </MarketingOverviewMetricCard>

          <div className="hidden items-center justify-center text-muted-foreground lg:flex">
            <ArrowRight className="h-4 w-4" />
          </div>

          <MarketingOverviewMetricCard
            label="Ventas influenciadas"
            value={String(m.salesInfluenced)}
            sub={`$${m.revenueInfluenced.toLocaleString("es-ES")} atribuidos`}
          >
            <RateBar
              label="Conv. booking → venta"
              value={bookingToSalePct}
              color={ACCENT.conversion}
            />
          </MarketingOverviewMetricCard>
        </div>
      </section>
    </div>
  );
}
