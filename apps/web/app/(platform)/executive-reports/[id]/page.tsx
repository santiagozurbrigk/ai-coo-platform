import { notFound } from "next/navigation";
import { ReportDetail } from "@/components/executive-reports";
import { getExecutiveReportByIdAction } from "@/app/executive-reports/actions";

export default async function ExecutiveReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getExecutiveReportByIdAction(id);
  if (!report) notFound();
  return <ReportDetail report={report} />;
}
