import { notFound } from "next/navigation";
import { ContextViewer } from "@/components/business-context";
import { getDocumentById } from "@/mocks";

export default async function BusinessContextViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = getDocumentById(id);
  if (!document) notFound();
  return <ContextViewer document={document} />;
}
