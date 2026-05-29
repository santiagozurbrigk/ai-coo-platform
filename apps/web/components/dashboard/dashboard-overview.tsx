"use client";

import { motion } from "framer-motion";
import { AiCard, BarChart } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { MetricGrid } from "@/components/shared/metric-grid";
import { Panel } from "@/components/shared/panel";
import { flowLinks } from "@/lib/navigation/flow-links";
import { paths } from "@/routes";
import type { DashboardData } from "@/types/dashboard";
import { ExecutiveSummary } from "./executive-summary";
import { RisksList } from "./risks-list";
import { OpportunitiesList } from "./opportunities-list";
import { WeeklyChanges } from "./weekly-changes";
import { NextActionsStrip } from "./next-actions-strip";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function DashboardOverview({
  data,
  chartTrend,
}: {
  data: DashboardData;
  chartTrend: { label: string; value: number }[];
}) {
  const allMetrics = [
    ...data.revenueMetrics,
    ...data.salesMetrics,
    ...data.operationalMetrics,
  ];

  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={{
        animate: { transition: { staggerChildren: 0.06 } },
      }}
    >
      <motion.div variants={fade} className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Métricas clave
        </h3>
        <MetricGrid metrics={allMetrics} columns={3} />
      </motion.div>

      <motion.div variants={fade}>
        <Panel
          title="Ingresos cobrados — últimos 7 días"
          contentClassName="p-0 pb-2"
        >
          <BarChart data={chartTrend} variant="line" height={220} />
        </Panel>
      </motion.div>

      <motion.div variants={fade}>
        <AiCard title="Recomendación de IA" variant="recommendation" confidence={0.88}>
          {data.aiRecommendation}
        </AiCard>
        <div className="mt-1 flex flex-wrap gap-x-4">
          <FlowCta
            href={flowLinks.recommendation("rec1")}
            label="Actualizar SOP de onboarding"
          />
          <FlowCta
            href={`${paths.platform.intelligence.root}#bottlenecks`}
            label="Ver cuellos de botella"
            className="text-muted-foreground"
          />
        </div>
      </motion.div>

      <motion.div variants={fade}>
        <ExecutiveSummary summary={data.executiveSummary} />
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        <RisksList risks={data.risks} />
        <OpportunitiesList opportunities={data.opportunities} />
      </motion.div>

      <motion.div variants={fade}>
        <WeeklyChanges changes={data.weeklyChanges} />
      </motion.div>

      <motion.div variants={fade}>
        <NextActionsStrip />
      </motion.div>
    </motion.div>
  );
}
