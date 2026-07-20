"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, DollarSign, FileSpreadsheet } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { useFinanceData } from "@/providers";
import { usePlatformData } from "@/providers/platform-data-provider";
import { paths } from "@/routes";
import { FinanceMetrics } from "./finance-metrics";
import { FinanceCharts } from "./finance-charts";
import type { ImportedTransaction } from "@/app/finance/actions";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

function formatCurrency(value: number | null, currency: "USD" | "ARS"): string {
  if (value == null) return "-";
  return currency === "USD"
    ? `$${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : `$${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ARS`;
}

const PREVIEW_ROWS = 5;

function ImportedTransactionsTable({ transactions }: { transactions: ImportedTransaction[] }) {
  const [expanded, setExpanded] = useState(false);

  if (transactions.length === 0) return null;

  const totalUsd = transactions.reduce((s, t) => s + (t.amountUsd ?? 0), 0);
  const totalArs = transactions.reduce((s, t) => s + (t.amountLocal ?? 0), 0);
  const visible = expanded ? transactions : transactions.slice(0, PREVIEW_ROWS);
  const hasMore = transactions.length > PREVIEW_ROWS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">
            Transacciones importadas ({transactions.length})
          </h3>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          {totalUsd > 0 && <span>Total USD: {formatCurrency(totalUsd, "USD")}</span>}
          {totalArs > 0 && <span>Total ARS: {formatCurrency(totalArs, "ARS")}</span>}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Fecha</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Concepto</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Categoría</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Monto USD</th>
                <th className="text-right px-3 py-2 font-medium text-muted-foreground">Monto ARS</th>
                <th className="text-left px-3 py-2 font-medium text-muted-foreground">Closer</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                    {t.date ? t.date.slice(0, 10) : "-"}
                  </td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{t.description}</td>
                  <td className="px-3 py-2 text-muted-foreground">{t.clientName ?? "-"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{t.category ?? "-"}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {t.amountUsd != null ? formatCurrency(t.amountUsd, "USD") : "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {t.amountLocal != null ? formatCurrency(t.amountLocal, "ARS") : "-"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{t.closerName ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Ver todas ({transactions.length})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface FinanceOverviewProps {
  importedTransactions?: ImportedTransaction[];
}

export function FinanceOverview({ importedTransactions = [] }: FinanceOverviewProps) {
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
    clients.length > 0 ||
    importedTransactions.length > 0;

  if (!loading && !hasFinanceData) {
    return (
      <div className="space-y-8">
        <PageHeader description="Inteligencia financiera: facturación, cash collected, por cobrar y balances por plataforma" />
        <EmptyState
          title="Sin datos financieros"
          description="Configurá tus plataformas de cobro en Configuración → Pagos y tus gastos fijos en Gastos para ver métricas financieras."
          icon={<DollarSign className="h-8 w-8" />}
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={paths.platform.settingsTab("pagos")}>
                  Configurar plataformas de pago
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={paths.platform.finance.expenses}>Ir a Gastos</Link>
              </Button>
            </div>
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

      {importedTransactions.length > 0 && (
        <motion.div variants={fade}>
          <ImportedTransactionsTable transactions={importedTransactions} />
        </motion.div>
      )}

      <motion.div variants={fade}>
        <FinanceMetrics importedTransactions={importedTransactions} />
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
