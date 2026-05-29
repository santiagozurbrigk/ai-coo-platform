import { MarketingOverview } from "@/components/marketing/marketing-overview";
import { getContentDistributionDataAction } from "@/app/marketing/actions";

export default async function MarketingPage() {
  const distribution = await getContentDistributionDataAction();
  return <MarketingOverview distribution={distribution} />;
}
