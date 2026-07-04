import type { SupabaseClient } from "@supabase/supabase-js";
import { incrementContentAssetFromUtm } from "@/lib/marketing/content-attribution";

/** Cruza ref de ManyChat con utm_links y atribuye la conversación. */
export async function attributeConversationFromManyChatRef(
  supabase: SupabaseClient,
  organizationId: string,
  conversationId: string,
  ref: string,
  leadIdentifier: string
): Promise<void> {
  const { data: utmLink } = await supabase
    .from("utm_links")
    .select("id, youtube_video_title, utm_campaign")
    .eq("organization_id", organizationId)
    .eq("manychat_ref", ref)
    .maybeSingle();

  if (!utmLink) return;

  const { error: updateError } = await supabase
    .from("conversations")
    .update({
      utm_source: "youtube",
      utm_campaign: utmLink.utm_campaign,
      utm_link_id: utmLink.id,
      source_video_title: utmLink.youtube_video_title,
    })
    .eq("id", conversationId)
    .eq("organization_id", organizationId);

  if (updateError) {
    console.error("[utm] conversation attribution:", updateError.message);
    return;
  }

  await supabase.from("utm_lead_captures").insert({
    organization_id: organizationId,
    utm_link_id: utmLink.id,
    utm_source: "youtube",
    utm_medium: "video",
    utm_campaign: utmLink.utm_campaign,
    lead_identifier: leadIdentifier,
    converted_to_conversation: true,
  });

  const { error: rpcError } = await supabase.rpc("increment_utm_leads", {
    utm_id: utmLink.id,
  });
  if (rpcError) {
    console.error("[utm] increment leads (manychat):", rpcError.message);
  }

  await incrementContentAssetFromUtm(
    organizationId,
    utmLink.id,
    "conversations_generated"
  ).catch((err) => {
    console.error("[utm] content asset conversation:", err);
  });
}
