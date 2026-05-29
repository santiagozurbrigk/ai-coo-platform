import { BrainLibrary } from "@/components/ai-brain/brain-library";
import { loadAiBrainDocuments } from "@/lib/super-admin/queries";

export default async function AiBrainLibraryPage() {
  const documents = await loadAiBrainDocuments();
  return <BrainLibrary documents={documents} />;
}
