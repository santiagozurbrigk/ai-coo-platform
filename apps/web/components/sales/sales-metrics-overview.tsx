import { BarChart, DataTable, MetricCard } from "@ai-coo/ui";
import { formatPercent } from "@/lib/format";
import type { SalesMetricsData } from "@/types/sales";
import { Panel } from "@/components/shared";

export function SalesMetricsOverview({ data }: { data: SalesMetricsData }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tasa de agendamiento"
          value={formatPercent(data.bookingRate)}
          trend="up"
          trendValue="+4,1%"
        />
        <MetricCard
          title="Tasa de fantasma"
          value={formatPercent(data.ghostingRate)}
          trend="down"
          trendValue="-2,3%"
        />
        <MetricCard title="Respuesta promedio" value={`${data.avgResponseMin} min`} />
        <MetricCard title="Mensajes / agendamiento" value={String(data.messagesPerBooking)} />
      </div>

      <Panel title="Tendencia de agendamientos">
        <BarChart data={data.bookingTrend} />
      </Panel>

      <DataTable
        title="Rendimiento por setter"
        columns={[
          { key: "name", header: "Setter", cell: (r) => r.name },
          {
            key: "booking",
            header: "Agendamiento",
            cell: (r) => formatPercent(r.bookingRate),
          },
          { key: "ghost", header: "Fantasma", cell: (r) => formatPercent(r.ghostingRate) },
          {
            key: "response",
            header: "Respuesta prom.",
            cell: (r) => `${r.avgResponseMin} min`,
          },
          { key: "active", header: "Activas", cell: (r) => r.activeConversations },
        ]}
        data={data.setterMetrics}
        keyExtractor={(r) => r.setterId}
      />
    </div>
  );
}
