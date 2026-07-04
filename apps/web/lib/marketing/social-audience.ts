import { createAdminClient } from "@/lib/supabase/admin";

export type SocialAudienceStats = {
  followers: number;
  newFollowers: number;
};

/** Suma seguidores/suscriptores de integraciones Instagram + YouTube. */
export async function getSocialAudienceStats(
  organizationId: string
): Promise<SocialAudienceStats> {
  const admin = createAdminClient();

  const [{ data: ig }, { data: yt }] = await Promise.all([
    admin
      .from("instagram_integrations")
      .select("followers_count, followers_delta")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .maybeSingle(),
    admin
      .from("youtube_integrations")
      .select("subscriber_count, subscriber_delta")
      .eq("organization_id", organizationId)
      .eq("status", "connected")
      .maybeSingle(),
  ]);

  const igFollowers = Number(ig?.followers_count ?? 0);
  const ytSubs = Number(yt?.subscriber_count ?? 0);
  const igDelta = Number(ig?.followers_delta ?? 0);
  const ytDelta = Number(yt?.subscriber_delta ?? 0);

  return {
    followers: igFollowers + ytSubs,
    newFollowers: igDelta + ytDelta,
  };
}
