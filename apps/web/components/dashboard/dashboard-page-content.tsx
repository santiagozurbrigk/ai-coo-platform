"use client";

import { useMemo } from "react";
import { deriveDashboardData } from "@/lib/metrics/derive-dashboard-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useFinanceData } from "@/providers/finance-data-provider";
import { usePlatformData } from "@/providers/platform-data-provider";
import type { ZernioAnalyticsSummary } from "@/app/integrations/zernio/actions";
import type { FrequentObjectionsResult } from "@/types/sales";
import type { ComputedCustomMetric } from "@/lib/metrics/custom-metrics";
import type { MetricSnapshotRow } from "@/app/metrics/actions";
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
  metricSnapshots = [],
}: {
  frequentObjections?: FrequentObjectionsResult | null;
  zernioAnalytics?: ZernioAnalyticsSummary;
  customMetrics?: ComputedCustomMetric[];
  metricSnapshots?: MetricSnapshotRow[];
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

  const { expensesSummary, paymentPlatforms, financeConfigLoading, clientPayments } =
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
      frequentObjections?.objections ?? [],
      clientPayments
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
    salesMetrics,
    frequentObjections,
    clientPayments,
  ]);

  if (loading) {
    return <PageLoading label="Cargando panel general…" />;
  }

  return (
    <DashboardOverview
      data={data}
      zernioAnalytics={zernioAnalytics}
      customMetrics={customMetrics}
      metricSnapshots={metricSnapshots}
    />
  );
}
