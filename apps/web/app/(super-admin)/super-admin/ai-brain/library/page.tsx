import { BrainLibrary } from "@/components/ai-brain/brain-library";
import { mockBrainDocuments } from "@/mocks/ai-brain";

export default function AiBrainLibraryPage() {
  return <BrainLibrary documents={mockBrainDocuments} />;
}
