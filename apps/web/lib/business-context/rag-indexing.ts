import { createAdminClient } from "@/lib/supabase/admin";
import { ingestDocument, IngestDocumentError } from "@/lib/rag/ingest";
import { isOpenAIConfigured } from "@/lib/rag/embeddings";

export type BusinessContextRagSourceType =
  | "business_context_note"
  | "business_context_document";

export type IndexBusinessContextInRagArgs = {
  organizationId: string;
  id: string;
  sourceType: BusinessContextRagSourceType;
  title: string;
  category: string;
  content: string;
};

/** Confirma en DB que rag_documents + al menos un rag_chunk existen. */
export async function verifyRagIndexed(
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  sourceType: string,
  sourceId: string,
  expectedDocumentId: string
): Promise<{ ok: true; chunkCount: number } | { ok: false; reason: string }> {
  const { data: ragDoc, error: docError } = await admin
    .from("rag_documents")
    .select("id, embedding_status")
    .eq("organization_id", organizationId)
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .maybeSingle();

  if (docError) {
    return { ok: false, reason: `Verificación RAG falló: ${docError.message}` };
  }
  if (!ragDoc) {
    return { ok: false, reason: "No existe fila en rag_documents tras la ingestión" };
  }
  if (ragDoc.id !== expectedDocumentId) {
    return { ok: false, reason: "ID de rag_documents no coincide con el esperado" };
  }
  if (ragDoc.embedding_status !== "done") {
    return {
      ok: false,
      reason: `rag_documents.embedding_status=${ragDoc.embedding_status ?? "null"} (se esperaba done)`,
    };
  }

  const { count, error: chunkError } = await admin
    .from("rag_chunks")
    .select("id", { count: "exact", head: true })
    .eq("document_id", ragDoc.id);

  if (chunkError) {
    return { ok: false, reason: `Verificación de chunks falló: ${chunkError.message}` };
  }
  if (!count || count < 1) {
    return { ok: false, reason: "No hay chunks en rag_chunks tras la ingestión" };
  }

  return { ok: true, chunkCount: count };
}

function ingestFailureReason(err: unknown): string {
  if (err instanceof IngestDocumentError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return "Error inesperado en ingestión RAG";
}

/** Persiste status/index_error y lanza si el update en DB falla. */
export async function persistDocumentIndexStatus(
  admin: ReturnType<typeof createAdminClient>,
  id: string,
  status: "processing" | "indexed" | "error",
  indexError: string | null
): Promise<void> {
  const { error } = await admin
    .from("business_context_documents")
    .update({
      status,
      index_error: indexError,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("[BusinessContext:RAG] persistDocumentIndexStatus failed", {
      id,
      status,
      indexError,
      dbError: error.message,
    });
    throw new Error(`No se pudo actualizar el status del documento: ${error.message}`);
  }
}

/** Indexa en el RAG y actualiza el status según el resultado real verificado en DB. */
export async function indexBusinessContextInRag(
  args: IndexBusinessContextInRagArgs
): Promise<{ ok: true; chunkCount: number } | { ok: false; reason: string }> {
  const admin = createAdminClient();

  console.error("[BusinessContext:RAG] indexBusinessContextInRag start", {
    docId: args.id,
    sourceType: args.sourceType,
    organizationId: args.organizationId,
    openaiConfigured: isOpenAIConfigured(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });

  try {
    const ingestResult = await ingestDocument({
      organizationId: args.organizationId,
      sourceType: args.sourceType,
      sourceId: args.id,
      title: args.title,
      data: { title: args.title, category: args.category, content: args.content },
      tags: ["business_context", args.category],
    });

    console.error("[BusinessContext:RAG] ingestDocument result", {
      docId: args.id,
      sourceType: args.sourceType,
      ingestOk: true,
      documentId: ingestResult.documentId,
      chunkCount: ingestResult.chunkCount,
    });

    const verified = await verifyRagIndexed(
      admin,
      args.organizationId,
      args.sourceType,
      args.id,
      ingestResult.documentId
    );

    console.error("[BusinessContext:RAG] verifyRagIndexed result", {
      docId: args.id,
      sourceType: args.sourceType,
      verifyOk: verified.ok,
      ...(verified.ok ? { chunkCount: verified.chunkCount } : { reason: verified.reason }),
    });

    if (!verified.ok) {
      await persistDocumentIndexStatus(admin, args.id, "error", verified.reason);
      return verified;
    }

    await persistDocumentIndexStatus(admin, args.id, "indexed", null);

    const finalCheck = await verifyRagIndexed(
      admin,
      args.organizationId,
      args.sourceType,
      args.id,
      ingestResult.documentId
    );

    if (!finalCheck.ok) {
      console.error("[BusinessContext:RAG] post-index verify failed", {
        docId: args.id,
        reason: finalCheck.reason,
      });
      await persistDocumentIndexStatus(admin, args.id, "error", finalCheck.reason);
      return finalCheck;
    }

    console.error("[BusinessContext:RAG] indexBusinessContextInRag success", {
      docId: args.id,
      ragDocumentId: ingestResult.documentId,
      chunkCount: finalCheck.chunkCount,
    });

    return { ok: true, chunkCount: finalCheck.chunkCount };
  } catch (err) {
    const reason = ingestFailureReason(err);
    console.error("[BusinessContext:RAG] indexBusinessContextInRag failed", {
      docId: args.id,
      sourceType: args.sourceType,
      reason,
      err,
    });
    try {
      await persistDocumentIndexStatus(admin, args.id, "error", reason);
    } catch (persistErr) {
      console.error("[BusinessContext:RAG] could not persist error status", {
        docId: args.id,
        persistErr,
      });
    }
    return { ok: false, reason };
  }
}

/** Si el status quedó mal (p. ej. indexed sin RAG), lo corrige a error. */
export async function assertDocumentNotIndexed(
  admin: ReturnType<typeof createAdminClient>,
  id: string,
  reason: string
): Promise<void> {
  const { data } = await admin
    .from("business_context_documents")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (data?.status === "indexed" || data?.status === "processing") {
    console.error("[BusinessContext:RAG] correcting stale status after failure", {
      id,
      previousStatus: data.status,
      reason,
    });
    await persistDocumentIndexStatus(admin, id, "error", reason);
  }
}

/** Confirma en DB que el documento quedó indexed antes de retornar éxito al cliente. */
export async function assertDocumentIndexed(
  admin: ReturnType<typeof createAdminClient>,
  id: string
): Promise<void> {
  const { data, error } = await admin
    .from("business_context_documents")
    .select("status, index_error")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar el status final: ${error.message}`);
  }
  if (data?.status !== "indexed") {
    throw new Error(
      `Estado inconsistente tras indexación: "${data?.status ?? "null"}"` +
        (data?.index_error ? ` — ${data.index_error}` : "")
    );
  }
}
