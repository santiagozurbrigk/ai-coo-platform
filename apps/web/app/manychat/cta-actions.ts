"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { fetchManyChatSubscriberTags } from "@/lib/manychat/client";
import { getManyChatIntegrationForOrganization } from "@/lib/manychat/integration";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";

export type ManyChatCTAStats = {
  cta_responses: number;
  flows_triggered: number;
  top_flows: Array<{ name: string; count: number }>;
};

function periodBounds(from?: string, to?: string) {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getFullYear(), end.getMonth(), 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export async function updateManyChatCtaTagsAction(
  tags: string[]
): Promise<void> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const normalized = tags.map((tag) => tag.trim()).filter(Boolean);

  const { error } = await admin
    .from("manychat_integrations")
    .update({
      cta_tags: normalized,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  revalidatePath(paths.platform.integrations);
}

export async function syncManyChatCtaEventsAction(): Promise<{ synced: number }> {
  const organizationId = await requireOrganizationId();
  const integration = await getManyChatIntegrationForOrganization(organizationId);
  if (!integration?.api_token) {
    throw new Error("ManyChat no está conectado");
  }

  const admin = createAdminClient();
  const { data: integrationRow } = await admin
    .from("manychat_integrations")
    .select("cta_tags")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const ctaTags = ((integrationRow?.cta_tags as string[] | null) ?? []).map((tag) =>
    tag.toLowerCase()
  );

  if (ctaTags.length === 0) {
    throw new Error("Configurá al menos un tag de CTA en ManyChat");
  }

  const supabase = await createClient();
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("external_ref, last_message_at")
    .eq("organization_id", organizationId)
    .like("external_ref", "manychat:%")
    .order("last_message_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  let synced = 0;

  for (const conversation of conversations ?? []) {
    const externalRef = conversation.external_ref as string;
    const subscriberId = externalRef.replace(/^manychat:/, "");
    if (!subscriberId) continue;

    const tags = await fetchManyChatSubscriberTags(
      integration.api_token,
      subscriberId
    );
    const matchedTags = tags.filter((tag) =>
      ctaTags.includes(tag.toLowerCase())
    );

    if (matchedTags.length === 0) continue;

    for (const tag of matchedTags) {
      const triggeredAt =
        (conversation.last_message_at as string) ?? new Date().toISOString();

      const { data: existing } = await admin
        .from("manychat_events")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("subscriber_id", subscriberId)
        .eq("event_type", "cta_response")
        .eq("tag", tag)
        .gte("triggered_at", triggeredAt.slice(0, 10))
        .maybeSingle();

      if (existing) continue;

      const { error: insertError } = await admin.from("manychat_events").insert({
        organization_id: organizationId,
        subscriber_id: subscriberId,
        event_type: "cta_response",
        tag,
        triggered_at: triggeredAt,
      });

      if (!insertError) synced += 1;
    }
  }

  revalidatePath(paths.platform.integrations);
  return { synced };
}

export async function getManyChatCTAStatsAction(params?: {
  from?: string;
  to?: string;
}): Promise<ManyChatCTAStats> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { from, to } = periodBounds(params?.from, params?.to);

  const { data: events, error } = await supabase
    .from("manychat_events")
    .select("event_type, flow_name, tag, triggered_at")
    .eq("organization_id", organizationId)
    .gte("triggered_at", from)
    .lte("triggered_at", to);

  if (error) throw new Error(error.message);

  const rows = events ?? [];
  const ctaResponses = rows.filter((row) => row.event_type === "cta_response").length;
  const flowsTriggered = rows.filter(
    (row) => row.event_type === "flow_triggered"
  ).length;

  const flowCounts = new Map<string, number>();
  for (const row of rows) {
    const name = (row.flow_name as string | null) ?? (row.tag as string | null);
    if (!name) continue;
    flowCounts.set(name, (flowCounts.get(name) ?? 0) + 1);
  }

  const top_flows = [...flowCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    cta_responses: ctaResponses,
    flows_triggered: flowsTriggered,
    top_flows,
  };
}
