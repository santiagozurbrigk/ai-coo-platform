import { KnowledgeBasePage } from "@/components/business-context/knowledge-base-page";
import { PageHeader } from "@/components/shared/page-header";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { loadFathomCallsForKnowledgeBase } from "@/lib/fathom/knowledge-base-queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockDocuments } from "@/mocks";

export default async function BusinessContextDocumentsPage() {
  let contextCalls: Awaited<
    ReturnType<typeof loadFathomCallsForKnowledgeBase>
  >["contextCalls"] = [];
  let clientMeetingCalls: Awaited<
    ReturnType<typeof loadFathomCallsForKnowledgeBase>
  >["clientMeetingCalls"] = [];

  if (isSupabaseConfigured()) {
    try {
      const organizationId = await requireOrganizationId();
      const loaded = await loadFathomCallsForKnowledgeBase(organizationId);
      contextCalls = loaded.contextCalls;
      clientMeetingCalls = loaded.clientMeetingCalls;
    } catch (e) {
      console.error("[KnowledgeBase] load fathom calls:", e);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Documentos, calls y frameworks indexados para la IA" />
      <KnowledgeBasePage
        documents={mockDocuments}
        contextCalls={contextCalls}
        clientMeetingCalls={clientMeetingCalls}
      />
    </div>
  );
}
