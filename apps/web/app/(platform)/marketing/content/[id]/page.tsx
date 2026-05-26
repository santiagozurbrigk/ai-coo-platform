import { notFound } from "next/navigation";
import { MarketingContentDetail } from "@/components/marketing/marketing-content-detail";
import { getContentById } from "@/mocks/marketing-insights";

export default async function MarketingContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const content = getContentById(id);
  if (!content) notFound();
  return <MarketingContentDetail content={content} />;
}
