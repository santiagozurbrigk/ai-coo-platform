import { notFound } from "next/navigation";
import { MarketingContentDetail } from "@/components/marketing/marketing-content-detail";
import { getContentAssetByIdAction } from "@/app/marketing/actions";

export default async function MarketingContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getContentAssetByIdAction(id);

  if (!asset) notFound();

  return <MarketingContentDetail asset={asset} />;
}
