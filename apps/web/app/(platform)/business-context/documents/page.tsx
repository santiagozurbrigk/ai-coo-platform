import { KnowledgeBasePage } from "@/components/business-context/knowledge-base-page";
import { mockDocuments } from "@/mocks";

export default function BusinessContextDocumentsPage() {
  return <KnowledgeBasePage documents={mockDocuments} />;
}
