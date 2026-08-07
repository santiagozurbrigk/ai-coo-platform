import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { getFrequentObjections, mockFrequentObjectionSummaries } from "@/lib/metrics/frequent-objections";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SalesMetricsRedesign } from "@/components/sales/sales-metrics-redesign";
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
    <SalesMetricsRedesign frequentObjections={frequentObjections} />
  );
}
