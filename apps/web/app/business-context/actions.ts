"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { ingestDocument } from "@/lib/rag/ingest";
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
  "id, organization_id, title, category, source, content_text, storage_path, mime_type, status, uploaded_by, created_at, updated_at";

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

    await indexDocument({
      organizationId,
      id: row.id as string,
      sourceType: "business_context_note",
      title,
      category,
      content,
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
        .update({ status: "error", updated_at: new Date().toISOString() })
        .eq("id", id);
      throw new Error(
        "El archivo se subió pero no se pudo extraer texto para indexar (¿PDF escaneado o vacío?)."
      );
    }

    await admin
      .from("business_context_documents")
      .update({ content_text: extracted, updated_at: new Date().toISOString() })
      .eq("id", id);

    await indexDocument({
      organizationId,
      id,
      sourceType: "business_context_document",
      title,
      category,
      content: extracted,
    });

    revalidatePath(paths.platform.businessContext.documents);
    return { id };
  });
}

/** Indexa en el RAG y actualiza el status del documento (indexed / error). */
async function indexDocument(args: {
  organizationId: string;
  id: string;
  sourceType: "business_context_note" | "business_context_document";
  title: string;
  category: string;
  content: string;
}): Promise<void> {
  const admin = createAdminClient();
  try {
    await ingestDocument({
      organizationId: args.organizationId,
      sourceType: args.sourceType,
      sourceId: args.id,
      title: args.title,
      data: { title: args.title, category: args.category, content: args.content },
      tags: ["business_context", args.category],
    });
    await admin
      .from("business_context_documents")
      .update({ status: "indexed", updated_at: new Date().toISOString() })
      .eq("id", args.id);
  } catch (err) {
    console.error("[BusinessContext] ingesta RAG falló:", err);
    await admin
      .from("business_context_documents")
      .update({ status: "error", updated_at: new Date().toISOString() })
      .eq("id", args.id);
  }
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
