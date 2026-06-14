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

/**
 * Ingesta un documento en el sistema RAG:
 * 1. Crea/actualiza el documento en rag_documents
 * 2. Genera chunks del texto
 * 3. Genera embeddings para cada chunk
 * 4. Guarda los chunks con embeddings en rag_chunks
 */
export async function ingestDocument(input: IngestDocumentInput): Promise<void> {
  if (!isOpenAIConfigured()) {
    console.warn("[RAG] OPENAI_API_KEY no configurada — omitiendo ingestión");
    return;
  }

  const supabase = createAdminClient();

  const fullText = prepareDocumentText(input.sourceType, input.data);
  if (!fullText?.trim()) return;

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
      console.error("[RAG] Error creando documento:", docError);
      return;
    }

    const chunks = chunkText(fullText);
    if (!chunks.length) return;

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
      console.error("[RAG] Error insertando chunks:", chunkError);
      await supabase
        .from("rag_documents")
        .update({ embedding_status: "error" })
        .eq("id", doc.id);
      return;
    }

    await supabase
      .from("rag_documents")
      .update({
        embedding_status: "done",
        embedded_at: new Date().toISOString(),
      })
      .eq("id", doc.id);

    console.log(
      `[RAG] Documento ingestado: ${input.title} (${chunks.length} chunks)`
    );
  } catch (err) {
    console.error("[RAG] Error en ingestión:", err);
    await supabase
      .from("rag_documents")
      .update({ embedding_status: "error" })
      .eq("organization_id", input.organizationId)
      .eq("source_type", input.sourceType)
      .eq("source_id", input.sourceId);
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
    await ingestDocument({
      organizationId,
      sourceType: "sop",
      sourceId: sop.id,
      title: sop.title,
      data: sop,
      department: sop.department,
      tags: ["sop", sop.department],
    });
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
    await ingestDocument({
      organizationId,
      sourceType: "fathom_call",
      sourceId: call.fathom_call_id,
      title: call.title ?? `Call ${call.fathom_call_id}`,
      data: call,
      tags: ["fathom", "call"],
    });
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
}
