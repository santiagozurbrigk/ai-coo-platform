import { getWeeklyReportAction } from "@/app/operations/actions";
import { getZernioAnalyticsAction } from "@/app/integrations/zernio/actions";
import { getCustomMetricsAction } from "@/app/metrics/actions";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { getHoldingSessionState } from "@/lib/holding/session";
import {
  getFrequentObjections,
  mockFrequentObjectionSummaries,
} from "@/lib/metrics/frequent-objections";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";
import type { FrequentObjectionsResult } from "@/types/sales";
import { redirect } from "next/navigation";
import { paths } from "@/routes";

async function loadFrequentObjections(): Promise<FrequentObjectionsResult> {
  if (!isSupabaseConfigured()) {
    return {
      objections: mockFrequentObjectionSummaries(),
      dataSource: "mock",
    };
  }

  const organizationId = await requireOrganizationId();
  return getFrequentObjections(organizationId);
}

export default async function DashboardPage() {
  const holdingSession = await getHoldingSessionState();
  if (holdingSession.isHolding && !holdingSession.viewingBusiness) {
    redirect(paths.platform.holding);
  }

  const [weeklyReport, frequentObjections, zernioAnalytics, customMetrics] =
    await Promise.all([
      getWeeklyReportAction(),
      loadFrequentObjections(),
      getZernioAnalyticsAction(),
      isSupabaseConfigured() ? getCustomMetricsAction() : Promise.resolve([]),
    ]);

  return (
    <DashboardPageContent
      weeklyReport={weeklyReport}
      frequentObjections={frequentObjections}
      zernioAnalytics={zernioAnalytics}
      customMetrics={customMetrics}
    />
  );
}
