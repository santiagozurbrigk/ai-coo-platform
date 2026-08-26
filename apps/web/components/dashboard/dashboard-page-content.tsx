"use client";

import { useMemo } from "react";
import { deriveDashboardData } from "@/lib/metrics/derive-dashboard-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useFinanceData } from "@/providers/finance-data-provider";
import { usePlatformData } from "@/providers/platform-data-provider";
import type { ZernioAnalyticsSummary } from "@/app/integrations/zernio/actions";
import type { FrequentObjectionsResult } from "@/types/sales";
import type { ComputedCustomMetric } from "@/lib/metrics/custom-metrics";
import { PageLoading } from "@/components/shared/page-loading";
import { DashboardOverview } from "./dashboard-overview";

const useSupabase = isSupabaseConfigured();

export function DashboardPageContent({
  frequentObjections = null,
  zernioAnalytics = {
    totalImpressions: 0,
    totalLikes: 0,
    totalComments: 0,
    hasData: false,
  },
  customMetrics = [],
}: {
  frequentObjections?: FrequentObjectionsResult | null;
  zernioAnalytics?: ZernioAnalyticsSummary;
  customMetrics?: ComputedCustomMetric[];
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

  const { expensesSummary, paymentPlatforms, financeConfigLoading, clientPayments, financeSummary, salesBaselineMetrics } =
    useFinanceData();

  const loading =
    useSupabase &&
    (clientsLoading ||
      conversationsLoading ||
      closingCallsLoading ||
      financeConfigLoading);

  // Fallback baseline para métricas de ventas: si no hay datos live, usar snapshot
  const effectiveSalesMetrics = useMemo(() => {
    const hasLiveData = salesMetrics.totalConversations > 0 || salesMetrics.bookingRate > 0;
    if (hasLiveData || !salesBaselineMetrics) return salesMetrics;
    return {
      ...salesMetrics,
      bookingRate: (salesBaselineMetrics["tasa_agendamiento"] ?? 0) * 100,
      ghostingRate: (salesBaselineMetrics["tasa_fantasma"] ?? 0) * 100,
    };
  }, [salesMetrics, salesBaselineMetrics]);

  const data = useMemo(() => {
    const derived = deriveDashboardData(
      clients,
      conversations,
      closingCalls,
      expensesSummary,
      paymentPlatforms,
      effectiveSalesMetrics,
      frequentObjections?.objections ?? [],
      clientPayments,
      financeSummary  // baseline-enriched desde el provider
    );

    const hasNoActivity =
      clients.length === 0 &&
      conversations.length === 0 &&
      closingCalls.length === 0;

    return {
      ...derived,
      isEmpty: !useSupabase || hasNoActivity,
    };
  }, [
    clients,
    conversations,
    closingCalls,
    expensesSummary,
    paymentPlatforms,
    effectiveSalesMetrics,
    frequentObjections,
    clientPayments,
    financeSummary,
  ]);

  if (loading) {
    return <PageLoading label="Cargando panel general…" />;
  }

  return (
    <DashboardOverview
      data={data}
      zernioAnalytics={zernioAnalytics}
    />
  );
}
