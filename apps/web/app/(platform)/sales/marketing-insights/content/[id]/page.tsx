import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default async function LegacyContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(paths.platform.marketing.contentDetail(id));
}
