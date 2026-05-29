import { notFound } from "next/navigation";
import { OrganizationDetailView } from "@/components/super-admin";
import { loadOrgClientHealthTimeline } from "@/lib/super-admin/client-health";
import { loadOrganizationDetail } from "@/lib/super-admin/queries";

export default async function SuperAdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, clientHealth] = await Promise.all([
    loadOrganizationDetail(id),
    loadOrgClientHealthTimeline(id),
  ]);
  if (!detail) notFound();
  return (
    <OrganizationDetailView detail={detail} clientHealth={clientHealth} />
  );
}
