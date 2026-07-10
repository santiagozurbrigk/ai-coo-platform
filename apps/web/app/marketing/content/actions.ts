"use server";

import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { callClaudeVisionJson } from "@/lib/ai/anthropic";
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
  ContentMetrics,
  ContentPiece,
  ContentPieceStatus,
  ContentPieceType,
  ContentPieceWithVariants,
} from "@/types/content";
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
