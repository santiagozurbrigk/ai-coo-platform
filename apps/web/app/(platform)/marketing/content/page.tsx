import { MarketingContentLibrary } from "@/components/marketing/marketing-content-library";
import { listContentAssetsAction } from "@/app/marketing/actions";
import { enrichContentAssets } from "@/lib/marketing/content-filters";

export default async function MarketingContentPage() {
  const fromDb = await listContentAssetsAction();
  const hasRealData = fromDb.length > 0;
  const assets = enrichContentAssets(fromDb);

  return (
    <MarketingContentLibrary initialAssets={assets} hasRealData={hasRealData} />
  );
}
