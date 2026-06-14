import { notFound } from "next/navigation";
import { MarketingContentDetail } from "@/components/marketing/marketing-content-detail";
import { getContentAssetByIdAction } from "@/app/marketing/actions";
import { getContentById } from "@/mocks/marketing-insights";

export default async function MarketingContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const realAsset = await getContentAssetByIdAction(id);

  if (realAsset) {
    return <MarketingContentDetail asset={realAsset} hasRealData />;
  }

  const mockContent = getContentById(id);
  if (!mockContent) notFound();
  return <MarketingContentDetail mockContent={mockContent} hasRealData={false} />;
}
