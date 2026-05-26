export const INTEGRATION_PROVIDERS = [
  "instagram",
  "manychat",
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
