"use client";

import { SalesMetricsOverview } from "@/components/sales";
import { SalesPerformanceMetricsSection } from "@/components/sales/sales-performance-metrics-section";
import { usePlatformData } from "@/providers";
import type { FrequentObjectionsResult } from "@/types/sales";

export function SalesMetricsPageContent({
  frequentObjections,
}: {
  frequentObjections?: FrequentObjectionsResult;
}) {
  const { salesMetrics, salesMetricsLoading } = usePlatformData();

  if (salesMetricsLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
        Cargando métricas de ventas…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SalesPerformanceMetricsSection />
      <SalesMetricsOverview
        data={salesMetrics}
        frequentObjections={frequentObjections}
      />
    </div>
  );
}
