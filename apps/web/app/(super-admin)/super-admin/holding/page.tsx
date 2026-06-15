import { HoldingPortfolioContent } from "@/components/super-admin/holding-portfolio-content";
import { loadHoldingPortfolio } from "@/lib/super-admin/holding";

export default async function SuperAdminHoldingPage() {
  const portfolio = await loadHoldingPortfolio();
  return <HoldingPortfolioContent portfolio={portfolio} />;
}
