import { callClaudeJson } from "@/lib/ai/anthropic";

export type ContentLabel =
  | "AUTORIDAD"
  | "ATRACCION"
  | "NUTRICION"
  | "VENTA";

export type ContentLabelResult = {
  label: ContentLabel;
  confidence: number;
  reasoning: string;
};

export async function labelContentAsset(params: {
  organizationId: string;
  title: string;
  caption: string;
  contentType: string;
  views: number;
  likes: number;
  comments: number;
}): Promise<ContentLabelResult | null> {
  const system = `Eres experto en marketing de infoproductos.
Clasifica contenido en UNA categoría: AUTORIDAD, ATRACCION, NUTRICION, VENTA.
Responde SOLO JSON en español.`;

  const user = `Título: ${params.title}
Descripción: ${params.caption}
Tipo: ${params.contentType}
Métricas: ${params.views} vistas, ${params.likes} likes, ${params.comments} comentarios

JSON:
{"label":"AUTORIDAD|ATRACCION|NUTRICION|VENTA","confidence":0.0,"reasoning":"..."}`;

  const result = await callClaudeJson<{
    label: ContentLabel;
    confidence: number;
    reasoning: string;
  }>({
    organizationId: params.organizationId,
    task: "content_labeling",
    feature: "content_labeling",
    system,
    user,
    maxTokens: 512,
  });

  if (!result?.label) return null;
  return {
    label: result.label,
    confidence: Number(result.confidence) || 0.5,
    reasoning: result.reasoning ?? "",
  };
}
