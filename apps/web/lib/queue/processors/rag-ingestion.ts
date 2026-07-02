import { createAdminClient } from "@/lib/supabase/admin";
import {
  indexBusinessContextInRag,
  persistDocumentIndexStatus,
  verifyRagIndexed,
  type BusinessContextRagSourceType,
} from "@/lib/business-context/rag-indexing";
import type { RagIngestionJobPayload } from "@/lib/queue/qstash-client";

type BusinessContextDocumentRow = {
  id: string;
  organization_id: string;
  title: string;
  category: string;
  content_text: string | null;
};

export type RagIngestionProcessResult = {
  chunkCount: number;
  skipped?: boolean;
  error?: string;
};

async function loadBusinessContextDocument(
  documentId: string,
  organizationId: string
): Promise<BusinessContextDocumentRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_context_documents")
    .select("id, organization_id, title, category, content_text")
    .eq("id", documentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el documento: ${error.message}`);
  }
  if (!data) {
    throw new Error("Documento de business context no encontrado");
  }

  return data as BusinessContextDocumentRow;
}

/** Idempotencia: si ya está indexed con chunks en RAG, no reprocesar. */
export async function isRagIngestionAlreadyComplete(
  payload: RagIngestionJobPayload
): Promise<boolean> {
  const admin = createAdminClient();
  const { data: doc, error } = await admin
    .from("business_context_documents")
    .select("status")
    .eq("id", payload.documentId)
    .eq("organization_id", payload.organizationId)
    .maybeSingle();

  if (error || doc?.status !== "indexed") return false;

  const { data: ragDoc } = await admin
    .from("rag_documents")
    .select("id, embedding_status")
    .eq("organization_id", payload.organizationId)
    .eq("source_type", payload.sourceType)
    .eq("source_id", payload.documentId)
    .maybeSingle();

  if (!ragDoc || ragDoc.embedding_status !== "done") return false;

  const verified = await verifyRagIndexed(
    admin,
    payload.organizationId,
    payload.sourceType,
    payload.documentId,
    ragDoc.id as string
  );

  return verified.ok;
}

export async function processRagIngestion(
  payload: RagIngestionJobPayload
): Promise<RagIngestionProcessResult> {
  const { documentId, organizationId, sourceType } = payload;
  const started = Date.now();

  console.log("[Queue] rag-ingestion start", {
    documentId,
    organizationId,
    sourceType,
  });

  if (await isRagIngestionAlreadyComplete(payload)) {
    console.log("[Queue] rag-ingestion skipped — already indexed", {
      documentId,
      durationMs: Date.now() - started,
    });
    return { chunkCount: 0, skipped: true };
  }

  const admin = createAdminClient();
  await persistDocumentIndexStatus(admin, documentId, "processing", null);

  const doc = await loadBusinessContextDocument(documentId, organizationId);
  const content = doc.content_text?.trim();
  if (!content) {
    const reason = "El documento no tiene texto para indexar";
    await persistDocumentIndexStatus(admin, documentId, "error", reason);
    return { chunkCount: 0, error: reason };
  }

  const result = await indexBusinessContextInRag({
    organizationId,
    id: documentId,
    sourceType: sourceType as BusinessContextRagSourceType,
    title: doc.title,
    category: doc.category,
    content,
  });

  if (!result.ok) {
    console.error("[Queue] rag-ingestion failed", {
      documentId,
      reason: result.reason,
      durationMs: Date.now() - started,
    });
    return { chunkCount: 0, error: result.reason };
  }

  console.log("[Queue] rag-ingestion completed", {
    documentId,
    chunkCount: result.chunkCount,
    durationMs: Date.now() - started,
  });

  return { chunkCount: result.chunkCount };
}
