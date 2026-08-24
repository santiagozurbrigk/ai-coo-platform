/**
 * parse-metrics-import.ts
 * Parseo de métricas históricas desde Excel/CSV en formato ancho.
 *
 * Formato esperado (una fila = un período, una columna = una métrica):
 *   | Fecha     | Revenue | Leads | Conversión | Inversión Ads |
 *   | 01/07/2026 | 15000  | 200   | 4.5        | 3000          |
 *
 * La columna de fecha se detecta automáticamente por alias.
 * El resto de columnas con valores numéricos se importan como metric_key/value.
 */

import { normalizeKey, normalizeDate, normalizeAmount } from "@/lib/clients/column-mapper";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MetricSnapshotInput = {
  period: string;    // YYYY-MM-DD
  metric_key: string;
  value: number;
};

export type ParsedMetricsImport = {
  snapshots: MetricSnapshotInput[];
  errors: { row: number; message: string }[];
  detectedPeriodColumn: string | null;
  detectedMetricColumns: string[];
};

// ─── Aliases para la columna de fecha/período ─────────────────────────────────

const PERIOD_ALIASES = [
  "fecha",
  "fecha de reporte",
  "periodo",
  "período",
  "mes",
  "semana",
  "week",
  "month",
  "date",
  "period",
  "dia",
  "día",
  "fecha inicio",
  "fecha de inicio",
  "inicio del mes",
  "fecha fin",
  "fecha reporte",
];

const _periodAliasSet = new Set(PERIOD_ALIASES.map(normalizeKey));

export function detectPeriodColumn(headers: string[]): string | null {
  for (const header of headers) {
    if (_periodAliasSet.has(normalizeKey(header))) {
      return header;
    }
  }
  return null;
}

// ─── Columnas a ignorar (no son métricas) ─────────────────────────────────────

const IGNORED_COLUMN_ALIASES = new Set([
  ...PERIOD_ALIASES.map(normalizeKey),
  normalizeKey("notas"),
  normalizeKey("notes"),
  normalizeKey("comentario"),
  normalizeKey("comentarios"),
  normalizeKey("observaciones"),
  normalizeKey("fuente"),
  normalizeKey("source"),
]);

export function getMetricColumns(headers: string[], periodColumn: string): string[] {
  return headers.filter((h) => {
    if (h === periodColumn) return false;
    return !IGNORED_COLUMN_ALIASES.has(normalizeKey(h));
  });
}

// ─── Parseo de filas ─────────────────────────────────────────────────────────

/**
 * @param columnToOtcKey - mapa opcional { columna original → key OTC estándar }.
 *   Si se pasa, las columnas reconocidas se guardan con el key OTC (ej. "leads")
 *   en lugar del nombre crudo (ej. "Leads Nuevos").
 */
export function parseMetricsImportRows(
  records: Record<string, string>[],
  periodColumn: string,
  metricColumns: string[],
  columnToOtcKey?: Map<string, string>
): ParsedMetricsImport {
  const snapshots: MetricSnapshotInput[] = [];
  const errors: { row: number; message: string }[] = [];

  if (records.length === 0) {
    return {
      snapshots: [],
      errors: [{ row: 1, message: "El archivo no contiene filas con datos" }],
      detectedPeriodColumn: periodColumn,
      detectedMetricColumns: metricColumns,
    };
  }

  records.forEach((record, index) => {
    const rowNumber = index + 2; // +2 porque row 1 son los headers

    const rawDate = record[periodColumn]?.trim();
    if (!rawDate) {
      errors.push({ row: rowNumber, message: "Fila sin fecha — se omite" });
      return;
    }

    const period = normalizeDate(rawDate);
    if (!period || !/^\d{4}-\d{2}-\d{2}/.test(period)) {
      errors.push({ row: rowNumber, message: `Fecha inválida en fila ${rowNumber}: "${rawDate}"` });
      return;
    }

    let hadAnyValue = false;

    for (const col of metricColumns) {
      const rawValue = record[col]?.trim();
      if (!rawValue) continue; // celda vacía → omitir esta métrica en esta fila

      const normalized = normalizeAmount(rawValue);
      const value = Number(normalized);

      if (!Number.isFinite(value)) {
        errors.push({
          row: rowNumber,
          message: `Valor no numérico en "${col}" (fila ${rowNumber}): "${rawValue}"`,
        });
        continue;
      }

      snapshots.push({
        period: period.substring(0, 10), // solo la fecha YYYY-MM-DD
        metric_key: columnToOtcKey?.get(col) ?? col.trim(),
        value,
      });
      hadAnyValue = true;
    }

    if (!hadAnyValue) {
      errors.push({ row: rowNumber, message: `Fila ${rowNumber} sin valores numéricos — se omite` });
    }
  });

  return {
    snapshots,
    errors,
    detectedPeriodColumn: periodColumn,
    detectedMetricColumns: metricColumns,
  };
}
