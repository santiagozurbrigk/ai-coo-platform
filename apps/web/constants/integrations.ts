export const INTEGRATION_PROVIDERS = [
  "manychat",
  "airtable",
  "notion",
  "google_sheets",
  "google_docs",
  "fathom",
  "loom",
] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];
