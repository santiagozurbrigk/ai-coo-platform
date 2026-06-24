import { Panel } from "@/components/shared/panel";
import { DashboardMetricsBand } from "@/components/shared/metrics-band";
import type { DashboardMetric } from "@/types/dashboard";

export function RevenueMetricsSection({
  metrics,
}: {
  metrics: DashboardMetric[];
}) {
  return (
    <Panel title="Métricas de ingresos" subtitle="MRR, nuevos clientes y churn del mes">
      <DashboardMetricsBand metrics={metrics} />
    </Panel>
  );
}
