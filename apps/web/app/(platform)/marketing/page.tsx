import { MarketingOverview } from "@/components/marketing/marketing-overview";
import {
  getContentDistributionDataAction,
  getMarketingOverviewContextAction,
} from "@/app/marketing/actions";

export default async function MarketingPage() {
  const [distribution, overview] = await Promise.all([
    getContentDistributionDataAction(),
    getMarketingOverviewContextAction(),
  ]);

  return <MarketingOverview distribution={distribution} overview={overview} />;
}
