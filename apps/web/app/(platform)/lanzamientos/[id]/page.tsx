import { notFound } from "next/navigation";
import { LaunchDetailContent } from "@/components/lanzamientos";
import { getLaunchAction } from "@/app/lanzamientos/actions";

export default async function LaunchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const launch = await getLaunchAction(id);

  if (!launch) notFound();

  return <LaunchDetailContent initialLaunch={launch} />;
}
