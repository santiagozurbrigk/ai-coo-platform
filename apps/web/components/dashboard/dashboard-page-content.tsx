"use client";

import { useMemo } from "react";
import { mockDashboard } from "@/mocks/dashboard";
import {
  deriveDashboardData,
  deriveDashboardRevenueTrend,
} from "@/lib/metrics/derive-dashboard-data";
import { deriveFinanceSummary } from "@/lib/metrics/derive-finance-summary";
import { SPARKLINE_SERIES } from "@/lib/metrics/sparkline-series";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useFinanceData } from "@/providers/finance-data-provider";
import { usePlatformData } from "@/providers/platform-data-provider";
import type { DashboardHeroMetrics } from "@/types/dashboard-hero";
import { DashboardOverview } from "./dashboard-overview";

const useSupabase = isSupabaseConfigured();

function mockHeroMetrics(): DashboardHeroMetrics {
  return {
    facturacion: 8600,
    facturacionTrend: SPARKLINE_SERIES.revenue.map((v, i) => ({
      label: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i] ?? String(i),
      value: v,
    })),
    cashCollected: 5710,
    cashTrend: SPARKLINE_SERIES.cashCollected.map((v, i) => ({
      label: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i] ?? String(i),
      value: v,
    })),
    bookingRate: 62.5,
    ghostingRate: 25,
    avgResponseMin: 16,
    activeConversations: 3,
    activeClients: 0,
  };
}

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
    monthlySeries,
    financeConfigLoading,
  } = useFinanceData();

  const loading =
    useSupabase &&
    (clientsLoading ||
      conversationsLoading ||
      closingCallsLoading ||
      financeConfigLoading);

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

  const hero = useMemo((): DashboardHeroMetrics => {
    if (!useSupabase || loading) return mockHeroMetrics();

    const finance = deriveFinanceSummary(
      clients,
      closingCalls,
      expensesSummary,
      paymentPlatforms
    );
    const cashTrend = deriveDashboardRevenueTrend(clients);
    const facturacionTrend =
      monthlySeries.length >= 2
        ? monthlySeries.map((m) => ({ label: m.month, value: m.facturacion }))
        : cashTrend;

    const activeClients = clients.filter((c) => c.status === "active").length;

    return {
      facturacion: finance.facturacion,
      facturacionTrend,
      cashCollected: finance.cashCollected,
      cashTrend,
      bookingRate: salesMetrics.bookingRate,
      ghostingRate: salesMetrics.ghostingRate,
      avgResponseMin: salesMetrics.avgResponseMin,
      activeConversations: salesMetrics.activeConversations,
      activeClients,
    };
  }, [
    clients,
    closingCalls,
    expensesSummary,
    paymentPlatforms,
    salesMetrics,
    monthlySeries,
    loading,
  ]);

  const dualTrend = useMemo(() => {
    if (!useSupabase || loading) {
      return SPARKLINE_SERIES.revenue.map((v, i) => ({
        label: `S${i + 1}`,
        primary: v * 100,
        secondary: (SPARKLINE_SERIES.cashCollected[i] ?? 0) * 100,
      }));
    }
    return monthlySeries.map((m) => ({
      label: m.month,
      primary: m.facturacion,
      secondary: m.cashCollected,
    }));
  }, [monthlySeries, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
        Cargando panel general…
      </div>
    );
  }

  return (
    <DashboardOverview data={data} hero={hero} dualTrend={dualTrend} />
  );
}
