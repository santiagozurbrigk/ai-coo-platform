/**
 * A · WINS — tipos del tracker de logros y del dashboard de casos.
 *
 * El tracker y el dashboard no piden los mismos datos: el tracker es por win, el
 * dashboard es por cliente. Lo segundo sale sólo si los wins llevan una medida
 * comparable (ver `lib/wins/derive-case.ts`).
 */
import type { CustomFieldValues } from "@/types/custom-fields";

export const WIN_SOURCES = ["manual", "discord", "fathom"] as const;
export type WinSource = (typeof WIN_SOURCES)[number];

/** Dónde se usó un caso. Cada uso es una fila, no un campo de texto. */
export const WIN_USAGE_CHANNELS = [
  "landing",
  "vsl",
  "ad",
  "story",
  "dm",
  "proposal",
  "other",
] as const;
export type WinUsageChannel = (typeof WIN_USAGE_CHANNELS)[number];

export const WIN_USAGE_CHANNEL_LABEL: Record<WinUsageChannel, string> = {
  landing: "Landing",
  vsl: "VSL",
  ad: "Anuncio",
  story: "Story",
  dm: "DM",
  proposal: "Propuesta",
  other: "Otro",
};

/** Una medida: clave, valor y unidad. Es lo que hace comparables dos wins. */
export type WinMetric = {
  key: string;
  value: number;
  unit: string | null;
};

export type WinAttachment = {
  id: string;
  organizationId: string;
  winId: string | null;
  draftId: string | null;
  fileName: string;
  storagePath: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  /** Link firmado, resuelto al leer. El bucket es privado. */
  signedUrl?: string | null;
};

export type WinUsage = {
  id: string;
  organizationId: string;
  winId: string;
  channel: WinUsageChannel;
  locationLabel: string | null;
  url: string | null;
  usedAt: string | null;
  notes: string | null;
  createdAt: string;
};

export type ClientWin = {
  id: string;
  organizationId: string;
  clientId: string;
  winDate: string;
  achievement: string;
  /** `null` cuando el win no lleva número. La mayoría no lo lleva. */
  metric: WinMetric | null;
  /** Valores de las columnas configurables de C0 (entity = 'win'). */
  custom: CustomFieldValues;
  source: WinSource;
  sourceRef: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: WinAttachment[];
  usages: WinUsage[];
};

/** El baseline del cliente: el punto de partida contra el que se miden los logros. */
export type ClientBaseline = {
  metricKey: string;
  metricValue: number;
  metricUnit: string | null;
  capturedAt: string | null;
};

export type ClientWinRow = {
  id: string;
  organization_id: string;
  client_id: string;
  win_date: string;
  achievement: string;
  metric_key: string | null;
  metric_value: number | string | null;
  metric_unit: string | null;
  custom: unknown;
  source: string;
  source_ref: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type WinAttachmentRow = {
  id: string;
  organization_id: string;
  win_id: string | null;
  draft_id: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
};

export type WinUsageRow = {
  id: string;
  organization_id: string;
  win_id: string;
  channel: string;
  location_label: string | null;
  url: string | null;
  used_at: string | null;
  notes: string | null;
  created_at: string;
};
