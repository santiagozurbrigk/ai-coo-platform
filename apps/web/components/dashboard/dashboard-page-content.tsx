"use client";

import { useMemo } from "react";
import { deriveDashboardData } from "@/lib/metrics/derive-dashboard-data";
import {
  weeklyReportToDashboardRecommendations,
  weeklyReportToDashboardRisks,
} from "@/lib/operations/map-weekly-report";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";
import { useFinanceData } from "@/providers/finance-data-provider";
import { usePlatformData } from "@/providers/platform-data-provider";
import type { WeeklyReportRow } from "@/types/operations";
import type { FrequentObjectionsResult } from "@/types/sales";
import { PageLoading } from "@/components/shared/page-loading";
import { DashboardOverview } from "./dashboard-overview";

const useSupabase = isSupabaseConfigured();

const NO_REPORT_SUMMARY =
  "Sin reporte esta semana. Completá los inputs en Operaciones para generar el resumen ejecutivo con IA.";

export function DashboardPageContent({
  weeklyReport = null,
  frequentObjections = null,
}: {
  weeklyReport?: WeeklyReportRow | null;
  frequentObjections?: FrequentObjectionsResult | null;
}) {
  const {
    clients,
    conversations,
    closingCalls,
    salesMetrics,
    clientsLoading,
    conversationsLoading,
    closingCallsLoading,
  } = usePlatformData();

  const { expensesSummary, paymentPlatforms, financeConfigLoading } =
    useFinanceData();

  const loading =
    useSupabase &&
    (clientsLoading ||
      conversationsLoading ||
      closingCallsLoading ||
      financeConfigLoading);

  const data = useMemo(() => {
    const derived = deriveDashboardData(
      clients,
      conversations,
      closingCalls,
      expensesSummary,
      paymentPlatforms,
      salesMetrics,
      frequentObjections?.objections ?? []
    );

    const hasNoActivity =
      clients.length === 0 &&
      conversations.length === 0 &&
      closingCalls.length === 0;

    const hasWeeklyReport =
      weeklyReport?.status === "ready" && Boolean(weeklyReport.executive_summary);

    return {
      ...derived,
      isEmpty: !useSupabase || hasNoActivity,
      executiveSummary: hasWeeklyReport
        ? weeklyReport!.executive_summary!
        : useSupabase
          ? NO_REPORT_SUMMARY
          : derived.executiveSummary,
      risks: hasWeeklyReport
        ? weeklyReportToDashboardRisks(weeklyReport!)
        : derived.risks,
      aiRecommendations: hasWeeklyReport
        ? weeklyReportToDashboardRecommendations(weeklyReport!)
        : derived.aiRecommendations,
      weeklyReportCtaHref: hasWeeklyReport
        ? undefined
        : paths.platform.operations.weeklyInputs,
    };
  }, [
    clients,
    conversations,
    closingCalls,
    expensesSummary,
    paymentPlatforms,
    salesMetrics,
    loading,
    weeklyReport,
    frequentObjections,
  ]);

  if (loading) {
    return <PageLoading label="Cargando panel general…" />;
  }

  return <DashboardOverview data={data} weeklyReport={weeklyReport} />;
}
