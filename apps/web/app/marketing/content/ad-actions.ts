"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import type { ZernioLinkedAd } from "@/lib/zernio/client";
import { getZernioClientForOrganization } from "@/lib/zernio/integration";

export async function getContentPieceAdsAction(
  contentPieceId: string
): Promise<{ ads: ZernioLinkedAd[] }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: piece, error } = await supabase
    .from("content_pieces")
    .select("platform_post_id")
    .eq("id", contentPieceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!piece?.platform_post_id) {
    return { ads: [] };
  }

  const client = await getZernioClientForOrganization(organizationId);
  const response = await client.getLinkedAds(String(piece.platform_post_id));
  return { ads: response.ads ?? [] };
}
