import { notFound } from "next/navigation";
import { ContextViewer } from "@/components/business-context";
import { getDocumentByIdAction } from "@/app/business-context/actions";

export default async function BusinessContextViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getDocumentByIdAction(id);
  if (!document) notFound();
  return <ContextViewer document={document} />;
}
