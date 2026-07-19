import * as XLSX from "xlsx";
import type { SheetPreview } from "@/types/import";

const MIN_DENSE_COLS = 3;
const SAMPLE_ROWS = 5;
const MAX_SCAN_ROWS = 20;

function excelDateToIso(val: number): string {
  // Excel serial date → JS Date
  const utc = (val - 25569) * 86400 * 1000;
  return new Date(utc).toISOString().slice(0, 10);
}

function cellToString(cell: XLSX.CellObject | undefined): string {
  if (!cell) return "";
  if (cell.t === "d" && cell.v instanceof Date) return cell.v.toISOString().slice(0, 10);
  if (cell.t === "n" && typeof cell.v === "number") {
    // Detect Excel date serial (between 1900-01-01 and 2100-01-01)
    if (cell.v > 1 && cell.v < 73051 && cell.z != null && /[dmy]/i.test(String(cell.z))) {
      return excelDateToIso(cell.v);
    }
    return String(cell.v);
  }
  if (cell.w) return cell.w.trim();
  return String(cell.v ?? "").trim();
}

function detectHeaderRow(ws: XLSX.WorkSheet, range: XLSX.Range): number {
  for (let r = range.s.r; r <= Math.min(range.s.r + MAX_SCAN_ROWS, range.e.r); r++) {
    let filledCols = 0;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v != null && String(cell.v).trim() !== "") filledCols++;
    }
    if (filledCols >= MIN_DENSE_COLS) return r;
  }
  return range.s.r;
}

function detectType(headers: string[], sheetName: string): SheetPreview["detectedType"] {
  const h = headers.join(" ").toLowerCase();
  const n = sheetName.toLowerCase();
  if (h.includes("lead") || h.includes("closer") || h.includes("setter") || h.includes("agenda") || h.includes("llamada") || h.includes("cierre")) {
    return "closing_leads";
  }
  if (h.includes("ingreso") || h.includes("egreso") || h.includes("gasto") || h.includes("pago") || h.includes("factura")) {
    return "finance";
  }
  if (h.includes("post") || h.includes("reel") || h.includes("impresion") || h.includes("alcance") || h.includes("views") || h.includes("reproducc")) {
    return "content";
  }
  if (h.includes("resumen") || h.includes("total") || n.includes("resumen") || n.includes("summary")) {
    return "monthly_summary";
  }
  return "unknown";
}

const TYPE_LABELS: Record<SheetPreview["detectedType"], string> = {
  closing_leads: "Lista de leads / closing",
  monthly_summary: "Resumen mensual",
  finance: "Finanzas / gastos",
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

    // Extract headers
    const headers: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })];
      const val = cellToString(cell);
      if (val) headers.push(val);
    }

    if (headers.length < MIN_DENSE_COLS) continue;

    // Extract sample rows
    const sampleRows: Record<string, string>[] = [];
    const firstDataRow = headerRow + 1;
    const totalDataRows = Math.max(0, range.e.r - firstDataRow + 1);
    let filledCells = 0;
    let totalCells = 0;

    for (let r = firstDataRow; r <= range.e.r; r++) {
      const row: Record<string, string> = {};
      for (let ci = 0; ci < headers.length; ci++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c: range.s.c + ci })];
        const val = cellToString(cell);
        row[headers[ci]] = val;
        totalCells++;
        if (val) filledCells++;
      }
      if (r < firstDataRow + SAMPLE_ROWS) sampleRows.push(row);
    }

    const filledPct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
    const detectedType = detectType(headers, sheetName);

    previews.push({
      name: sheetName,
      headerRow,
      headers,
      sampleRows,
      totalRows: totalDataRows,
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
      if (hasAnyValue) allRows.push(row);
    }
  }

  return allRows;
}
