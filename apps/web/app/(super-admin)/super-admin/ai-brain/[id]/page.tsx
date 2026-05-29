import { notFound } from "next/navigation";
import { BrainDocumentViewer } from "@/components/ai-brain/brain-document-viewer";
import {
  getSignedFileUrl,
  loadAiBrainDocument,
} from "@/lib/super-admin/queries";
import { dbContentTypeToUi } from "@/lib/ai-brain/mapper";

type Props = { params: Promise<{ id: string }> };

export default async function AiBrainDocumentPage({ params }: Props) {
  const { id } = await params;
  const loaded = await loadAiBrainDocument(id);
  if (!loaded) notFound();

  const { row, document } = loaded;
  let imagePreviewUrl: string | null = null;
  if (row.file_url && dbContentTypeToUi(row.content_type) === "image") {
    imagePreviewUrl = await getSignedFileUrl(row.file_url);
  }

  return (
    <BrainDocumentViewer
      document={document}
      fileUrl={row.file_url}
      fileName={row.file_name}
      sourceUrl={row.source_url}
      imagePreviewUrl={imagePreviewUrl}
    />
  );
}
