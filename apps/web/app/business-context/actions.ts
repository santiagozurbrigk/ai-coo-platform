"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { ingestDocument } from "@/lib/rag/ingest";
import { isOpenAIConfigured } from "@/lib/rag/embeddings";
import { loadFathomCallsForKnowledgeBase } from "@/lib/fathom/knowledge-base-queries";
import {
  BUSINESS_CONTEXT_BUCKET,
  DOCUMENT_CATEGORIES,
} from "@/lib/business-context/constants";
import {
  isAllowedDocumentFile,
  sanitizeFilename,
} from "@/lib/business-context/file-types";
import { extractTextFromFile } from "@/lib/business-context/extract-text";
import {
  mapDocumentRowToContextDocument,
  type BusinessContextDocumentRow,
} from "@/lib/business-context/types";
import type { ContextDocument, FathomKnowledgeCall } from "@/types/business-context";
import { paths } from "@/routes";

const ROW_COLUMNS =
  "id, organization_id, title, category, source, content_text, storage_path, mime_type, status, index_error, uploaded_by, created_at, updated_at";

const categorySchema = z.enum(
  DOCUMENT_CATEGORIES as [string, ...string[]]
);

const createTextNoteSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  category: categorySchema,
  content: z.string().trim().min(1, "El contenido es obligatorio").max(100_000),
});

const prepareFileUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string().trim().min(1).max(200),
});

const createFromFileSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  category: categorySchema,
  storagePath: z.string().trim().min(1),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(200),
});

const idSchema = z.string().uuid("Identificador inválido");

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Borra el documento RAG (y sus chunks) asociado a un documento de contexto. */
async function removeFromRag(
  organizationId: string,
  sourceId: string
): Promise<void> {
  const admin = createAdminClient();
  const { data: docs } = await admin
    .from("rag_documents")
    .select("id")
    .eq("organization_id", organizationId)
    .in("source_type", ["business_context_note", "business_context_document"])
    .eq("source_id", sourceId);

  const ids = (docs ?? []).map((d) => d.id as string);
  if (!ids.length) return;

  await admin.from("rag_chunks").delete().in("document_id", ids);
  await admin.from("rag_documents").delete().in("id", ids);
}

// ---------------------------------------------------------------------------
// Notas de texto
// ---------------------------------------------------------------------------

export async function createTextNoteAction(
  input: unknown
): Promise<MutationResult<{ id: string }>> {
  const parsed = createTextNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const uploadedBy = await currentUserId();
    const admin = createAdminClient();
    const { title, category, content } = parsed.data;

    const { data: row, error } = await admin
      .from("business_context_documents")
      .insert({
        organization_id: organizationId,
        title,
        category,
        source: "manual",
        content_text: content,
        status: "processing",
        uploaded_by: uploadedBy,
      })
      .select("id")
      .single();

    if (error || !row) {
      throw new Error(error?.message ?? "No se pudo guardar la nota");
    }

    const docId = row.id as string;
    console.error("[BusinessContext:RAG] createTextNoteAction saved", {
      docId,
      organizationId,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      openaiConfigured: isOpenAIConfigured(),
    });

    const indexResult = await indexBusinessContextInRag({
      organizationId,
      id: docId,
      sourceType: "business_context_note",
      title,
      category,
      content,
    });

    if (!indexResult.ok) {
      console.error("[BusinessContext:RAG] createTextNoteAction index failed", {
        docId,
        reason: indexResult.reason,
      });
      throw new Error(
        `La nota se guardó pero falló la indexación en RAG: ${indexResult.reason}`
      );
    }

    console.error("[BusinessContext:RAG] createTextNoteAction complete", {
      docId,
      chunkCount: indexResult.chunkCount,
    });

    revalidatePath(paths.platform.businessContext.documents);
    return { id: row.id as string };
  });
}

// ---------------------------------------------------------------------------
// Subida de archivos (PDF / TXT / MD)
// ---------------------------------------------------------------------------

export async function prepareDocumentFileUploadAction(
  input: unknown
): Promise<MutationResult<{ storagePath: string; signedUrl: string; contentType: string }>> {
  const parsed = prepareFileUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const { fileName, fileSize, mimeType } = parsed.data;

    const allowed = isAllowedDocumentFile(fileName, mimeType, fileSize);
    if (!allowed.ok) throw new Error(allowed.error);

    const docId = crypto.randomUUID();
    const safeName = sanitizeFilename(fileName);
    const storagePath = `${organizationId}/${docId}-${safeName}`;

    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(BUSINESS_CONTEXT_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data?.signedUrl) {
      throw new Error(
        error?.message ??
          `No se pudo preparar la subida. ¿Existe el bucket "${BUSINESS_CONTEXT_BUCKET}"?`
      );
    }

    return {
      storagePath,
      signedUrl: data.signedUrl,
      contentType: allowed.mimeType,
    };
  });
}

