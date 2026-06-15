import { getWeeklyReportAction } from "@/app/operations/actions";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import {
  getFrequentObjections,
  mockFrequentObjectionSummaries,
} from "@/lib/metrics/frequent-objections";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";
import type { FrequentObjectionsResult } from "@/types/sales";

async function loadFrequentObjections(): Promise<FrequentObjectionsResult> {
  if (!isSupabaseConfigured()) {
    return {
      objections: mockFrequentObjectionSummaries(),
      dataSource: "mock",
    };
  }

  try {
    const organizationId = await requireOrganizationId();
    return await getFrequentObjections(organizationId);
  } catch {
    return {
      objections: mockFrequentObjectionSummaries(),
      dataSource: "mock",
    };
  }
}

export default async function DashboardPage() {
  const [weeklyReport, frequentObjections] = await Promise.all([
    getWeeklyReportAction(),
    loadFrequentObjections(),
  ]);

  return (
    <DashboardPageContent
      weeklyReport={weeklyReport}
      frequentObjections={frequentObjections}
    />
  );
}
