import { createAdminClient } from "@/lib/supabase/admin";
import { formatVector, generateEmbeddings, isOpenAIConfigured } from "./embeddings";
import { chunkText, prepareDocumentText } from "./chunker";

export interface IngestDocumentInput {
  organizationId: string;
  sourceType: string;
  sourceId: string;
  title: string;
  data: Record<string, unknown>;
  department?: string;
  tags?: string[];
}

export type IngestDocumentSuccess = {
  ok: true;
  documentId: string;
  chunkCount: number;
};

/** @deprecated Los fallos lanzan IngestDocumentError; solo queda el camino de éxito. */
export type IngestDocumentResult = IngestDocumentSuccess;

/** Lanzado cuando la ingestión RAG falla — evita que callers ignoren `{ ok: false }`. */
export class IngestDocumentError extends Error {
  readonly code = "INGEST_FAILED";

  constructor(message: string) {
    super(message);
    this.name = "IngestDocumentError";
  }
}

function failIngest(reason: string): never {
  console.error("[RAG] ingest failed:", reason);
  throw new IngestDocumentError(reason);
}

async function markRagDocumentError(
  supabase: ReturnType<typeof createAdminClient>,
  input: IngestDocumentInput
): Promise<void> {
  try {
    const { error } = await supabase
      .from("rag_documents")
      .update({ embedding_status: "error" })
      .eq("organization_id", input.organizationId)
      .eq("source_type", input.sourceType)
      .eq("source_id", input.sourceId);
    if (error) {
      console.error("[RAG] markRagDocumentError failed:", error.message);
    }
  } catch (markErr) {
    console.error("[RAG] markRagDocumentError threw:", markErr);
  }
}

/**
 * Ingesta un documento en el sistema RAG:
 * 1. Crea/actualiza el documento en rag_documents
 * 2. Genera chunks del texto
 * 3. Genera embeddings para cada chunk
 * 4. Guarda los chunks con embeddings en rag_chunks
 *
 * En el camino exitoso devuelve `IngestDocumentSuccess` (`{ ok: true, documentId, chunkCount }`).
 * Ante cualquier fallo —API key no configurada, error de la API de OpenAI,
 * error al persistir en la base de datos, etc.— LANZA `IngestDocumentError`
 * en lugar de devolver un resultado. Por eso siempre hay que envolver la
 * llamada en un try/catch; no existe un campo `.ok === false` que chequear.
 */
