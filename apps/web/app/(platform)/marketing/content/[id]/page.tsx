import { notFound } from "next/navigation";
import { getContentPieceAction } from "@/app/marketing/content/actions";
import { ContentPieceDetail } from "@/components/marketing/content-piece-detail";

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
    <ContentPieceDetail piece={data} variants={data.variants ?? []} />
  );
}
