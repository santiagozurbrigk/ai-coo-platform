import type { Integration } from "@/types/integrations";

export const mockIntegrations: Integration[] = [
  {
    id: "int-zernio",
    provider: "zernio",
    name: "Zernio",
    status: "not_connected",
    description:
      "DMs, comentarios y analytics de Instagram, Facebook, WhatsApp y más.",
  },
  {
    id: "int-unipile-wa",
    provider: "unipile_whatsapp",
    name: "WhatsApp",
    status: "not_connected",
    description:
      "Conectá tu WhatsApp personal para recibir mensajes en el inbox de ventas.",
  },
  {
    id: "int-ig",
    provider: "instagram",
    name: "Instagram",
    status: "not_connected",
  },
  { id: "int1", provider: "manychat", name: "ManyChat", status: "not_connected" },
  { id: "int2", provider: "fathom", name: "Fathom", status: "not_connected" },
  { id: "int-yt", provider: "youtube", name: "YouTube", status: "not_connected" },
  { id: "int-tf", provider: "typeform", name: "Typeform", status: "not_connected" },
  { id: "int-gf", provider: "google_forms", name: "Google Forms", status: "not_connected" },
  { id: "int3", provider: "notion", name: "Notion", status: "syncing", lastSync: "Ahora", recordsSynced: 318, hidden: true },
  { id: "int4", provider: "airtable", name: "Airtable", status: "connected", lastSync: "hace 4 h", recordsSynced: 890, hidden: true },
  { id: "int5", provider: "google_sheets", name: "Google Sheets", status: "connected", lastSync: "hace 6 h", recordsSynced: 156, hidden: true },
  { id: "int6", provider: "google_docs", name: "Google Docs", status: "not_connected", hidden: true },
  { id: "int7", provider: "loom", name: "Loom", status: "not_connected", hidden: true },
  {
    id: "int8",
    provider: "calendly",
    name: "Calendly",
    status: "not_connected",
  },
  { id: "int9", provider: "miro", name: "Miro", status: "not_connected", hidden: true },
  {
    id: "int-discord",
    provider: "discord",
    name: "Discord",
    status: "not_connected",
    description:
      "Conectá tu servidor para capturar conversaciones con clientes, detectar testimonios automáticamente y tener visibilidad completa de cada cliente.",
  },
];
