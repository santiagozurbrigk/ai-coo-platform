"use client";

import {
  GaugeTargetChart,
  TrendLineChart,
} from "@/components/charts/platform";
import { BentoCellPlace, BentoGrid } from "@/components/shared/bento-grid";
import { Panel } from "@/components/shared/panel";
import { MetricChartPanel } from "@/components/charts/platform/metric-chart-panel";
import { formatPercent } from "@/lib/format";
import { padTimeSeriesZeros } from "@/lib/chart/pad-time-series";
import type { SalesMetricsData } from "@/types/sales";
import { CloserPerformancePanel } from "./closer-performance-panel";
import { cn } from "@/lib/utils";

function InlineStats({ data }: { data: SalesMetricsData }) {
  const items = [
    { label: "Conversaciones totales", value: String(data.totalConversations) },
    { label: "Activas", value: String(data.activeConversations) },
    { label: "Sin responder", value: String(data.unansweredConversations) },
    { label: "Mensajes / agend.", value: String(data.messagesPerBooking) },
    { label: "Retraso follow-up", value: `${data.followUpDelayHours} h` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 ? (
            <span className="text-muted-foreground/40" aria-hidden>
              |
            </span>
          ) : null}
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="font-semibold tabular-nums">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

export function SalesMetricsOverview({ data }: { data: SalesMetricsData }) {
  const bookingTrend = padTimeSeriesZeros(data.bookingTrend, 7);

  return (
    <div className="space-y-8">
      <CloserPerformancePanel closers={data.closerBreakdown} />

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Rendimiento del equipo
        </h3>
        <BentoGrid>
          <BentoCellPlace className="col-span-2 row-span-2 lg:col-span-2 lg:row-span-2">
            <MetricChartPanel
              title="Tasa de agendamiento"
              value={formatPercent(data.bookingRate)}
              subtitle="Objetivo 70%"
              className="min-h-[280px]"
            >
              <GaugeTargetChart
                value={data.bookingRate}
                max={100}
                target={70}
                label="Agendamiento"
                variant="booking"
              />
            </MetricChartPanel>
          </BentoCellPlace>

          <BentoCellPlace className="col-span-2 row-span-1 lg:col-span-2 lg:col-start-3 lg:row-start-1">
            <MetricChartPanel
              title="Tasa de fantasma"
              value={formatPercent(data.ghostingRate)}
              subtitle="Objetivo &lt; 20%"
              className="min-h-[140px]"
            >
              <GaugeTargetChart
                value={data.ghostingRate}
                max={100}
                target={20}
                label="Fantasma"
                variant="inverted"
              />
            </MetricChartPanel>
          </BentoCellPlace>

          <BentoCellPlace className="col-span-2 row-span-1 lg:col-span-2 lg:col-start-3 lg:row-start-2">
            <MetricChartPanel
              title="Tiempo de respuesta"
              value={`${data.avgResponseMin} min`}
              subtitle="Objetivo &lt; 10 min"
              className="min-h-[140px]"
            >
              <GaugeTargetChart
                value={Math.min(100, (data.avgResponseMin / 30) * 100)}
                max={100}
                target={33}
                label="Respuesta"
                displayValue={data.avgResponseMin}
                suffix=" min"
                variant="inverted"
              />
            </MetricChartPanel>
          </BentoCellPlace>
        </BentoGrid>
      </section>

      <Panel
        title="Tendencia de agendamientos — últimos 7 días"
        contentClassName="p-4"
      >
        <div className={cn("min-h-[280px]")}>
          <TrendLineChart
            data={bookingTrend}
            emptyMessage="Sin suficientes días con agendamientos"
          />
        </div>
      </Panel>

      <InlineStats data={data} />
    </div>
  );
}
