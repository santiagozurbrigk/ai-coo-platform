import { callClaudeJson } from "@/lib/ai/anthropic";
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";
import {
  fetchProductContextFallbackText,
  PRODUCT_CONTEXT_RAG_SOURCE_TYPES,
} from "./product-context-sources";
import { searchRAG, type RAGSearchResult } from "./search";

export type SuggestedAvatar = {
  name?: string;
  main_pain?: string;
  secondary_pains?: string[];
  desires?: string[];
  fears?: string[];
  objections?: string[];
  where_they_hang?: string;
  language_they_use?: string;
};

export type SuggestedProduct = {
  name?: string;
  description?: string;
  type?: string;
  price?: number | null;
  billing_type?: string;
};

export type SuggestedFramework = {
  name?: string;
  type?: string;
  content?: string;
};

export type ProductContextExtraction = {
  suggestedAvatar: SuggestedAvatar | null;
  suggestedProducts: SuggestedProduct[];
  suggestedFrameworks: SuggestedFramework[];
};

async function gatherProductContextSnippets(
  organizationId: string
): Promise<string[]> {
  const seen = new Set<string>();
  const snippets: string[] = [];

  const addResults = (results: RAGSearchResult[]) => {
    for (const r of results) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      snippets.push(`[${r.sourceType}] ${r.title}\n${r.content}`);
    }
  };

  const queries = [
    "cliente ideal dolor problema objetivo resultado transformación",
    "producto servicio precio oferta programa mentoría curso",
  ];

  for (const query of queries) {
    const typed = await searchRAG({
      organizationId,
      query,
      matchCount: 8,
      sourceTypes: [...PRODUCT_CONTEXT_RAG_SOURCE_TYPES],
      minSimilarity: 0.35,
    });
    addResults(typed);

    if (snippets.length < 4) {
      const broad = await searchRAG({
        organizationId,
        query,
        matchCount: 8,
        minSimilarity: 0.28,
      });
      addResults(broad);
    }
  }

  if (snippets.length === 0) {
    snippets.push(...(await fetchProductContextFallbackText(organizationId)));
  }

  return snippets;
}

/**
 * Analiza el contexto existente de la org y propone avatar, productos y frameworks.
 */
export async function extractProductContextFromRAG(
  organizationId: string
): Promise<ProductContextExtraction | null> {
  const snippets = await gatherProductContextSnippets(organizationId);
  if (!snippets.length) return null;

  const context = snippets.join("\n\n");

  const prompt = `Analizá el siguiente contexto de un negocio de infoproductos 
y extraé información sobre el cliente ideal, los productos y los frameworks de ventas.

CONTEXTO:
${wrapUntrustedContent("contexto_producto", context.slice(0, 6000))}

Devolvé ÚNICAMENTE un JSON válido:
{
  "avatar": {
    "name": "<nombre del avatar, ej: 'Emprendedor Digital'>",
    "main_pain": "<dolor principal detectado>",
    "secondary_pains": ["<dolor 2>", "<dolor 3>"],
    "desires": ["<deseo 1>", "<deseo 2>"],
    "fears": ["<miedo 1>"],
    "objections": ["<objeción 1>", "<objeción 2>"],
    "where_they_hang": "<dónde está este cliente>",
    "language_they_use": "<cómo habla este cliente>"
  },
  "products": [
    {
      "name": "<nombre del producto detectado>",
      "description": "<descripción breve>",
      "type": "<curso|mentoria|consultoria|comunidad|evento|otro>",
      "price": <precio si se menciona, null si no>,
      "billing_type": "<unico|mensual|anual|personalizado>"
    }
  ],
  "frameworks": [
    {
      "name": "<nombre del framework>",
      "type": "<script|objeciones|followup|onboarding|otro>",
      "content": "<contenido del framework extraído>"
    }
  ],
  "confidence": "<high|medium|low>"
}`;

  const result = await callClaudeJson<{
    avatar: SuggestedAvatar;
    products: SuggestedProduct[];
    frameworks: SuggestedFramework[];
    confidence: string;
  }>({
    task: "product_extraction",
    system: "Respondé únicamente con JSON válido. No incluyas markdown fences.",
    user: prompt,
    maxTokens: 2000,
    feature: "product_context_extraction",
    organizationId,
  });

  if (!result) return null;

  return {
    suggestedAvatar: result.avatar ?? null,
    suggestedProducts: result.products ?? [],
    suggestedFrameworks: result.frameworks ?? [],
  };
}
