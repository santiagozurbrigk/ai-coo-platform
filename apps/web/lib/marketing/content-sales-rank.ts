import { createClient } from "@/lib/supabase/server";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import {
  resolveContentAssetFromConversation,
  type ResolvedContentAsset,
} from "@/lib/marketing/resolve-content-from-conversation";
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

/**
 * Ranking real de contenido por ventas generadas.
 * Atribuye cada venta al content_asset de origen vía:
 *   closing_call → conversación → UTM / source_video_title → asset
 */
export async function getSalesContentRank(
  organizationId: string
): Promise<SalesContentRankView[]> {
  const supabase = await createClient();

  await repairClosingConversationLinks(supabase, organizationId);

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
    .select("id, utm_link_id, source_video_title")
    .eq("organization_id", organizationId)
    .in("id", conversationIds);

  const conversationMap = new Map(
    (conversations ?? []).map((c) => [String(c.id), c])
  );

  const byAsset = new Map<string, SalesContentRankView>();

  for (const client of clientRows) {
    const conversationId = closingToConversation.get(
      String(client.closing_call_id)
    );
    if (!conversationId) continue;

    const conv = conversationMap.get(conversationId);
    if (!conv) continue;

    const asset: ResolvedContentAsset | null =
      await resolveContentAssetFromConversation(supabase, organizationId, {
        utm_link_id: conv.utm_link_id as string | null,
        source_video_title: conv.source_video_title as string | null,
      });

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
