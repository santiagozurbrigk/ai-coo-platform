"use server";

import { requireAuthContext } from "@/lib/auth/require-auth";
import {
  generateDocument,
  type DocumentContent,
} from "@/lib/agent/document-generator";
import { markdownToDocParagraphs } from "@/lib/agent/document-to-markdown";
import {
  formatVector,
  generateEmbedding,
  isOpenAIConfigured,
} from "@/lib/rag/embeddings";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function extractCanvasTitle(content: string, title?: string | null): string {
  if (title?.trim()) return title.trim();
  const heading = content.match(/^#{1,2} (.+)$/m);
  if (heading?.[1]) return heading[1].trim();
  return `Canvas - ${new Date().toLocaleDateString("es-AR")}`;
}

function chunkCanvasContent(content: string): string[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const sections = trimmed.split(/(?=^## )/m).filter((part) => part.trim());
  if (sections.length > 1) return sections;

  const chunks: string[] = [];
  for (let i = 0; i < trimmed.length; i += 1200) {
    chunks.push(trimmed.slice(i, i + 1200));
  }
  return chunks.length > 0 ? chunks : [trimmed];
}

// ---------------------------------------------------------------------------
// Exportar canvas como .docx
// ---------------------------------------------------------------------------

export async function exportCanvasAsDocxAction(content: string): Promise<{
  ok: boolean;
  filename?: string;
  base64?: string;
  error?: string;
}> {
  try {
    const trimmed = content.trim();
    if (!trimmed) {
      return { ok: false, error: "El canvas está vacío." };
    }

    await requireAuthContext();

    const title = extractCanvasTitle(trimmed);
    const generated = await generateDocument("docx", {
      kind: "doc",
      paragraphs: markdownToDocParagraphs(trimmed),
    } satisfies DocumentContent);

    return {
      ok: true,
      filename: `${title.replace(/[^\w\s-]/g, "").trim() || "documento"}.docx`,
      base64: generated.buffer.toString("base64"),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo exportar el documento",
    };
  }
}

// ---------------------------------------------------------------------------
// Guardar canvas en Base de Conocimiento (RAG)
// ---------------------------------------------------------------------------

export async function saveCanvasToKnowledgeBaseAction(input: {
  content: string;
  title?: string | null;
}): Promise<{ ok: boolean; documentId?: string; error?: string }> {
  try {
    if (!isOpenAIConfigured()) {
      return {
        ok: false,
        error: "OpenAI no configurado — los embeddings no están disponibles.",
      };
    }

    const { orgId } = await requireAuthContext();
    const content = input.content.trim();
    if (!content) {
      return { ok: false, error: "El canvas está vacío." };
    }

    const title = extractCanvasTitle(content, input.title);
    const supabase = await createClient();

    const { data: doc, error: docError } = await supabase
      .from("rag_documents")
      .insert({
        organization_id: orgId,
        source_type: "canvas",
        title,
        content,
        embedding_status: "pending",
        is_active: true,
        tags: [],
      })
      .select("id")
      .single();

    if (docError || !doc) {
      return {
        ok: false,
        error: docError?.message ?? "No se pudo crear el documento.",
      };
    }

    const docId = doc.id as string;
    const chunks = chunkCanvasContent(content);
    if (!chunks.length) {
      return { ok: false, error: "No se generaron chunks del contenido." };
    }

    const chunkRows = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]!;
      const embedding = await generateEmbedding(chunk);
      chunkRows.push({
        organization_id: orgId,
        document_id: docId,
        content: chunk,
        chunk_index: i,
        embedding: formatVector(embedding),
        source_type: "canvas",
        title,
      });
    }

    const { error: chunkError } = await supabase
      .from("rag_chunks")
      .insert(chunkRows);

    if (chunkError) {
      await supabase
        .from("rag_documents")
        .update({ embedding_status: "error" })
        .eq("id", docId);
      return { ok: false, error: chunkError.message };
    }

    const { error: updateError } = await supabase
      .from("rag_documents")
      .update({
        embedding_status: "done",
        embedded_at: new Date().toISOString(),
      })
      .eq("id", docId);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    return { ok: true, documentId: docId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al guardar en Base de Conocimiento.",
    };
  }
}
