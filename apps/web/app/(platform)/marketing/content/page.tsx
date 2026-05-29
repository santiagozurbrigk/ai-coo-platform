import { MarketingContentLibrary } from "@/components/marketing/marketing-content-library";
import { listContentAssetsAction } from "@/app/marketing/actions";

export default async function MarketingContentPage() {
  const assets = await listContentAssetsAction();
  return <MarketingContentLibrary initialAssets={assets} />;
}
