import { KnowledgeBasePage } from "@/components/business-context/knowledge-base-page";
import { PageHeader } from "@/components/shared/page-header";
import {
  getBusinessContextDocumentsAction,
  getFathomContextCallsAction,
} from "@/app/business-context/actions";
import { getGoogleFormsIntegrationStatusAction } from "@/app/forms/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ContextDocument, FathomKnowledgeCall } from "@/types/business-context";

export default async function BusinessContextDocumentsPage() {
  let documents: ContextDocument[] = [];
  let contextCalls: FathomKnowledgeCall[] = [];
  let clientMeetingCalls: FathomKnowledgeCall[] = [];

  let googleConnected = false;

  if (isSupabaseConfigured()) {
    try {
      const [docs, fathom, googleStatus] = await Promise.all([
        getBusinessContextDocumentsAction(),
        getFathomContextCallsAction(),
        getGoogleFormsIntegrationStatusAction(),
      ]);
      documents = docs;
      contextCalls = fathom.contextCalls;
      clientMeetingCalls = fathom.clientMeetingCalls;
      googleConnected = googleStatus.connected;
    } catch (e) {
      console.error("[KnowledgeBase] load:", e);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Documentos, calls y frameworks indexados para la IA" />
      <KnowledgeBasePage
        documents={documents}
        contextCalls={contextCalls}
        clientMeetingCalls={clientMeetingCalls}
        googleConnected={googleConnected}
      />
    </div>
  );
}
