import { ProfitabilityPageContent } from "@/components/super-admin";
import {
  loadProfitabilityData,
  loadTokenCostDailyByOrg,
  loadTokenUsageBreakdown,
} from "@/lib/super-admin/queries";
import type { SuperAdminPeriod } from "@/lib/super-admin/period";

export default async function SuperAdminProfitabilityPage() {
  const [{ summary, orgRows }, dailyCosts] = await Promise.all([
    loadProfitabilityData(),
    loadTokenCostDailyByOrg(30),
  ]);

  const periods: SuperAdminPeriod[] = ["day", "week", "month", "year"];
  const breakdownEntries = await Promise.all(
    periods.map(async (period) => [period, await loadTokenUsageBreakdown(period)] as const)
  );
  const breakdownByPeriod = Object.fromEntries(
    breakdownEntries
  ) as Record<SuperAdminPeriod, Awaited<ReturnType<typeof loadTokenUsageBreakdown>>>;

  return (
    <ProfitabilityPageContent
      summary={summary}
      orgRows={orgRows}
      breakdownByPeriod={breakdownByPeriod}
      dailyCosts={dailyCosts}
    />
  );
}
