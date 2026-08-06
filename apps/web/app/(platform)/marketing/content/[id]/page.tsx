import { notFound } from "next/navigation";
import { getContentPieceAction, getContentBenchmarkAction } from "@/app/marketing/content/actions";
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

  const benchmark = await getContentBenchmarkAction(data.type).catch(() => null);

  return (
    <MarketingContentDetailPageClient
      piece={data}
      variants={data.variants ?? []}
      benchmark={benchmark}
    />
  );
}
