import { notFound } from "next/navigation";
import { OrganizationDetailView } from "@/components/super-admin";
import { loadOrganizationDetail } from "@/lib/super-admin/queries";

export default async function SuperAdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await loadOrganizationDetail(id);
  if (!detail) notFound();
  return <OrganizationDetailView detail={detail} />;
}