export async function ingestDocument(
  input: IngestDocumentInput
): Promise<IngestDocumentSuccess> {
  const openaiConfigured = isOpenAIConfigured();
  console.error("[RAG] ingestDocument start", {
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    organizationId: input.organizationId,
    openaiConfigured,
    openaiKeyPresent: Boolean(process.env.OPENAI_API_KEY?.trim()),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });

  if (!openaiConfigured) {
    failIngest("OPENAI_API_KEY no configurada — no se puede generar embeddings");
  }

  const supabase = createAdminClient();

  const fullText = prepareDocumentText(input.sourceType, input.data);
  if (!fullText?.trim()) {
    failIngest("Texto vacío después de preparar el documento");
  }

  try {
    const { data: doc, error: docError } = await supabase
      .from("rag_documents")
      .upsert(
        {
          organization_id: input.organizationId,
          source_type: input.sourceType,
          source_id: input.sourceId,
          title: input.title,
          content: fullText,
          department: input.department ?? null,
          tags: input.tags ?? [],
          embedding_status: "processing",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id,source_type,source_id" }
      )
      .select("id")
      .single();

    if (docError || !doc) {
      const reason = `Error creando rag_documents: ${docError?.message ?? "desconocido"}`;
      console.error("[RAG] rag_documents upsert failed", {
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        reason,
        code: docError?.code,
        details: docError?.details,
      });
      failIngest(reason);
    }

    const chunks = chunkText(fullText);
    if (!chunks.length) {
      failIngest("No se generaron chunks del texto");
    }

    const embeddings = await generateEmbeddings(chunks.map((c) => c.content));

    await supabase.from("rag_chunks").delete().eq("document_id", doc.id);

    const chunkRows = chunks.map((chunk, i) => ({
      organization_id: input.organizationId,
      document_id: doc.id,
      content: chunk.content,
      chunk_index: chunk.chunkIndex,
      embedding: formatVector(embeddings[i] ?? []),
      source_type: input.sourceType,
      title: input.title,
    }));

    const { error: chunkError } = await supabase.from("rag_chunks").insert(chunkRows);

    if (chunkError) {
      const reason = `Error insertando rag_chunks: ${chunkError.message}`;
      console.error("[RAG]", reason);
      await supabase
        .from("rag_documents")
        .update({ embedding_status: "error" })
        .eq("id", doc.id);
      failIngest(reason);
    }

    await supabase
      .from("rag_documents")
      .update({
        embedding_status: "done",
        embedded_at: new Date().toISOString(),
      })
      .eq("id", doc.id);

    console.error("[RAG] ingestDocument success", {
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      documentId: doc.id,
      chunkCount: chunks.length,
    });

    return { ok: true, documentId: doc.id as string, chunkCount: chunks.length };
  } catch (err) {
    if (err instanceof IngestDocumentError) {
      throw err;
    }
    const reason =
      err instanceof Error ? err.message : "Error inesperado en ingestión RAG";
    console.error("[RAG] Error en ingestión:", err);
    await markRagDocumentError(supabase, input);
    failIngest(reason);
  }
}

export async function ingestAllSOPs(organizationId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: sops } = await supabase
    .from("sops")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (!sops?.length) return;

  for (const sop of sops) {
    try {
      await ingestDocument({
        organizationId,
        sourceType: "sop",
        sourceId: sop.id,
        title: sop.title,
        data: sop,
        department: sop.department,
        tags: ["sop", sop.department],
      });
    } catch (err) {
      const reason = err instanceof IngestDocumentError ? err.message : String(err);
      console.error(`[RAG] SOP ${sop.id} no indexado:`, reason);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

export async function ingestAllFathomCalls(organizationId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: calls } = await supabase
    .from("fathom_calls")
    .select("*")
    .eq("organization_id", organizationId)
    .not("transcript", "is", null);

  if (!calls?.length) return;

  for (const call of calls) {
    try {
      await ingestDocument({
        organizationId,
        sourceType: "fathom_call",
        sourceId: call.fathom_call_id,
        title: call.title ?? `Call ${call.fathom_call_id}`,
        data: call,
        tags: ["fathom", "call"],
      });
    } catch (err) {
      const reason = err instanceof IngestDocumentError ? err.message : String(err);
      console.error(`[RAG] Fathom ${call.fathom_call_id} no indexado:`, reason);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

export async function ingestProductContext(organizationId: string): Promise<void> {
  const supabase = createAdminClient();

  const [org, avatars, products, frameworks] = await Promise.all([
    supabase.from("organizations").select("name, industry").eq("id", organizationId).single(),
    supabase
      .from("customer_avatars")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_primary", true)
      .limit(1),
    supabase
      .from("products")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true),
    supabase
      .from("sales_frameworks")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true),
  ]);

  try {
    await ingestDocument({
      organizationId,
      sourceType: "product_context",
      sourceId: "main",
      title: `Contexto de negocio: ${org.data?.name ?? organizationId}`,
      data: {
        orgName: org.data?.name,
        industry: org.data?.industry,
        avatar: avatars.data?.[0] ?? null,
        products: products.data ?? [],
        frameworks: frameworks.data ?? [],
      },
      tags: ["producto", "avatar", "contexto"],
    });
  } catch (err) {
    const reason = err instanceof IngestDocumentError ? err.message : String(err);
    console.error("[RAG] product_context no indexado:", reason);
  }
}
