export type GoogleIntegrationProvider = "google_forms" | "youtube";

/** Inicio OAuth Google (prompt=consent vía googleAuthUrl). */
export const GOOGLE_OAUTH_START_URL: Record<GoogleIntegrationProvider, string> = {
  google_forms: "/api/integrations/google-forms/oauth/start",
  youtube: "/api/integrations/youtube/oauth/start",
};

export function isGoogleIntegrationProvider(
  provider: string
): provider is GoogleIntegrationProvider | "google_ecosystem" {
  return (
    provider === "google_forms" ||
    provider === "youtube" ||
    provider === "google_ecosystem"
  );
}

export function googleOAuthProviderForCard(
  provider: string
): GoogleIntegrationProvider {
  return provider === "youtube" ? "youtube" : "google_forms";
}
