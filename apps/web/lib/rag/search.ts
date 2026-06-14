import { createAdminClient } from "@/lib/supabase/admin";
import { formatVector, generateEmbedding, isOpenAIConfigured } from "./embeddings";

export interface RAGSearchResult {
  id: string;
  documentId: string;
  content: string;
  title: string;
  sourceType: string;
  similarity: number;
}

type RagChunkRow = {
  id: string;
  document_id: string;
  content: string;
  title: string;
  source_type: string;
  similarity: number;
};

export async function searchRAG({
  organizationId,
  query,
  matchCount = 5,
  sourceTypes,
  minSimilarity = 0.7,
}: {
  organizationId: string;
  query: string;
  matchCount?: number;
  sourceTypes?: string[];
  minSimilarity?: number;
}): Promise<RAGSearchResult[]> {
  if (!isOpenAIConfigured()) return [];

  const queryEmbedding = await generateEmbedding(query);
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("search_rag_chunks", {
    query_embedding: formatVector(queryEmbedding),
    org_id: organizationId,
    match_count: matchCount,
    source_types: sourceTypes ?? null,
  });

  if (error) {
    console.error("[RAG Search] Error:", error);
    return [];
  }

  return ((data ?? []) as RagChunkRow[])
    .filter((r) => r.similarity >= minSimilarity)
    .map((r) => ({
      id: r.id,
      documentId: r.document_id,
      content: r.content,
      title: r.title,
      sourceType: r.source_type,
      similarity: r.similarity,
    }));
}

export function buildRAGContext(results: RAGSearchResult[]): string {
  if (!results.length) return "";

  return `
CONTEXTO RELEVANTE DE LA ORGANIZACIÓN:
${results
  .map(
    (r, i) => `
[${i + 1}] ${r.title} (${r.sourceType})
${r.content}
`
  )
  .join("\n---\n")}
`.trim();
}
