"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import type { ZernioLinkedAd } from "@/lib/zernio/client";
import { getZernioClientForOrganization } from "@/lib/zernio/integration";

export type MarketingAdsFilters = {
  status?: string;
  platform?: string;
  fromDate?: string;
  toDate?: string;
};

export type MarketingAdsResult = {
  ads: ZernioLinkedAd[];
  pagination: {
    hasMore?: boolean;
    cursor?: string | null;
    total?: number;
  } | null;
  error?: string;
};

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

export async function getMarketingAdsAction(
  filters?: MarketingAdsFilters
): Promise<MarketingAdsResult> {
  const organizationId = await requireOrganizationId();

  try {
    const client = await getZernioClientForOrganization(organizationId);
    const apiStatus =
      filters?.status === "error" ? undefined : filters?.status;

    const response = await client.listAds({
      source: "all",
      limit: 100,
      status: apiStatus,
      platform: filters?.platform,
      fromDate: filters?.fromDate,
      toDate: filters?.toDate,
    });

    let ads = response.ads ?? [];
    if (filters?.status === "error") {
      ads = ads.filter(
        (ad) => ad.status === "error" || ad.status === "rejected"
      );
    }

    return {
      ads,
      pagination: response.pagination ?? null,
    };
  } catch (err) {
    return {
      ads: [],
      pagination: null,
      error:
        err instanceof Error ? err.message : "No se pudieron cargar los anuncios",
    };
  }
}
