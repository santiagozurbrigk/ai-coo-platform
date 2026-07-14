export const INTEGRATION_PROVIDERS = [
  "discord",
  "zernio",
  "unipile_instagram",
  "unipile_whatsapp",
  "instagram",
  "manychat",
  "youtube",
  "google_ecosystem",
  "typeform",
  "google_forms",
  "airtable",
  "notion",
  "google_sheets",
  "google_docs",
  "fathom",
  "loom",
  "calendly",
  "miro",
  "clickup",
] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];
