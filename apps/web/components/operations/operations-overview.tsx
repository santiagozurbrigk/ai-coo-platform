"use client";

import { motion } from "framer-motion";
import { mockOperationsOverview } from "@/mocks/operations-overview";
import { weeklyReportToOperationsOverview } from "@/lib/operations/map-weekly-report";
import type {
  OperationsDepartment,
  OperationsOverviewData,
} from "@/types/operations-overview";
import type { WeeklyReportRow } from "@/types/operations";
import { OperationsExecutiveReport } from "./operations-executive-report";
import { OperationsRisksSection } from "./operations-risks-section";
import { OperationsBottlenecksSection } from "./operations-bottlenecks-section";
import { OperationsDepartmentsGrid } from "./operations-departments-grid";
import { OperationsRecommendationsSection } from "./operations-recommendations-section";
import { OperationsReportEmptyState } from "./operations-report-empty-state";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function OperationsOverview({
  weeklyReport = null,
  departments,
}: {
  weeklyReport?: WeeklyReportRow | null;
  departments?: OperationsDepartment[];
}) {
  const hasReport =
    weeklyReport?.status === "ready" && Boolean(weeklyReport.executive_summary);

  const resolvedDepartments = departments ?? mockOperationsOverview.departments;

  const data: OperationsOverviewData = hasReport
    ? weeklyReportToOperationsOverview(weeklyReport, resolvedDepartments)
    : { ...mockOperationsOverview, departments: resolvedDepartments };

  if (!hasReport) {
    return (
      <div className="space-y-8">
        <OperationsReportEmptyState />
        <motion.div
          className="space-y-8 opacity-60"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.div variants={fade}>
            <OperationsDepartmentsGrid departments={data.departments} />
          </motion.div>
        </motion.div>
      </div>
    );
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
        <OperationsExecutiveReport
          paragraphs={data.executiveReport}
          generatedAt={weeklyReport?.generated_at}
        />
      </motion.div>

      <motion.div variants={fade}>
        <OperationsRisksSection risks={data.risks} />
      </motion.div>

      <motion.div variants={fade}>
        <OperationsBottlenecksSection bottlenecks={data.bottlenecks} />
      </motion.div>

      <motion.div variants={fade}>
        <OperationsDepartmentsGrid departments={data.departments} />
      </motion.div>

      <motion.div variants={fade}>
        <OperationsRecommendationsSection recommendations={data.recommendations} />
      </motion.div>
    </motion.div>
  );
}
