"use client";

import { motion } from "framer-motion";
import { AiCard } from "@ai-coo/ui";
import { FlowCta } from "@/components/shared/flow-cta";
import { MetricGrid } from "@/components/shared";
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

export function DashboardOverview({ data }: { data: DashboardData }) {
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
        <ExecutiveSummary summary={data.executiveSummary} />
      </motion.div>

      <motion.div variants={fade}>
        <NextActionsStrip />
      </motion.div>

      <motion.div variants={fade} className="grid gap-4 lg:grid-cols-2">
        <RisksList risks={data.risks} />
        <OpportunitiesList opportunities={data.opportunities} />
      </motion.div>

      <motion.div variants={fade}>
        <WeeklyChanges changes={data.weeklyChanges} />
      </motion.div>

      <motion.div variants={fade} className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Ingresos</h3>
        <MetricGrid metrics={data.revenueMetrics} columns={2} />
      </motion.div>

      <motion.div variants={fade} className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Ventas</h3>
          <MetricGrid metrics={data.salesMetrics} columns={2} />
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Operaciones
          </h3>
          <MetricGrid metrics={data.operationalMetrics} columns={2} />
        </div>
      </motion.div>

      <motion.div variants={fade}>
        <div>
          <AiCard title="Recomendación de IA" variant="recommendation" confidence={0.88}>
            {data.aiRecommendation}
          </AiCard>
          <div className="mt-1 flex flex-wrap gap-x-4">
            <FlowCta
              href={flowLinks.recommendation("rec1")}
              label="Actualizar SOP de onboarding"
            />
            <FlowCta
              href={paths.platform.intelligence.bottlenecks}
              label="Ver cuellos de botella"
              className="text-muted-foreground"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
