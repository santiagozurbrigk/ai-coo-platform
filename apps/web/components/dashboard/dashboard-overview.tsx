"use client";

import { motion } from "framer-motion";
import type { DashboardData } from "@/types/dashboard";
import type { WeeklyReportRow } from "@/types/operations";
import { ExecutiveSummary } from "./executive-summary";
import { RisksList } from "./risks-list";
import { OpportunitiesList } from "./opportunities-list";
import { RevenueMetricsSection } from "./revenue-metrics-section";
import { SalesMetricsSection } from "./sales-metrics-section";
import { OperationalMetricsSection } from "./operational-metrics-section";
import { AiRecommendations } from "./ai-recommendations";
import { WeeklyChanges } from "./weekly-changes";
import { NextActionsStrip } from "./next-actions-strip";
import { DashboardEmptyState } from "./dashboard-empty-state";
import { ZernioAnalyticsSection } from "./zernio-analytics-section";
import type { ZernioAnalyticsSummary } from "@/app/integrations/zernio/actions";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function DashboardOverview({
  data,
  weeklyReport,
  zernioAnalytics,
}: {
  data: DashboardData;
  weeklyReport?: WeeklyReportRow | null;
  zernioAnalytics?: ZernioAnalyticsSummary;
}) {
  if (data.isEmpty) {
    return <DashboardEmptyState />;
  }

  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={{
        animate: { transition: { staggerChildren: 0.06 } },
      }}
    >
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

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        <RisksList risks={data.risks} />
        <OpportunitiesList opportunities={data.opportunities} />
      </motion.div>

      <motion.div variants={fade}>
        <RevenueMetricsSection metrics={data.revenueMetrics} />
      </motion.div>

      <motion.div variants={fade}>
        <SalesMetricsSection metrics={data.salesMetrics} />
      </motion.div>

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

      <motion.div variants={fade}>
        <OperationalMetricsSection metrics={data.dashboardOperationalMetrics} />
      </motion.div>

      <motion.div variants={fade}>
        <AiRecommendations recommendations={data.aiRecommendations} />
      </motion.div>

      <motion.div variants={fade}>
        <WeeklyChanges changes={data.weeklyChanges} />
      </motion.div>

      <motion.div variants={fade}>
        <NextActionsStrip weeklyReport={weeklyReport} />
      </motion.div>
    </motion.div>
  );
}
