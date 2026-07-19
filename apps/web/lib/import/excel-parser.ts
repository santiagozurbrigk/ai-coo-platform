import * as XLSX from "xlsx";
import type { SheetPreview } from "@/types/import";

const MIN_DENSE_COLS = 3;
const SAMPLE_ROWS = 5;
const MAX_SCAN_ROWS = 30;

// Rows that are section separators or totals — skip during import
const SEPARATOR_PATTERNS = /^(semana\s*\d|total\s*:|total\s+final|resumen|subtotal)/i;

function excelDateToIso(val: number): string {
  const utc = (val - 25569) * 86400 * 1000;
  return new Date(utc).toISOString().slice(0, 10);
}

function cellToString(cell: XLSX.CellObject | undefined): string {
  if (!cell) return "";
  if (cell.t === "d" && cell.v instanceof Date) return cell.v.toISOString().slice(0, 10);
  if (cell.t === "n" && typeof cell.v === "number") {
    if (cell.v > 1 && cell.v < 73051 && cell.z != null && /[dmy]/i.test(String(cell.z))) {
      return excelDateToIso(cell.v);
    }
    return String(cell.v);
  }
  if (cell.w) return cell.w.trim();
  return String(cell.v ?? "").trim();
}

/**
 * Find the header row by choosing the row with the most DISTINCT non-empty
 * string values. This handles sheets where merged section-header rows (e.g.
 * "DATOS DE IDENTIFICACIÓN" spanning 10 cols) appear before the real header
 * row — those rows have few unique values even though they fill many cells.
 */
function detectHeaderRow(ws: XLSX.WorkSheet, range: XLSX.Range): number {
  let bestRow = range.s.r;
  let bestScore = -1;

  for (let r = range.s.r; r <= Math.min(range.s.r + MAX_SCAN_ROWS, range.e.r); r++) {
    const seen = new Set<string>();
    let filled = 0;

    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (!cell || cell.v == null) continue;
      const val = String(cell.v).trim();
      if (!val) continue;
      filled++;
      seen.add(val);
    }

    // Score = number of DISTINCT values (penalizes merged-cell repetition)
    if (filled >= MIN_DENSE_COLS && seen.size > bestScore) {
      bestScore = seen.size;
      bestRow = r;
    }

    // If we found a very dense unique row, no need to scan further
    if (seen.size >= 8) break;
  }

  return bestRow;
}

function isSeparatorRow(row: Record<string, string>): boolean {
  for (const val of Object.values(row)) {
    if (val && SEPARATOR_PATTERNS.test(val.trim())) return true;
  }
  return false;
}

function detectType(headers: string[], sheetName: string): SheetPreview["detectedType"] {
  const h = headers.join(" ").toLowerCase();
  const n = sheetName.toLowerCase();
  if (
    h.includes("lead") || h.includes("closer") || h.includes("setter") ||
    h.includes("agenda") || h.includes("llamada") || h.includes("cierre") ||
    n.includes("agenda") || n.includes("ventas") || n.includes("closing")
  ) {
    return "closing_leads";
  }
  if (
    h.includes("ingreso") || h.includes("egreso") || h.includes("gasto") ||
    h.includes("pago") || h.includes("factura") || h.includes("cobrado") ||
    n.includes("pago") || n.includes("finanza") || n.includes("gasto")
  ) {
    return "finance";
  }
  if (
    h.includes("post") || h.includes("reel") || h.includes("impresion") ||
    h.includes("alcance") || h.includes("views") || h.includes("reproducc")
  ) {
    return "content";
  }
  if (
    h.includes("resumen") || h.includes("total") ||
    n.includes("resumen") || n.includes("summary") || n.includes("dashboard")
  ) {
    return "monthly_summary";
  }
  return "unknown";
}

const TYPE_LABELS: Record<SheetPreview["detectedType"], string> = {
  closing_leads: "Lista de leads / closing",
  monthly_summary: "Resumen mensual",
  finance: "Finanzas / pagos",
  content: "Contenido / métricas",
  unknown: "Tipo no detectado",
};

export function parseWorkbookSheets(buffer: Buffer): SheetPreview[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellNF: true });
  const previews: SheetPreview[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws || !ws["!ref"]) continue;

    const range = XLSX.utils.decode_range(ws["!ref"]);
    const headerRow = detectHeaderRow(ws, range);

    // Extract headers — deduplicate by appending suffix when two cols share the same name
    const headers: string[] = [];
    const headerCount: Record<string, number> = {};
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })];
      const val = cellToString(cell);
      if (!val) continue;
      headerCount[val] = (headerCount[val] ?? 0) + 1;
      const label = headerCount[val] > 1 ? `${val} (${headerCount[val]})` : val;
      headers.push(label);
    }

    if (headers.length < MIN_DENSE_COLS) continue;

    // Extract sample rows — skip separators
    const sampleRows: Record<string, string>[] = [];
    const firstDataRow = headerRow + 1;
    let dataRowCount = 0;
    let filledCells = 0;
    let totalCells = 0;

    for (let r = firstDataRow; r <= range.e.r; r++) {
      const row: Record<string, string> = {};
      let hasAnyValue = false;
      for (let ci = 0; ci < headers.length; ci++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c: range.s.c + ci })];
        const val = cellToString(cell);
        row[headers[ci]] = val;
        totalCells++;
        if (val) { filledCells++; hasAnyValue = true; }
      }
      if (!hasAnyValue || isSeparatorRow(row)) continue;
      dataRowCount++;
      if (sampleRows.length < SAMPLE_ROWS) sampleRows.push(row);
    }

    const filledPct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
    const detectedType = detectType(headers, sheetName);

    previews.push({
      name: sheetName,
      headerRow,
      headers,
      sampleRows,
      totalRows: dataRowCount,
      filledPct,
      detectedType,
      detectedTypeLabel: TYPE_LABELS[detectedType],
    });
  }

  return previews;
}

export function extractRowsFromSheets(
  buffer: Buffer,
  selectedSheets: string[],
  headersBySheet: Record<string, { headerRow: number; headers: string[] }>
): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true, cellNF: true });
  const allRows: Record<string, string>[] = [];

  for (const sheetName of selectedSheets) {
    const ws = workbook.Sheets[sheetName];
    if (!ws || !ws["!ref"]) continue;

    const range = XLSX.utils.decode_range(ws["!ref"]);
    const { headerRow, headers } = headersBySheet[sheetName] ?? { headerRow: 0, headers: [] };
    if (headers.length === 0) continue;

    for (let r = headerRow + 1; r <= range.e.r; r++) {
      const row: Record<string, string> = {};
      let hasAnyValue = false;
      for (let ci = 0; ci < headers.length; ci++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c: range.s.c + ci })];
        const val = cellToString(cell);
        row[headers[ci]] = val;
        if (val) hasAnyValue = true;
      }
      // Skip empty rows and separator rows (Semana X, TOTAL:, etc.)
      if (!hasAnyValue || isSeparatorRow(row)) continue;
      allRows.push(row);
    }
  }

  return allRows;
}
