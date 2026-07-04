import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

type MetricField =
  | "conversations_generated"
  | "bookings_influenced"
  | "sales_influenced"
  | "revenue_influenced";

/** Resuelve content_asset.id desde utm_links.youtube_video_id (= external_id de YouTube). */
export async function resolveContentAssetIdFromUtmLink(
  supabase: SupabaseClient,
  organizationId: string,
  utmLinkId: string
): Promise<string | null> {
  const { data: utm } = await supabase
    .from("utm_links")
    .select("youtube_video_id, youtube_video_title")
    .eq("id", utmLinkId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  const videoId = utm?.youtube_video_id?.trim();
  if (videoId) {
    const { data: asset } = await supabase
      .from("content_assets")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("platform", "youtube")
      .eq("external_id", videoId)
      .maybeSingle();

    if (asset?.id) return asset.id;
  }

  const title = utm?.youtube_video_title?.trim();
  if (title) {
    const { data: byTitle } = await supabase
      .from("content_assets")
      .select("id")
      .eq("organization_id", organizationId)
      .ilike("title", title)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (byTitle?.id) return byTitle.id;
  }

  return null;
}

async function incrementAssetMetric(
  supabase: SupabaseClient,
  assetId: string,
  field: MetricField,
  amount = 1
): Promise<void> {
  const { data: row, error: readError } = await supabase
    .from("content_assets")
    .select(
      "conversations_generated, bookings_influenced, sales_influenced, revenue_influenced"
    )
    .eq("id", assetId)
    .maybeSingle();

  if (readError || !row) {
    console.error("[content-attribution] asset no encontrado:", assetId);
    return;
  }

  const patch: Record<string, number> = {};
  if (field === "conversations_generated") {
    patch.conversations_generated =
      Number(row.conversations_generated ?? 0) + amount;
  } else if (field === "bookings_influenced") {
    patch.bookings_influenced = Number(row.bookings_influenced ?? 0) + amount;
  } else if (field === "sales_influenced") {
    patch.sales_influenced = Number(row.sales_influenced ?? 0) + amount;
  } else if (field === "revenue_influenced") {
    patch.revenue_influenced =
      Number(row.revenue_influenced ?? 0) + amount;
  }

  const { error: updateError } = await supabase
    .from("content_assets")
    .update(patch)
    .eq("id", assetId);

  if (updateError) {
    console.error("[content-attribution] update:", updateError.message);
  }
}

/** Incrementa contadores del asset vinculado a un UTM (si tiene youtube_video_id). */
export async function incrementContentAssetFromUtm(
  organizationId: string,
  utmLinkId: string,
  metric: MetricField,
  amount = 1
): Promise<void> {
  const admin = createAdminClient();
  const assetId = await resolveContentAssetIdFromUtmLink(
    admin,
    organizationId,
    utmLinkId
  );
  if (!assetId) return;
  await incrementAssetMetric(admin, assetId, metric, amount);
}

/**
 * Recalcula contadores de atribución por asset desde tablas UTM.
 * Corrige datos históricos que quedaron en 0 antes de escribir en tiempo real.
 */
export async function recomputeContentAssetAttribution(
  organizationId: string
): Promise<void> {
  const admin = createAdminClient();

  const { data: utmLinks } = await admin
    .from("utm_links")
    .select("id, youtube_video_id")
    .eq("organization_id", organizationId)
    .not("youtube_video_id", "is", null);

  if (!utmLinks?.length) return;

  const utmToVideo = new Map<string, string>();
  const videoIds = new Set<string>();
  for (const row of utmLinks) {
    const vid = String(row.youtube_video_id ?? "").trim();
    if (!vid) continue;
    utmToVideo.set(String(row.id), vid);
    videoIds.add(vid);
  }
  if (videoIds.size === 0) return;

  const { data: assets } = await admin
    .from("content_assets")
    .select("id, external_id")
    .eq("organization_id", organizationId)
    .eq("platform", "youtube")
    .in("external_id", [...videoIds]);

  const videoToAssetId = new Map<string, string>();
  for (const asset of assets ?? []) {
    videoToAssetId.set(String(asset.external_id), String(asset.id));
  }

  const utmToAssetId = new Map<string, string>();
  for (const [utmId, videoId] of utmToVideo) {
    const assetId = videoToAssetId.get(videoId);
    if (assetId) utmToAssetId.set(utmId, assetId);
  }
  if (utmToAssetId.size === 0) return;

  const counters = new Map<
    string,
    {
      conversations: number;
      bookings: number;
      sales: number;
      revenue: number;
    }
  >();

  const ensure = (assetId: string) => {
    if (!counters.has(assetId)) {
      counters.set(assetId, {
        conversations: 0,
        bookings: 0,
        sales: 0,
        revenue: 0,
      });
    }
    return counters.get(assetId)!;
  };

  const utmIds = [...utmToAssetId.keys()];

  const { data: leadCaptures } = await admin
    .from("utm_lead_captures")
    .select("utm_link_id, converted_to_conversation")
    .eq("organization_id", organizationId)
    .in("utm_link_id", utmIds);

  for (const row of leadCaptures ?? []) {
    if (!row.converted_to_conversation || !row.utm_link_id) continue;
    const assetId = utmToAssetId.get(String(row.utm_link_id));
    if (assetId) ensure(assetId).conversations += 1;
  }

  const { data: bookings } = await admin
    .from("utm_booking_attributions")
    .select("utm_link_id")
    .eq("organization_id", organizationId)
    .in("utm_link_id", utmIds);

  for (const row of bookings ?? []) {
    if (!row.utm_link_id) continue;
    const assetId = utmToAssetId.get(String(row.utm_link_id));
    if (assetId) ensure(assetId).bookings += 1;
  }

  const { data: sales } = await admin
    .from("utm_sale_attributions")
    .select("utm_link_id, revenue")
    .eq("organization_id", organizationId)
    .in("utm_link_id", utmIds);

  for (const row of sales ?? []) {
    if (!row.utm_link_id) continue;
    const assetId = utmToAssetId.get(String(row.utm_link_id));
    if (assetId) {
      const c = ensure(assetId);
      c.sales += 1;
      c.revenue += Number(row.revenue ?? 0);
    }
  }

  const assetIds = [...counters.keys()];

  await admin
    .from("content_assets")
    .update({
      conversations_generated: 0,
      bookings_influenced: 0,
      sales_influenced: 0,
      revenue_influenced: 0,
    })
    .eq("organization_id", organizationId)
    .in("external_id", [...videoIds]);

  for (const assetId of assetIds) {
    const c = counters.get(assetId)!;
    await admin
      .from("content_assets")
      .update({
        conversations_generated: c.conversations,
        bookings_influenced: c.bookings,
        sales_influenced: c.sales,
        revenue_influenced: c.revenue,
      })
      .eq("id", assetId);
  }
}
