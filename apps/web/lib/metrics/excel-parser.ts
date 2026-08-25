/**
 * Parser de Excel para métricas históricas de ventas y finanzas.
 * Cada fila del archivo representa un período (semana, mes, etc.) con sus KPIs.
 */

import * as XLSX from "xlsx";

// ─── Tipos de mapeo ───────────────────────────────────────────────────────────

export type SalesMetricsColumnMapping = {
  period:             string;  // requerido: columna que identifica el período
  leadsTotales?:      string;
  agendasTotales?:    string;
  asistencias?:       string;
  inasistencias?:     string;
  cierres?:           string;
  noCierres?:         string;
  señas?:             string;
  facturacion?:       string;
  cashCollected?:     string;
  closeRate?:         string;
  showRate?:          string;
  tasaAgendamiento?:  string;
  tasaFantasma?:      string;
  enNutricion?:       string;
  perdidos?:          string;
  seguimientos?:      string;
  tiempoRespuesta?:   string;
};

export type FinanceMetricsColumnMapping = {
  period:         string;   // requerido
  facturacion?:   string;
  cashCollected?: string;
  margen?:        string;
  porCobrar?:     string;
  gastos?:        string;
};

// ─── Fila parseada ────────────────────────────────────────────────────────────

export type MetricsSnapshotRow = {
  periodStart:  string;          // YYYY-MM-DD
  periodLabel:  string;
  metrics:      Record<string, number>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Intenta parsear un valor como número.
 * Acepta porcentajes ("53%"), decimales con coma ("1.250,00") y enteros.
 */
function parseNum(raw: string | undefined): number | null {
  if (!raw) return null;
  const s = raw.toString().trim();
  if (!s) return null;

  // Porcentaje → decimal (ej. "53%" → 0.53)
  if (s.endsWith("%")) {
    const n = parseFloat(s.slice(0, -1).replace(",", "."));
    return isNaN(n) ? null : n / 100;
  }

  // Formato ES con puntos de miles y coma decimal (ej. "1.250,50")
  const normalized = s
    .replace(/\./g, "")   // quitar separadores de miles
    .replace(",", ".");   // coma decimal → punto

  const n = parseFloat(normalized);
  return isNaN(n) ? null : n;
}

/**
 * Convierte un valor de celda a fecha YYYY-MM-DD.
 * Acepta: número serial Excel, ISO string, DD/MM/YYYY, "Semana X", texto libre.
 */
function parseDate(raw: string | undefined): string {
  if (!raw) return new Date().toISOString().split("T")[0];
  const s = raw.toString().trim();

  // Número serial de Excel (días desde 1900-01-01)
  const serial = Number(s);
  if (!isNaN(serial) && serial > 1000 && serial < 100000) {
    const d = XLSX.SSF.parse_date_code(serial);
    if (d) {
      const mm = String(d.m).padStart(2, "0");
      const dd = String(d.d).padStart(2, "0");
      return `${d.y}-${mm}-${dd}`;
    }
  }

  // ISO o MM/DD/YYYY o DD/MM/YYYY
  const parts = s.match(/^(\d{1,4})[\/\-](\d{1,2})[\/\-](\d{1,4})$/);
  if (parts) {
    const [, a, b, c] = parts;
    // Si primer campo tiene 4 dígitos → YYYY-MM-DD
    if (a && a.length === 4) return `${a}-${(b ?? "01").padStart(2, "0")}-${(c ?? "01").padStart(2, "0")}`;
    // Asumir DD/MM/YYYY (formato arg)
    if (c && c.length === 4) return `${c}-${(b ?? "01").padStart(2, "0")}-${(a ?? "01").padStart(2, "0")}`;
  }

  // Texto libre → usar como label, fecha = hoy (se ordenará por inserción)
  return new Date().toISOString().split("T")[0];
}

// ─── Parser genérico ──────────────────────────────────────────────────────────

type AnyMapping = SalesMetricsColumnMapping | FinanceMetricsColumnMapping;

function parseMetricsExcel(
  buffer: Buffer,
  mapping: AnyMapping,
  metricKeys: string[],
  metricDbNames: Record<string, string>,
  sheetName?: string
): { rows: MetricsSnapshotRow[]; errors: Array<{ row: number; message: string }> } {
  const wb = XLSX.read(buffer, { type: "buffer", raw: false });
  const targetSheet = sheetName
    ? (wb.SheetNames.find((n) => n === sheetName) ?? wb.SheetNames[0])
    : wb.SheetNames[0];
  const sheet = wb.Sheets[targetSheet ?? ""];
  if (!sheet) return { rows: [], errors: [{ row: 0, message: "Hoja no encontrada." }] };

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const rows: MetricsSnapshotRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];
  const m = mapping as Record<string, string | undefined>;

  for (let i = 0; i < raw.length; i++) {
    const rowNum = i + 2;
    const data = raw[i] as Record<string, string>;

    const periodCol = m["period"];
    if (!periodCol) {
      errors.push({ row: rowNum, message: "No hay columna de período mapeada." });
      break;
    }

    const periodRaw = String(data[periodCol] ?? "").trim();
    if (!periodRaw) continue; // fila vacía

    const periodStart = parseDate(periodRaw);
    const periodLabel = periodRaw;

    const metrics: Record<string, number> = {};
    for (const key of metricKeys) {
      const col = m[key as string];
      if (!col) continue;
      const val = parseNum(String(data[col] ?? ""));
      if (val !== null) {
        const dbName = metricDbNames[key as string] ?? key;
        metrics[dbName] = val;
      }
    }

    rows.push({ periodStart, periodLabel, metrics });
  }

  return { rows, errors };
}

