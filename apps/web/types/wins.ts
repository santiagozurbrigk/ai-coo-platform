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

/**
 * ⭐ Los permisos del cliente sobre su propio resultado.
 *
 * Dos preguntas distintas: si **autorizó** el uso público, y **cómo quiere
 * aparecer**. La segunda no es un detalle — es la diferencia entre usar un caso
 * bien y publicar la facturación de alguien que no quería que se supiera.
 */
export const CONSENT_STATUSES = ["not_asked", "granted", "denied"] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export const CONSENT_DISPLAYS = [
  "name_and_face",
  "name_no_numbers",
  "anonymous",
] as const;
export type ConsentDisplay = (typeof CONSENT_DISPLAYS)[number];

export const CONSENT_STATUS_LABEL: Record<ConsentStatus, string> = {
  not_asked: "Sin preguntar",
  granted: "Autorizado",
  denied: "No autoriza",
};

export const CONSENT_DISPLAY_LABEL: Record<ConsentDisplay, string> = {
  name_and_face: "Nombre y cara",
  name_no_numbers: "Nombre, sin los números",
  anonymous: "Solo números, anónimo",
};

/** Lo que las reglas de `lib/wins/consent.ts` necesitan saber de un win. */
export type WinConsent = {
  status: ConsentStatus;
  display: ConsentDisplay | null;
};

/**
 * El estado de uso de un win. `used` y `unused` se derivan de si tiene usos
 * cargados; `reserved` es la única que se declara (ver `lib/wins/usage-state.ts`).
 */
export const USAGE_STATES = ["unused", "used", "reserved"] as const;
export type UsageState = (typeof USAGE_STATES)[number];

export const USAGE_STATE_LABEL: Record<UsageState, string> = {
  unused: "Sin usar",
  used: "Usada",
  reserved: "Reservada",
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
  /** Qué autorizó el cliente. Sin esto, un win no se ofrece como material. */
  consent: WinConsent;
  consentNote: string | null;
  consentUpdatedAt: string | null;
  /** Lo declarado. El estado real sale de `resolveUsageState` con los usos. */
  usageState: UsageState;
  needsScreenshot: boolean;
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
  consent_status: string | null;
  consent_display: string | null;
  consent_note: string | null;
  consent_updated_at: string | null;
  usage_state: string | null;
  needs_screenshot: boolean | null;
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
