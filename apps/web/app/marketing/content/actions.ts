"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { callClaudeJson, callClaudeVisionJson } from "@/lib/ai/anthropic";
import {
  buildContentAnalysisPrompt,
  isImageMimeType,
  isVideoMimeType,
  toClaudeImageMediaType,
} from "@/lib/content/content-analysis-prompt";
import { transcribeAudioBuffer } from "@/lib/content/transcribe-whisper";
import { processVideoForAnalysis } from "@/lib/content/video-processor";
import { createClient } from "@/lib/supabase/server";
import type {
  ContentAnalysis,
  ContentBrief,
  ContentMetrics,
  ContentPiece,
  ContentPieceStatus,
  ContentPieceType,
  ContentPieceWithVariants,
} from "@/types/content";
import { paths } from "@/routes";
import { downloadDriveFileAction } from "./drive-actions";

async function requireProfileOrganizationId(): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile?.organization_id) {
    throw new Error("Sesión no válida");
  }
  return profile.organization_id;
}

export async function getContentPiecesAction(params?: {
  type?: ContentPieceType;
  status?: ContentPieceStatus;
  source?: string;
  limit?: number;
}): Promise<ContentPiece[]> {
  const organizationId = await requireProfileOrganizationId();
  const supabase = await createClient();

  let query = supabase
    .from("content_pieces")
    .select("*")
    .eq("organization_id", organizationId)
    .is("variants_of", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (params?.type) query = query.eq("type", params.type);
  if (params?.status) query = query.eq("status", params.status);
  if (params?.source) query = query.eq("source", params.source);
  if (params?.limit) query = query.limit(params.limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ContentPiece[];
}

export async function getContentPieceAction(
  id: string
): Promise<ContentPieceWithVariants> {
  const organizationId = await requireProfileOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("organization_id", organizationId)
    .or(`id.eq.${id},variants_of.eq.${id}`)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const piece = data?.find((p) => p.id === id);
  if (!piece) throw new Error("Pieza no encontrada");

  return {
    ...(piece as ContentPiece),
    variants: (data?.filter((p) => p.variants_of === id) ?? []) as ContentPiece[],
  };
}

type ContentPieceUpdateFields = Partial<
  Pick<
    ContentPiece,
    | "title"
    | "caption"
    | "status"
    | "analysis"
    | "transcript"
    | "analysis_generated_at"
    | "brief"
    | "metrics"
    | "metrics_updated_at"
  >
> & {
  drive_file_id?: string | null;
  drive_file_name?: string | null;
  drive_file_url?: string | null;
};

export async function updateContentPieceAction(
  id: string,
  updates: ContentPieceUpdateFields
): Promise<void> {
  const organizationId = await requireProfileOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_pieces")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
}

export async function deleteContentPieceAction(id: string): Promise<void> {
  const organizationId = await requireProfileOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_pieces")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
}

export async function analyzeContentPieceAction(
  contentPieceId: string
): Promise<ContentAnalysis> {
  const organizationId = await requireProfileOrganizationId();
  const supabase = await createClient();

  const { data: piece, error } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("id", contentPieceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !piece) {
    throw new Error("Pieza no encontrada");
  }

  if (!piece.drive_file_id) {
    throw new Error("No hay archivo de Drive vinculado a esta pieza");
  }

  const { buffer, mimeType } = await downloadDriveFileAction(piece.drive_file_id);

  let transcript: string | null = null;
  const visionImages: Array<{
    base64: string;
    mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  }> = [];

  if (isVideoMimeType(mimeType)) {
    const { audioBuffer, frames } = await processVideoForAnalysis(buffer, mimeType);
    transcript = await transcribeAudioBuffer(audioBuffer);
    visionImages.push(
      ...frames.map((frame) => ({
        base64: frame.toString("base64"),
        mediaType: "image/jpeg" as const,
      }))
    );
  } else if (isImageMimeType(mimeType)) {
    visionImages.push({
      base64: buffer.toString("base64"),
      mediaType: toClaudeImageMediaType(mimeType),
    });
  } else {
    throw new Error(`Tipo de archivo no soportado para análisis: ${mimeType}`);
  }

  const metrics = piece.metrics as ContentMetrics | null | undefined;

  const analysisPrompt = buildContentAnalysisPrompt({
    caption: piece.caption,
    hashtags: piece.hashtags,
    metrics,
    transcript,
    hasImages: visionImages.length > 0,
  });

  const analysis = await callClaudeVisionJson<ContentAnalysis>({
    organizationId,
    task: "analyze_content_piece",
    feature: "marketing_content",
    text: analysisPrompt,
    images: visionImages,
    maxTokens: 1500,
  });

  if (!analysis) {
    throw new Error("El análisis IA no devolvió resultado");
  }

  const { error: updateError } = await supabase
    .from("content_pieces")
    .update({
      transcript: transcript ?? null,
      analysis,
      analysis_generated_at: new Date().toISOString(),
    })
    .eq("id", contentPieceId)
    .eq("organization_id", organizationId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return analysis;
}

type GeneratedVariantBrief = Pick<
  ContentBrief,
  "formato" | "dolor" | "angulo" | "structure"
>;

export async function createContentVariantsAction({
  sourceContentId,
  count,
  instructions,
}: {
  sourceContentId: string;
  count: number;
  instructions?: string;
}): Promise<string[]> {
  const organizationId = await requireProfileOrganizationId();
  const supabase = await createClient();
  const variantCount = Math.min(Math.max(count, 1), 5);

  const { data: source, error } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("id", sourceContentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !source) {
    throw new Error("Pieza fuente no encontrada");
  }

  const sourceAnalysis = source.analysis as ContentAnalysis | null | undefined;
  const sourceMetrics = source.metrics as ContentMetrics | null | undefined;

  const sourceContext = [
    source.caption ? `Caption original: "${source.caption}"` : null,
    sourceAnalysis
      ? `Análisis de la pieza original:
- Formato: ${sourceAnalysis.formato.name} — ${sourceAnalysis.formato.description}
- Dolor: ${sourceAnalysis.dolor.name} — ${sourceAnalysis.dolor.description}
- Ángulo: ${sourceAnalysis.angulo.name} — ${sourceAnalysis.angulo.description}
- Por qué funcionó: ${sourceAnalysis.why_it_worked}`
      : "La pieza no tiene análisis previo.",
    sourceMetrics
      ? `Métricas: ${sourceMetrics.likes ?? 0} likes, ${sourceMetrics.comments ?? 0} comentarios, ${sourceMetrics.saves ?? 0} guardados, ${sourceMetrics.reach ?? 0} reach`
      : null,
    instructions ? `Instrucciones adicionales del usuario: ${instructions}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = `Sos un estratega de contenido experto. Tenés que crear ${variantCount} variante(s) de una pieza de contenido exitosa.

DEFINICIONES:
- FORMATO: La estructura/forma de grabación (el "cómo se ve"). Ejemplos: "grabación de pantalla con celular", "talking head directo a cámara", "videollamada entre dos personas".
- DOLOR: El problema real del cliente ideal en su día a día. Es el tema, no el envase.
- ÁNGULO: La perspectiva específica desde donde se entra al dolor — el gancho único. El mismo dolor puede tener múltiples ángulos.

PIEZA FUENTE:
${sourceContext}

Generá exactamente ${variantCount} variante(s) distintas. Cada variante debe tener una combinación de Formato + Dolor + Ángulo diferente a las otras y a la original. Podés mantener el mismo dolor pero cambiar el ángulo, o cambiar el formato, o explorar un dolor relacionado.

Para cada variante, también generá la estructura completa del video (hook, desarrollo, cierre/CTA) con guión de ejemplo.

Respondé con este JSON exacto:
{
  "variants": [
    {
      "formato": { "name": "...", "description": "..." },
      "dolor": { "name": "...", "description": "..." },
      "angulo": { "name": "...", "description": "..." },
      "structure": [
        { "part": "Hook (0-3s)", "description": "...", "example_script": "..." },
        { "part": "Desarrollo (3-45s)", "description": "...", "example_script": "..." },
        { "part": "Cierre / CTA (45-60s)", "description": "...", "example_script": "..." }
      ]
    }
  ]
}`;

  const result = await callClaudeJson<{ variants: GeneratedVariantBrief[] }>({
    organizationId,
    task: "create_content_variants",
    feature: "marketing_content",
    user: prompt,
    maxTokens: 3000,
  });

  if (!result?.variants?.length) {
    throw new Error("Respuesta inválida de la IA");
  }

  const insertRows = result.variants.slice(0, variantCount).map((variant) => ({
    organization_id: organizationId,
    type: source.type as ContentPieceType,
    source: "ai_generated" as const,
    platform: source.platform,
    variants_of: sourceContentId,
    brief: variant as ContentBrief,
    status: "draft" as const,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("content_pieces")
    .insert(insertRows)
    .select("id");

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath(paths.platform.marketing.content);
  revalidatePath(paths.platform.marketing.contentDetail(sourceContentId));

  return (inserted ?? []).map((row) => row.id as string);
}

export type TopPerformingContentResult = {
  id: string;
  type: string;
  title?: string;
  platform_post_url?: string;
  published_at?: string;
  metrics?: ContentMetrics;
  analysis_summary: {
    formato?: string;
    dolor?: string;
    angulo?: string;
  } | null;
  score: number;
};

function engagementTotalScore(metrics: ContentMetrics): number {
  return (
    (metrics.likes ?? 0) +
    (metrics.comments ?? 0) * 2 +
    (metrics.saves ?? 0) * 3 +
    (metrics.shares ?? 0) * 2
  );
}

function metricScore(
  metric: string,
  metrics: ContentMetrics
): number {
  if (metric === "engagement_total") {
    return engagementTotalScore(metrics);
  }
  if (metric === "sales") {
    return metrics.saves ?? 0;
  }
  return metrics[metric as keyof ContentMetrics] ?? 0;
}

export async function getTopPerformingContentAction({
  metric,
  limit = 10,
  typeFilter = "all",
}: {
  metric: string;
  limit?: number;
  typeFilter?: string;
}): Promise<TopPerformingContentResult[]> {
  const organizationId = await requireProfileOrganizationId();
  const supabase = await createClient();

  let query = supabase
    .from("content_pieces")
    .select(
      "id, type, title, caption, thumbnail_url, platform_post_url, metrics, published_at, analysis"
    )
    .eq("organization_id", organizationId)
    .eq("source", "zernio")
    .is("variants_of", null)
    .not("metrics", "is", null);

  if (typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }

  const { data: pieces, error } = await query.limit(100);
  if (error) {
    throw new Error(error.message);
  }
  if (!pieces?.length) {
    return [];
  }

  type RankedPiece = {
    id: string;
    type: string;
    title?: string | null;
    caption?: string | null;
    platform_post_url?: string | null;
    published_at?: string | null;
    analysis?: ContentAnalysis | null;
    metrics?: ContentMetrics | null;
  };

  const sorted = [...(pieces as RankedPiece[])].sort((a, b) => {
    const scoreA = metricScore(metric, a.metrics ?? {});
    const scoreB = metricScore(metric, b.metrics ?? {});
    return scoreB - scoreA;
  });

  return sorted.slice(0, limit).map((piece) => {
    const metrics = piece.metrics ?? undefined;
    const analysis = piece.analysis ?? undefined;

    return {
      id: piece.id,
      type: piece.type,
      title: piece.title ?? piece.caption?.slice(0, 60) ?? undefined,
      platform_post_url: piece.platform_post_url ?? undefined,
      published_at: piece.published_at ?? undefined,
      metrics,
      analysis_summary: analysis
        ? {
            formato: analysis.formato?.name,
            dolor: analysis.dolor?.name,
            angulo: analysis.angulo?.name,
          }
        : null,
      score: metrics ? metricScore(metric, metrics) : 0,
    };
  });
}
