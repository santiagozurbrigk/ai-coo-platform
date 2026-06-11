"use client";

import { useMemo } from "react";
import { mockDashboard } from "@/mocks/dashboard";
import { deriveDashboardData } from "@/lib/metrics/derive-dashboard-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useFinanceData } from "@/providers/finance-data-provider";
import { usePlatformData } from "@/providers/platform-data-provider";
import { PageLoading } from "@/components/shared/page-loading";
import { DashboardOverview } from "./dashboard-overview";

const useSupabase = isSupabaseConfigured();

export function DashboardPageContent() {
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
    if (!useSupabase) return mockDashboard;
    if (loading) return mockDashboard;

    const derived = deriveDashboardData(
      clients,
      conversations,
      closingCalls,
      expensesSummary,
      paymentPlatforms,
      salesMetrics
    );

    const hasNoActivity =
      clients.length === 0 &&
      conversations.length === 0 &&
      closingCalls.length === 0;

    return {
      ...derived,
      isEmpty: hasNoActivity,
    };
  }, [
    clients,
    conversations,
    closingCalls,
    expensesSummary,
    paymentPlatforms,
    salesMetrics,
    loading,
  ]);

  if (loading) {
    return <PageLoading label="Cargando panel general…" />;
  }

  return <DashboardOverview data={data} />;
}