// ─── Sales metrics ────────────────────────────────────────────────────────────

const SALES_METRIC_KEYS: string[] = [
  "leadsTotales", "agendasTotales", "asistencias", "inasistencias",
  "cierres", "noCierres", "señas", "facturacion", "cashCollected",
  "closeRate", "showRate", "tasaAgendamiento", "tasaFantasma",
  "enNutricion", "perdidos", "seguimientos", "tiempoRespuesta",
];

const SALES_DB_NAMES: Record<string, string> = {
  leadsTotales:    "leads_totales",
  agendasTotales:  "agendas_totales",
  asistencias:     "asistencias",
  inasistencias:   "inasistencias",
  cierres:         "cierres",
  noCierres:       "no_cierres",
  señas:           "señas",
  facturacion:     "facturacion",
  cashCollected:   "cash_collected",
  closeRate:       "close_rate",
  showRate:        "show_rate",
  tasaAgendamiento:"tasa_agendamiento",
  tasaFantasma:    "tasa_fantasma",
  enNutricion:     "en_nutricion",
  perdidos:        "perdidos",
  seguimientos:    "seguimientos",
  tiempoRespuesta: "tiempo_respuesta",
};

export function parseSalesMetricsExcel(
  buffer: Buffer,
  mapping: SalesMetricsColumnMapping,
  sheetName?: string
) {
  return parseMetricsExcel(buffer, mapping, SALES_METRIC_KEYS, SALES_DB_NAMES, sheetName);
}

// ─── Finance metrics ──────────────────────────────────────────────────────────

const FINANCE_METRIC_KEYS: string[] = [
  "facturacion", "cashCollected", "margen", "porCobrar", "gastos",
];

const FINANCE_DB_NAMES: Record<string, string> = {
  facturacion:   "facturacion",
  cashCollected: "cash_collected",
  margen:        "margen",
  porCobrar:     "por_cobrar",
  gastos:        "gastos",
};

export function parseFinanceMetricsExcel(
  buffer: Buffer,
  mapping: FinanceMetricsColumnMapping,
  sheetName?: string
) {
  return parseMetricsExcel(buffer, mapping, FINANCE_METRIC_KEYS, FINANCE_DB_NAMES, sheetName);
}
