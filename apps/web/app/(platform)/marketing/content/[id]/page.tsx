import { notFound } from "next/navigation";
import { getContentPieceAction } from "@/app/marketing/content/actions";
import { MarketingContentDetailPageClient } from "@/components/marketing/marketing-content-detail-page-client";

export default async function MarketingContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data;
  try {
    data = await getContentPieceAction(id);
  } catch {
    notFound();
  }

  return (
    <MarketingContentDetailPageClient
      piece={data}
      variants={data.variants ?? []}
    />
  );
}
