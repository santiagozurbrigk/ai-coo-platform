import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { getFrequentObjections, mockFrequentObjectionSummaries } from "@/lib/metrics/frequent-objections";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SalesMetricsPageContent } from "@/components/sales/sales-metrics-page-content";
import type { FrequentObjectionsResult } from "@/types/sales";

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

export default async function SalesMetricsPage() {
  const frequentObjections = await loadFrequentObjections();

  return (
    <SalesMetricsPageContent frequentObjections={frequentObjections} />
  );
}
