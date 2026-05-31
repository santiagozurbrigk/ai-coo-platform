"use client";

import {
  CategoryBarChart,
  GaugeTargetChart,
  MetricChartPanel,
} from "@/components/charts/platform";
import { Panel } from "@/components/shared/panel";
import { mockDashboard } from "@/mocks/dashboard";

const TEAM_LOAD = 72;
const BOTTLENECKS = [
  { label: "Ventas", value: 2 },
  { label: "Delivery", value: 1 },
  { label: "Operaciones", value: 1 },
];

export function OperationsOverview() {
  const loadMetric = mockDashboard.operationalMetrics.find((m) => m.id === "o1");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricChartPanel
          title="Carga del equipo"
          value={loadMetric?.value ?? `${TEAM_LOAD}%`}
          subtitle="Zona de alerta desde 85%"
          className="min-h-[240px]"
        >
          <GaugeTargetChart
            value={TEAM_LOAD}
            max={100}
            target={70}
            label="Carga"
            variant="margin"
            subtitle="Verde &lt; 70% · Ámbar 70–85% · Rojo &gt; 85%"
          />
        </MetricChartPanel>

        <MetricChartPanel
          title="Cuellos de botella"
          value="4 activos"
          subtitle="Por departamento"
          className="min-h-[240px]"
        >
          <CategoryBarChart
            items={BOTTLENECKS}
            horizontal
            className="min-h-[200px]"
          />
        </MetricChartPanel>
      </div>

      <Panel title="Resumen operativo">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>· Carga del equipo al 72% — margen antes de cuello de botella</li>
          <li>· 4 cuellos de botella activos detectados por la IA</li>
          <li>· SOPs y Team Inputs disponibles en las pestañas del módulo</li>
        </ul>
      </Panel>
    </div>
  );
}
