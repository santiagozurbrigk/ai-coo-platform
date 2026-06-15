import { HoldingPortfolioContent } from "@/components/super-admin/holding-portfolio-content";
import {
  getHoldingKPIs,
  getHoldingPortfolio,
} from "@/lib/super-admin/holding-queries";

export default async function SuperAdminHoldingPage() {
  const [{ holdingName, organizations }, kpis] = await Promise.all([
    getHoldingPortfolio(),
    getHoldingKPIs(),
  ]);

  return (
    <HoldingPortfolioContent
      holdingName={holdingName}
      kpis={kpis}
      organizations={organizations}
    />
  );
}
