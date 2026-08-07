"use client";

import { motion } from "framer-motion";
import type { DashboardData } from "@/types/dashboard";
import type { WeeklyReportRow } from "@/types/operations";
import { ExecutiveSummary } from "./executive-summary";
import { AlertsIntelligence } from "./alerts-intelligence";
import { RevenueMetricsSection } from "./revenue-metrics-section";
import { SalesMetricsSection } from "./sales-metrics-section";
import { OperationalMetricsSection } from "./operational-metrics-section";
import { AiRecommendations } from "./ai-recommendations";
import { WeeklyChanges } from "./weekly-changes";
import { NextActionsStrip } from "./next-actions-strip";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { ZernioAnalyticsSection } from "./zernio-analytics-section";
import { TopKpiRow } from "./top-kpi-row";
import { SalesFunnelStrip } from "./sales-funnel-strip";
import { CustomMetricsSection } from "./custom-metrics-section";
import type { ZernioAnalyticsSummary } from "@/app/integrations/zernio/actions";
import type { ComputedCustomMetric } from "@/lib/metrics/custom-metrics";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function DashboardOverview({
  data,
  weeklyReport,
  zernioAnalytics,
  customMetrics = [],
}: {
  data: DashboardData;
  weeklyReport?: WeeklyReportRow | null;
  zernioAnalytics?: ZernioAnalyticsSummary;
  customMetrics?: ComputedCustomMetric[];
}) {
  if (data.isEmpty) {
    return <DashboardEmptyState />;
  }

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={{
        animate: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {/* 1 — KPIs de un vistazo */}
      <motion.div variants={fade}>
        <TopKpiRow
          revenueMetrics={data.revenueMetrics}
          salesMetrics={data.salesMetrics}
        />
      </motion.div>

      {/* 1b — Métricas personalizadas (temporalmente oculto) */}
      {/* <motion.div variants={fade}>
        <CustomMetricsSection initialMetrics={customMetrics} />
      </motion.div> */}

      {/* 2 — Qué hacer ahora */}
      <motion.div variants={fade}>
        <NextActionsStrip weeklyReport={weeklyReport} />
      </motion.div>

      {/* 3 — Embudo de conversión */}
      <motion.div variants={fade}>
        <SalesFunnelStrip />
      </motion.div>

      {/* 4 — Alertas: riesgos + oportunidades */}
      <motion.div variants={fade}>
        <AlertsIntelligence
          risks={data.risks}
          opportunities={data.opportunities}
        />
      </motion.div>

      {/* 5 — Métricas de ingresos con sparklines */}
      <motion.div variants={fade}>
        <RevenueMetricsSection metrics={data.revenueMetrics} />
      </motion.div>

      {/* 6 — Métricas de ventas con sparklines */}
      <motion.div variants={fade}>
        <SalesMetricsSection metrics={data.salesMetrics} />
      </motion.div>

      {/* 7 — Redes sociales con engagement visual */}
      <motion.div variants={fade}>
        <ZernioAnalyticsSection
          analytics={
            zernioAnalytics ?? {
              totalImpressions: 0,
              totalLikes: 0,
              totalComments: 0,
              hasData: false,
            }
          }
        />
      </motion.div>

      {/* 8 — Métricas operacionales */}
      <motion.div variants={fade}>
        <OperationalMetricsSection metrics={data.dashboardOperationalMetrics} />
      </motion.div>

      {/* 9 — Recomendaciones IA */}
      <motion.div variants={fade}>
        <AiRecommendations recommendations={data.aiRecommendations} />
      </motion.div>

      {/* 10 — Cambios semanales */}
      <motion.div variants={fade}>
        <WeeklyChanges changes={data.weeklyChanges} />
      </motion.div>

      {/* 11 — Resumen ejecutivo */}
      <motion.div variants={fade}>
        <ExecutiveSummary
          summary={data.executiveSummary}
          detailHref={data.weeklyReportCtaHref}
          detailLabel={
            data.weeklyReportCtaHref
              ? "Completar inputs semanales"
              : undefined
          }
        />
      </motion.div>
    </motion.div>
  );
}
