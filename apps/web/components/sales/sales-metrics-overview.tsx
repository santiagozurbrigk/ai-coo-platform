import { MetricCard } from "@ai-coo/ui";
import { TrendLineChart } from "@/components/charts/platform";
import { formatPercent } from "@/lib/format";
import { sparklineProps } from "@/lib/metrics/sparkline-series";
import type { SalesMetricsData } from "@/types/sales";
import { Panel } from "@/components/shared/panel";
import { CloserPerformancePanel } from "./closer-performance-panel";

export function SalesMetricsOverview({ data }: { data: SalesMetricsData }) {
  return (
    <div className="space-y-8">
      <CloserPerformancePanel closers={data.closerBreakdown} />

      <Panel title="Rendimiento global del equipo de ventas">
        <p className="mb-4 text-sm text-muted-foreground">
          Métricas unificadas de la operación comercial en bandeja (ManyChat).
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Conversaciones totales" value={String(data.totalConversations)} />
          <MetricCard
            title="Tasa de agendamiento"
            value={formatPercent(data.bookingRate)}
            trend="up"
            trendValue="+4,1%"
            {...sparklineProps("bookingRate", 100)}
          />
          <MetricCard
            title="Tiempo de respuesta prom."
            value={`${data.avgResponseMin} min`}
            {...sparklineProps("responseTime", 200)}
          />
          <MetricCard
            title="Tasa de fantasma"
            value={formatPercent(data.ghostingRate)}
            trend="down"
            trendValue="-2,3%"
            {...sparklineProps("ghostingRate", 300)}
          />
          <MetricCard title="Mensajes / agendamiento" value={String(data.messagesPerBooking)} />
          <MetricCard title="Retraso en follow-up" value={`${data.followUpDelayHours} h`} />
          <MetricCard
            title="Conversaciones activas"
            value={String(data.activeConversations)}
            {...sparklineProps("conversations", 400)}
          />
          <MetricCard
            title="Sin responder"
            value={String(data.unansweredConversations)}
            trend="down"
            trendValue="-3"
          />
        </div>
      </Panel>

      <Panel title="Tendencia de agendamientos" contentClassName="p-0 pb-2">
        <div className="px-2 pb-2">
          <TrendLineChart data={data.bookingTrend} className="min-h-[220px]" />
        </div>
      </Panel>
    </div>
  );
}
