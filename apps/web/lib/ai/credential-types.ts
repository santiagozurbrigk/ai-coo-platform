export type ClaudeCredentialMode =
  | "oauth_active"
  | "api_key_active"
  | "oauth_degraded";

export type ClaudeCredentialSource = "oauth" | "api_key" | "global";

export type OrgCredentialState = {
  organizationId: string;
  mode: ClaudeCredentialMode;
  hasOAuth: boolean;
  hasApiKey: boolean;
  apiKeyStatus: "none" | "valid" | "valid_no_credits" | "invalid" | "error";
  oauthFailedAt: string | null;
  oauthLastProbeAt: string | null;
  oauthLastSuccessAt: string | null;
};

export type ResolvedCredential = {
  client: import("@anthropic-ai/sdk").default;
  source: ClaudeCredentialSource;
  mode: ClaudeCredentialMode;
};

export type AiCredentialBannerState = {
  mode: ClaudeCredentialMode;
  hasOAuth: boolean;
  hasApiKey: boolean;
  oauthFailedAt: string | null;
  oauthConnectAvailable: boolean;
};
