import { MarketingContentLibrary } from "@/components/marketing/marketing-content-library";
import { listContentAssetsAction } from "@/app/marketing/actions";
import { enrichContentAssets } from "@/lib/marketing/content-filters";
import { mockMarketingContentAssets } from "@/mocks/marketing-content";

export default async function MarketingContentPage() {
  const fromDb = await listContentAssetsAction();
  const base = fromDb.length > 0 ? fromDb : mockMarketingContentAssets;
  const assets = enrichContentAssets(base);
  return <MarketingContentLibrary initialAssets={assets} />;
}
