import { createAdminClient } from "@/lib/supabase/admin";

export type ManyChatIntegrationRow = {
  organization_id: string;
  api_token: string;
  page_id: string | null;
  page_name: string | null;
  webhook_token: string;
  updated_at?: string;
};

export async function getManyChatIntegrationByWebhookToken(
  webhookToken: string
): Promise<ManyChatIntegrationRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("manychat_integrations")
    .select("organization_id, api_token, page_id, page_name, webhook_token, updated_at")
    .eq("webhook_token", webhookToken)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ManyChatIntegrationRow | null) ?? null;
}

export async function getManyChatIntegrationForOrganization(
  organizationId: string
): Promise<ManyChatIntegrationRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("manychat_integrations")
    .select("organization_id, api_token, page_id, page_name, webhook_token, updated_at")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ManyChatIntegrationRow | null) ?? null;
}

export function buildManyChatWebhookUrl(webhookToken: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/integrations/manychat/webhook/${webhookToken}`;
}
