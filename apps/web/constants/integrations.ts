export const INTEGRATION_PROVIDERS = [
  "discord",
  "instagram",
  "manychat",
  "youtube",
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
] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];
