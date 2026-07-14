"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { fetchManyChatFlows, type ManyChatFlow } from "@/lib/manychat/client";
import { getManyChatIntegrationForOrganization } from "@/lib/manychat/integration";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AutomationFlow = {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  source: "manychat";
};

function normalizeStatus(raw: string): AutomationFlow["status"] {
  if (raw === "enabled") return "active";
  if (raw === "disabled") return "paused";
  return "draft";
}

function manyChatFlowToAutomation(flow: ManyChatFlow): AutomationFlow {
  return {
    id: flow.ns,
    name: flow.name,
    status: normalizeStatus(flow.status),
    source: "manychat",
  };
}

export async function listAutomationFlowsAction(): Promise<{
  flows: AutomationFlow[];
  manychatConnected: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { flows: [], manychatConnected: false };
  }

  const organizationId = await requireOrganizationId();
  const integration = await getManyChatIntegrationForOrganization(organizationId);

  if (!integration?.api_token) {
    return { flows: [], manychatConnected: false };
  }

  const raw = await fetchManyChatFlows(integration.api_token);
  const flows = raw.map(manyChatFlowToAutomation);

  return { flows, manychatConnected: true };
}
