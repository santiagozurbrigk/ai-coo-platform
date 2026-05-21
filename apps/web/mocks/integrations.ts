import type { Integration } from "@/types/integrations";

export const mockIntegrations: Integration[] = [
  { id: "int1", provider: "manychat", name: "ManyChat", status: "connected", lastSync: "hace 2 min", recordsSynced: 1284 },
  { id: "int2", provider: "fathom", name: "Fathom", status: "connected", lastSync: "hace 1 h", recordsSynced: 42 },
  { id: "int3", provider: "notion", name: "Notion", status: "syncing", lastSync: "Ahora", recordsSynced: 318 },
  { id: "int4", provider: "airtable", name: "Airtable", status: "connected", lastSync: "hace 4 h", recordsSynced: 890 },
  { id: "int5", provider: "google_sheets", name: "Google Sheets", status: "connected", lastSync: "hace 6 h", recordsSynced: 156 },
  { id: "int6", provider: "google_docs", name: "Google Docs", status: "not_connected" },
  { id: "int7", provider: "loom", name: "Loom", status: "not_connected" },
];
