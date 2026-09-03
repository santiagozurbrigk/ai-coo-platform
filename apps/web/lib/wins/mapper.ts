/**
 * Filas de la base → tipos del dominio de wins.
 *
 * Defensivo con la medida: un win con clave pero sin valor numérico **no tiene
 * medida**, no tiene medida cero. Un número que no se lee no es un cero — misma
 * regla que sostiene el resto del repo.
 */
import {
  WIN_SOURCES,
  WIN_USAGE_CHANNELS,
  type ClientWin,
  type ClientWinRow,
  type WinAttachment,
  type WinAttachmentRow,
  type WinMetric,
  type WinSource,
  type WinUsage,
  type WinUsageChannel,
  type WinUsageRow,
} from "@/types/wins";
import type { CustomFieldValues } from "@/types/custom-fields";

export function rowToClientWin(
  row: ClientWinRow,
  extras: { attachments?: WinAttachment[]; usages?: WinUsage[] } = {}
): ClientWin {
  return {
    id: row.id,
    organizationId: row.organization_id,
    clientId: row.client_id,
    winDate: row.win_date,
    achievement: row.achievement,
    metric: parseMetric(row),
    custom: parseCustom(row.custom),
    source: isWinSource(row.source) ? row.source : "manual",
    sourceRef: row.source_ref,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments: extras.attachments ?? [],
    usages: extras.usages ?? [],
  };
}

/**
 * La medida existe sólo si hay clave **y** un número que se puede leer.
 * `numeric` de Postgres llega como string por el driver, así que se convierte.
 */
function parseMetric(row: ClientWinRow): WinMetric | null {
  const key = row.metric_key?.trim();
  if (!key) return null;

  const raw = row.metric_value;
  const value = typeof raw === "number" ? raw : raw === null ? NaN : Number(raw);
  if (!Number.isFinite(value)) return null;

  const unit = row.metric_unit?.trim();
  return { key, value, unit: unit ? unit : null };
}

function parseCustom(raw: unknown): CustomFieldValues {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw)
    ? (raw as CustomFieldValues)
    : {};
}

export function rowToWinAttachment(row: WinAttachmentRow): WinAttachment {
  return {
    id: row.id,
    organizationId: row.organization_id,
    winId: row.win_id,
    draftId: row.draft_id,
    fileName: row.file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}

export function rowToWinUsage(row: WinUsageRow): WinUsage {
  return {
    id: row.id,
    organizationId: row.organization_id,
    winId: row.win_id,
    channel: isUsageChannel(row.channel) ? row.channel : "other",
    locationLabel: row.location_label,
    url: row.url,
    usedAt: row.used_at,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function isWinSource(value: unknown): value is WinSource {
  return typeof value === "string" && (WIN_SOURCES as readonly string[]).includes(value);
}

export function isUsageChannel(value: unknown): value is WinUsageChannel {
  return (
    typeof value === "string" &&
    (WIN_USAGE_CHANNELS as readonly string[]).includes(value)
  );
}
