"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { FinanceMetrics } from "./finance-metrics";
import { FinanceCharts } from "./finance-charts";
import { PaymentPlatformsSection } from "./payment-platforms-section";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function FinanceOverview() {
  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
    >
      <PageHeader
        title="Finanzas"
        description="Inteligencia financiera: facturación, cash collected, por cobrar y balances por plataforma"
      />

      <motion.div variants={fade}>
        <PaymentPlatformsSection />
      </motion.div>

      <motion.div variants={fade}>
        <FinanceMetrics />
      </motion.div>

      <motion.div variants={fade}>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Análisis visual
        </h3>
        <FinanceCharts />
      </motion.div>
    </motion.div>
  );
}
