import { createClient } from "@/lib/supabase/server";
import type { ContentType } from "@/types/marketing-insights";

export type SalesContentRankView = {
  contentId: string;
  title: string;
  type: ContentType;
  thumbnailHue: number;
  publishLabel: string;
  salesCount: number;
  revenue: number;
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
  return "vsl";
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

/**
 * Ranking real de contenido por ventas generadas. Atribuye cada venta
 * (clients.total_amount) al content_asset de origen siguiendo la misma cadena
 * que `lib/sales/lead-journey.ts`:
 *   clients.closing_call_id → closing_calls.conversation_id →
 *   conversations.utm_link_id → utm_links.youtube_video_id =
 *   content_assets.external_id
 *
 * Devuelve vacío si todavía no hay ninguna venta atribuible a contenido.
 */
export async function getSalesContentRank(
  organizationId: string
): Promise<SalesContentRankView[]> {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, total_amount, closing_call_id")
    .eq("organization_id", organizationId)
    .not("closing_call_id", "is", null);

  const clientRows = (clients ?? []).filter((c) => c.closing_call_id);
  if (clientRows.length === 0) return [];

  const closingIds = [
    ...new Set(clientRows.map((c) => String(c.closing_call_id))),
  ];

  const { data: closingCalls } = await supabase
    .from("closing_calls")
    .select("id, conversation_id")
    .eq("organization_id", organizationId)
    .in("id", closingIds);

  const closingToConversation = new Map<string, string>();
  for (const row of closingCalls ?? []) {
    if (row.conversation_id) {
      closingToConversation.set(String(row.id), String(row.conversation_id));
    }
  }
  if (closingToConversation.size === 0) return [];

  const conversationIds = [...new Set(closingToConversation.values())];

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, utm_link_id")
    .eq("organization_id", organizationId)
    .in("id", conversationIds)
    .not("utm_link_id", "is", null);

  const conversationToUtm = new Map<string, string>();
  for (const row of conversations ?? []) {
    if (row.utm_link_id) {
      conversationToUtm.set(String(row.id), String(row.utm_link_id));
    }
  }
  if (conversationToUtm.size === 0) return [];

  const utmIds = [...new Set(conversationToUtm.values())];

  const { data: utmLinks } = await supabase
    .from("utm_links")
    .select("id, youtube_video_id")
    .eq("organization_id", organizationId)
    .in("id", utmIds)
    .not("youtube_video_id", "is", null);

  const utmToVideo = new Map<string, string>();
  for (const row of utmLinks ?? []) {
    if (row.youtube_video_id) {
      utmToVideo.set(String(row.id), String(row.youtube_video_id));
    }
  }
  if (utmToVideo.size === 0) return [];

  const videoIds = [...new Set(utmToVideo.values())];

  const { data: assets } = await supabase
    .from("content_assets")
    .select("id, title, caption, content_type, external_id, published_at")
    .eq("organization_id", organizationId)
    .eq("platform", "youtube")
    .in("external_id", videoIds);

  const videoToAsset = new Map<
    string,
    {
      id: string;
      title: string;
      type: ContentType;
      thumbnailHue: number;
      publishLabel: string;
    }
  >();
  for (const row of assets ?? []) {
    const title =
      (row.title as string)?.trim() ||
      (row.caption as string)?.trim().slice(0, 80) ||
      "Sin título";
    videoToAsset.set(String(row.external_id), {
      id: String(row.id),
      title,
      type: mapContentType(row.content_type as string | null),
      thumbnailHue: hueFromId(String(row.id)),
      publishLabel: publishLabel(row.published_at as string | null),
    });
  }
  if (videoToAsset.size === 0) return [];

  const byAsset = new Map<string, SalesContentRankView>();

  for (const client of clientRows) {
    const conversationId = closingToConversation.get(
      String(client.closing_call_id)
    );
    if (!conversationId) continue;
    const utmId = conversationToUtm.get(conversationId);
    if (!utmId) continue;
    const videoId = utmToVideo.get(utmId);
    if (!videoId) continue;
    const asset = videoToAsset.get(videoId);
    if (!asset) continue;

    const existing = byAsset.get(asset.id);
    const revenue = Number(client.total_amount ?? 0);
    if (existing) {
      existing.salesCount += 1;
      existing.revenue += revenue;
    } else {
      byAsset.set(asset.id, {
        contentId: asset.id,
        title: asset.title,
        type: asset.type,
        thumbnailHue: asset.thumbnailHue,
        publishLabel: asset.publishLabel,
        salesCount: 1,
        revenue,
      });
    }
  }

  return [...byAsset.values()].sort((a, b) => b.revenue - a.revenue);
}
