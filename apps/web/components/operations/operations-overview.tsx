"use client";

import { MetricGrid } from "@/components/shared/metric-grid";
import { Panel } from "@/components/shared/panel";
import { mockDashboard } from "@/mocks/dashboard";

export function OperationsOverview() {
  return (
    <div className="space-y-6">
      <MetricGrid metrics={mockDashboard.operationalMetrics} columns={2} />
      <Panel title="Resumen operativo (Fase 0 — mock)">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>· Carga del equipo al 72% — margen antes de cuello de botella</li>
          <li>· 4 cuellos de botella activos detectados por la IA</li>
          <li>· SOPs y Team Inputs disponibles en las pestañas del módulo</li>
        </ul>
      </Panel>
    </div>
  );
}
