import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentType } from "@/types/marketing-insights";

export type ResolvedContentAsset = {
  id: string;
  title: string;
  type: ContentType;
  thumbnailHue: number;
  publishLabel: string;
};

const CONTENT_TYPES: ContentType[] = [
  "reel",
  "story",
  "carousel",
  "webinar",
  "vsl",
  "post",
];

function mapContentType(value: string | null): ContentType {
  const v = (value ?? "").toLowerCase();
  if (CONTENT_TYPES.includes(v as ContentType)) return v as ContentType;
  if (v === "video" || v === "youtube") return "vsl";
  return "post";
}

function hueFromId(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum + id.charCodeAt(i)) % 360;
  return sum;
}

function publishLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function assetTitle(row: {
  title?: string | null;
  caption?: string | null;
}): string {
  return (
    (row.title as string)?.trim() ||
    (row.caption as string)?.trim().slice(0, 80) ||
    "Sin título"
  );
}

function toResolved(row: Record<string, unknown>): ResolvedContentAsset {
  return {
    id: String(row.id),
    title: assetTitle(row),
    type: mapContentType(row.content_type as string | null),
    thumbnailHue: hueFromId(String(row.id)),
    publishLabel: publishLabel(row.published_at as string | null),
  };
}

async function findAssetByVideoId(
  supabase: SupabaseClient,
  organizationId: string,
  videoId: string
): Promise<ResolvedContentAsset | null> {
  const { data } = await supabase
    .from("content_assets")
    .select("id, title, caption, content_type, published_at")
    .eq("organization_id", organizationId)
    .eq("platform", "youtube")
    .eq("external_id", videoId)
    .maybeSingle();

  return data ? toResolved(data as Record<string, unknown>) : null;
}

async function findAssetByTitle(
  supabase: SupabaseClient,
  organizationId: string,
  title: string
): Promise<ResolvedContentAsset | null> {
  const needle = title.trim();
  if (!needle) return null;

  const { data: byTitle } = await supabase
    .from("content_assets")
    .select("id, title, caption, content_type, published_at")
    .eq("organization_id", organizationId)
    .ilike("title", needle)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byTitle) return toResolved(byTitle as Record<string, unknown>);

  const { data: byCaption } = await supabase
    .from("content_assets")
    .select("id, title, caption, content_type, published_at")
    .eq("organization_id", organizationId)
    .ilike("caption", `%${needle.slice(0, 60)}%`)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return byCaption ? toResolved(byCaption as Record<string, unknown>) : null;
}

type ConversationAttribution = {
  utm_link_id: string | null;
  source_video_title: string | null;
};

/**
 * Resuelve el content_asset de origen para una conversación.
 * Cadena: UTM → youtube_video_id → asset; fallback por título de video (YouTube/Instagram).
 */
export async function resolveContentAssetFromConversation(
  supabase: SupabaseClient,
  organizationId: string,
  conversation: ConversationAttribution
): Promise<ResolvedContentAsset | null> {
  if (conversation.utm_link_id) {
    const { data: utm } = await supabase
      .from("utm_links")
      .select("youtube_video_id, youtube_video_title")
      .eq("id", conversation.utm_link_id)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (utm?.youtube_video_id) {
      const asset = await findAssetByVideoId(
        supabase,
        organizationId,
        String(utm.youtube_video_id)
      );
      if (asset) return asset;
    }

    if (utm?.youtube_video_title) {
      const asset = await findAssetByTitle(
        supabase,
        organizationId,
        String(utm.youtube_video_title)
      );
      if (asset) return asset;
    }
  }

  if (conversation.source_video_title) {
    return findAssetByTitle(
      supabase,
      organizationId,
      conversation.source_video_title
    );
  }

  return null;
}
