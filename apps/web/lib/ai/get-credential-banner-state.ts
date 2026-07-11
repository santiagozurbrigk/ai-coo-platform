import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { AiCredentialBannerState } from "@/lib/ai/credential-types";
import { isAnthropicOAuthConfigured } from "@/lib/ai/credential-resolver";

export async function getAiCredentialBannerState(): Promise<AiCredentialBannerState | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data } = await supabase
      .from("organization_claude_status")
      .select(
        "has_claude_key, has_claude_oauth, claude_credential_mode, claude_oauth_failed_at"
      )
      .eq("id", organizationId)
      .maybeSingle();

    if (!data) return null;

    const mode =
      (data.claude_credential_mode as AiCredentialBannerState["mode"]) ??
      "api_key_active";

    if (
      mode !== "oauth_active" &&
      mode !== "oauth_degraded"
    ) {
      return null;
    }

    return {
      mode,
      hasOAuth: Boolean(data.has_claude_oauth),
      hasApiKey: Boolean(data.has_claude_key),
      oauthFailedAt: (data.claude_oauth_failed_at as string | null) ?? null,
      oauthConnectAvailable: isAnthropicOAuthConfigured(),
    };
  } catch {
    return null;
  }
}
