import { DocumentGrid } from "@/components/business-context";
import { mockDocuments } from "@/mocks";

export default function BusinessContextDocumentsPage() {
  return <DocumentGrid documents={mockDocuments} />;
}
