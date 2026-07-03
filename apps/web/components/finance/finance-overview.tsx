"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useFinanceData } from "@/providers";
import { usePlatformData } from "@/providers/platform-data-provider";
import { paths } from "@/routes";
import { FinanceMetrics } from "./finance-metrics";
import { FinanceCharts } from "./finance-charts";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function FinanceOverview() {
  const { clients, clientsLoading } = usePlatformData();
  const {
    fixedExpenses,
    paymentPlatforms,
    financeConfigLoading,
  } = useFinanceData();

  const loading = clientsLoading || financeConfigLoading;
  const hasFinanceData =
    fixedExpenses.length > 0 ||
    paymentPlatforms.length > 0 ||
    clients.length > 0;

  if (!loading && !hasFinanceData) {
    return (
      <div className="space-y-8">
        <PageHeader description="Inteligencia financiera: facturación, cash collected, por cobrar y balances por plataforma" />
        <EmptyState
          title="Sin datos financieros"
          description="Configurá tus gastos fijos y plataformas de cobro para ver tus métricas financieras."
          icon={<DollarSign className="h-8 w-8" />}
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href={paths.platform.finance.expenses}>Configurar finanzas</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
    >
      <PageHeader description="Inteligencia financiera: facturación, cash collected, por cobrar y balances por plataforma" />

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
