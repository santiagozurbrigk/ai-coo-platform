"use client";

import { motion } from "framer-motion";
import { mockOperationsOverview } from "@/mocks/operations-overview";
import { OperationsExecutiveReport } from "./operations-executive-report";
import { OperationsRisksSection } from "./operations-risks-section";
import { OperationsBottlenecksSection } from "./operations-bottlenecks-section";
import { OperationsDepartmentsGrid } from "./operations-departments-grid";
import { OperationsRecommendationsSection } from "./operations-recommendations-section";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function OperationsOverview() {
  const data = mockOperationsOverview;

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
        <OperationsExecutiveReport paragraphs={data.executiveReport} />
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
