import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type UTMParams = {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
};

export type TrackUTMLeadInput = UTMParams & {
  organization_id: string;
  lead_identifier: string;
  lead_email?: string | null;
};

/** Registra captura de lead con UTM e incrementa contador en utm_links. */
export async function trackUTMLeadCapture(
  input: TrackUTMLeadInput
): Promise<{ ok: boolean }> {
  const { organization_id, utm_campaign, lead_identifier, lead_email } = input;

  if (!utm_campaign || !organization_id || !isSupabaseConfigured()) {
    return { ok: false };
  }

  const supabase = createAdminClient();

  const { data: utmLink } = await supabase
    .from("utm_links")
    .select("id")
    .eq("organization_id", organization_id)
    .eq("utm_campaign", utm_campaign)
    .maybeSingle();

  const { error: insertError } = await supabase
    .from("utm_lead_captures")
    .insert({
      organization_id,
      utm_link_id: utmLink?.id ?? null,
      utm_source: input.utm_source ?? null,
      utm_medium: input.utm_medium ?? null,
      utm_campaign,
      utm_content: input.utm_content ?? null,
      lead_identifier,
      lead_email: lead_email ?? null,
    });

  if (insertError) {
    console.error("[utm] lead capture:", insertError.message);
    return { ok: false };
  }

  if (utmLink?.id) {
    const { error: rpcError } = await supabase.rpc("increment_utm_leads", {
      utm_id: utmLink.id,
    });
    if (rpcError) {
      console.error("[utm] increment leads:", rpcError.message);
    }
  }

  return { ok: true };
}

/** Registra click en utm_links por campaña. */
export async function trackUTMClick(
  utm_campaign: string,
  organization_id: string
): Promise<{ ok: boolean }> {
  if (!utm_campaign || !organization_id || !isSupabaseConfigured()) {
    return { ok: false };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("increment_utm_clicks", {
    campaign: utm_campaign,
    org_id: organization_id,
  });

  if (error) {
    console.error("[utm] increment clicks:", error.message);
    return { ok: false };
  }

  return { ok: true };
}