export async function createDocumentFromFileAction(
  input: unknown
): Promise<MutationResult<{ id: string }>> {
  const parsed = createFromFileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const uploadedBy = await currentUserId();
    const admin = createAdminClient();
    const { title, category, storagePath, mimeType } = parsed.data;

    const allowed = isAllowedDocumentFile(parsed.data.fileName, mimeType);
    if (!allowed.ok) throw new Error(allowed.error);

    const { data: row, error } = await admin
      .from("business_context_documents")
      .insert({
        organization_id: organizationId,
        title,
        category,
        source: "manual",
        storage_path: storagePath,
        mime_type: allowed.mimeType,
        status: "processing",
        uploaded_by: uploadedBy,
      })
      .select("id")
      .single();

    if (error || !row) {
      throw new Error(error?.message ?? "No se pudo registrar el documento");
    }

    const id = row.id as string;

    // Descargar, extraer texto e indexar en RAG (best-effort, no bloquea el alta).
    let extracted = "";
    try {
      const { data: file, error: downloadError } = await admin.storage
        .from(BUSINESS_CONTEXT_BUCKET)
        .download(storagePath);

      if (downloadError || !file) {
        throw new Error(downloadError?.message ?? "No se pudo leer el archivo subido");
      }

      const buffer = await file.arrayBuffer();
      extracted = await extractTextFromFile(buffer, allowed.mimeType);
    } catch (err) {
      console.error("[BusinessContext] extracción de texto falló:", err);
    }

    if (!extracted.trim()) {
      await admin
        .from("business_context_documents")
        .update({
          status: "error",
          index_error: "No se pudo extraer texto del archivo (¿PDF escaneado o vacío?)",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      throw new Error(
        "El archivo se subió pero no se pudo extraer texto para indexar (¿PDF escaneado o vacío?)."
      );
    }

    await admin
      .from("business_context_documents")
      .update({ content_text: extracted, updated_at: new Date().toISOString() })
      .eq("id", id);

    const indexResult = await indexBusinessContextInRag({
      organizationId,
      id,
      sourceType: "business_context_document",
      title,
      category,
      content: extracted,
    });

    if (!indexResult.ok) {
      throw new Error(
        `El documento se guardó pero falló la indexación en RAG: ${indexResult.reason}`
      );
    }

    revalidatePath(paths.platform.businessContext.documents);
    return { id };
  });
}

/** Confirma en DB que rag_documents + al menos un rag_chunk existen. */
async function verifyRagIndexed(
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

/** Persiste status/index_error y lanza si el update en DB falla. */
async function persistDocumentIndexStatus(
  admin: ReturnType<typeof createAdminClient>,
  id: string,
  status: "indexed" | "error",
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
async function indexBusinessContextInRag(args: {
  organizationId: string;
  id: string;
  sourceType: "business_context_note" | "business_context_document";
  title: string;
  category: string;
  content: string;
}): Promise<{ ok: true; chunkCount: number } | { ok: false; reason: string }> {
  const admin = createAdminClient();

  console.error("[BusinessContext:RAG] indexBusinessContextInRag start", {
    docId: args.id,
    sourceType: args.sourceType,
    organizationId: args.organizationId,
    openaiConfigured: isOpenAIConfigured(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });

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
    ingestOk: ingestResult.ok,
    ...(ingestResult.ok
      ? { documentId: ingestResult.documentId, chunkCount: ingestResult.chunkCount }
      : { reason: ingestResult.reason }),
  });

  if (!ingestResult.ok) {
    await persistDocumentIndexStatus(admin, args.id, "error", ingestResult.reason);
    return { ok: false, reason: ingestResult.reason };
  }

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

  // Verificación final post-update: confirmar que rag sigue existiendo
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
}

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

export async function getBusinessContextDocumentsAction(): Promise<
  ContextDocument[]
> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("business_context_documents")
    .select(ROW_COLUMNS)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[BusinessContext] listar documentos:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    mapDocumentRowToContextDocument(row as BusinessContextDocumentRow)
  );
}

export async function getFathomContextCallsAction(): Promise<{
  contextCalls: FathomKnowledgeCall[];
  clientMeetingCalls: FathomKnowledgeCall[];
}> {
  const organizationId = await requireOrganizationId();
  return loadFathomCallsForKnowledgeBase(organizationId);
}

export async function getDocumentByIdAction(
  id: string
): Promise<ContextDocument | null> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return null;

  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("business_context_documents")
    .select(ROW_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("id", parsed.data)
    .maybeSingle();

  if (error || !data) return null;
  return mapDocumentRowToContextDocument(data as BusinessContextDocumentRow);
}

export async function deleteDocumentAction(
  input: unknown
): Promise<MutationResult<{ id: string }>> {
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Identificador inválido" };
  }

  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const id = parsed.data;

    const { data: row } = await admin
      .from("business_context_documents")
      .select("id, storage_path")
      .eq("organization_id", organizationId)
      .eq("id", id)
      .maybeSingle();

    if (!row) throw new Error("Documento no encontrado");

    if (row.storage_path) {
      await admin.storage
        .from(BUSINESS_CONTEXT_BUCKET)
        .remove([row.storage_path as string]);
    }

    await removeFromRag(organizationId, id);

    const { error } = await admin
      .from("business_context_documents")
      .delete()
      .eq("organization_id", organizationId)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath(paths.platform.businessContext.documents);
    return { id };
  });
}
