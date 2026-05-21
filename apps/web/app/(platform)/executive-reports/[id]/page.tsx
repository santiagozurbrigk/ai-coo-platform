import { notFound } from "next/navigation";
import { ReportDetail } from "@/components/executive-reports";
import { getReportById } from "@/mocks";

export default async function ExecutiveReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getReportById(id);
  if (!report) notFound();
  return <ReportDetail report={report} />;
}
