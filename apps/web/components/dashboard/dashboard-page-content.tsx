"use client";

import { useMemo } from "react";
import { mockDashboard } from "@/mocks/dashboard";
import {
  deriveDashboardData,
  deriveDashboardRevenueTrend,
} from "@/lib/metrics/derive-dashboard-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useFinanceData } from "@/providers/finance-data-provider";
import { usePlatformData } from "@/providers/platform-data-provider";
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

  const {
    expensesSummary,
    paymentPlatforms,
    financeConfigLoading,
  } = useFinanceData();

  const loading =
    useSupabase &&
    (clientsLoading || conversationsLoading || closingCallsLoading || financeConfigLoading);

  const data = useMemo(() => {
    if (!useSupabase) return mockDashboard;
    if (loading) return mockDashboard;

    return deriveDashboardData(
      clients,
      conversations,
      closingCalls,
      expensesSummary,
      paymentPlatforms,
      salesMetrics
    );
  }, [
    clients,
    conversations,
    closingCalls,
    expensesSummary,
    paymentPlatforms,
    salesMetrics,
    loading,
  ]);

  const chartTrend = useMemo(() => {
    if (!useSupabase || loading) {
      return [
        { label: "Lun", value: 0 },
        { label: "Mar", value: 0 },
        { label: "Mié", value: 0 },
        { label: "Jue", value: 0 },
        { label: "Vie", value: 0 },
        { label: "Sáb", value: 0 },
        { label: "Dom", value: 0 },
      ];
    }
    return deriveDashboardRevenueTrend(clients);
  }, [clients, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
        Cargando panel general…
      </div>
    );
  }

  return <DashboardOverview data={data} chartTrend={chartTrend} />;
}
