import { notFound } from "next/navigation";
import { BrainDocumentViewer } from "@/components/ai-brain/brain-document-viewer";
import { getBrainDocumentById } from "@/mocks/ai-brain";

type Props = { params: Promise<{ id: string }> };

export default async function AiBrainDocumentPage({ params }: Props) {
  const { id } = await params;
  const doc = getBrainDocumentById(id);
  if (!doc) notFound();
  return <BrainDocumentViewer document={doc} />;
}
