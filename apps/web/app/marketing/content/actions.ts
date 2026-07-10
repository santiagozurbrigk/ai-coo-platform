"use server";

import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import type {
  ContentPiece,
  ContentPieceStatus,
  ContentPieceType,
  ContentPieceWithVariants,
} from "@/types/content";

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

export async function updateContentPieceAction(
  id: string,
  updates: Partial<
    Pick<
      ContentPiece,
      | "title"
      | "caption"
      | "status"
      | "drive_file_id"
      | "drive_file_name"
      | "drive_file_url"
      | "analysis"
      | "transcript"
      | "analysis_generated_at"
      | "brief"
      | "metrics"
      | "metrics_updated_at"
    >
  >
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
