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

// ─── Transposed / Pivot format ────────────────────────────────────────────────
// Formato donde los períodos (meses) son columnas y las métricas son filas.
// Ejemplo: fila 1 = título, fila 2 = "Métricas | Marzo | Abril | ...",
//          filas 3+ = "Leads totales | 150 | 180 | ..."

const MONTH_ES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  ene: 1, feb: 2, mar: 3, abr: 4, jun: 6, jul: 7, ago: 8,
  sep: 9, oct: 10, nov: 11, dic: 12, jan: 1, aug: 8,
};

/**
 * Convierte "Marzo 2025", "marzo", "03/2025", "2025-03" → "YYYY-MM-01".
 * Retorna null si no reconoce el texto como período de mes.
 */
function parseMonthLabel(raw: string, fallbackYear?: number): string | null {
  const s = raw.trim().toLowerCase();
  // "MM/YYYY"
  const mmyyyy = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (mmyyyy) return `${mmyyyy[2]}-${mmyyyy[1]!.padStart(2, "0")}-01`;
  // "YYYY/MM" or "YYYY-MM"
  const yyyymm = s.match(/^(\d{4})[\/\-](\d{1,2})$/);
  if (yyyymm) return `${yyyymm[1]}-${yyyymm[2]!.padStart(2, "0")}-01`;

  const parts = s.split(/[\s\-_,]+/);
  let monthNum: number | undefined;
  let year = fallbackYear ?? new Date().getFullYear();

  for (const part of parts) {
    const m = MONTH_ES[part];
    if (m !== undefined) { monthNum = m; continue; }
    const y = parseInt(part, 10);
    if (!isNaN(y) && y > 2000 && y < 2100) year = y;
  }
  if (monthNum === undefined) return null;
  return `${year}-${String(monthNum).padStart(2, "0")}-01`;
}

/**
 * Detecta si una lista de encabezados corresponde a formato pivotado
 * (al menos 2 encabezados parecen nombres de mes).
 */
export function isTransposedMetricsSheet(headers: string[]): boolean {
  let count = 0;
  for (const h of headers) {
    if (parseMonthLabel(h) !== null) count++;
    if (count >= 2) return true;
  }
  return false;
}

// ─── Diccionarios de etiquetas de fila ───────────────────────────────────────

/** Maps etiqueta de fila (lowercase) → field key de SalesMetricsColumnMapping */
const SALES_ROW_LABEL_MAP: Record<string, string> = {
  // Leads
  "leads totales": "leadsTotales",
  "leads": "leadsTotales",
  "total leads": "leadsTotales",
  "leads nuevos": "leadsTotales",

  // Tasa de agendamiento
  "tasa de agenda": "tasaAgendamiento",
  "tasa de agendamiento": "tasaAgendamiento",
  "tasa agendamiento": "tasaAgendamiento",
  "% tasa de agenda": "tasaAgendamiento",

  // Agendas
  "agendas totales": "agendasTotales",
  "llamadas agendadas (total)": "agendasTotales",
  "llamadas agendadas": "agendasTotales",
  "agendas": "agendasTotales",
  "total agendas": "agendasTotales",

  // Asistencias / shows
  "asistencias": "asistencias",
  "llamadas calificadas (agendadas)": "asistencias",
  "llamadas calificadas": "asistencias",
  "llamadas presentadas (total)": "asistencias",
  "presentados": "asistencias",
  "shows": "asistencias",

  // Inasistencias / no-shows
  "inasistencias": "inasistencias",
  "llamadas no calificadas (agendadas)": "inasistencias",
  "llamadas no calificadas": "inasistencias",
  "no shows": "inasistencias",
  "no-shows": "inasistencias",

  // Show rate
  "show rate": "showRate",
  "show up rate (total)": "showRate",
  "show up rate": "showRate",
  "tasa de show": "showRate",
  "% calificados (de agendas)": "showRate",
  "% show rate": "showRate",
  "tasa show": "showRate",

  // Cierres
  "cierres": "cierres",
  "unidades cerradas totales": "cierres",
  "unidades cerradas": "cierres",
  "ventas": "cierres",
  "unidades cerradas en llamada": "cierres",

  // No cierres
  "no cierres": "noCierres",
  "no cierre": "noCierres",

  // Señas
  "señas": "señas",
  "seña": "señas",

  // Facturación
  "facturación": "facturacion",
  "facturacion": "facturacion",
  "facturado": "facturacion",
  "aov dia 1": "facturacion",
  "aov trato cerrado": "facturacion",
  "ticket promedio": "facturacion",
  "revenue": "facturacion",

  // Cash collected
  "cash collected": "cashCollected",
  "cc mes": "cashCollected",
  "cobrado": "cashCollected",
  "cobros": "cashCollected",
  "cash cobrado": "cashCollected",

  // Close rate
  "close rate": "closeRate",
  "tasa de cierre total": "closeRate",
  "tasa de cierre": "closeRate",
  "tasa cierre": "closeRate",
  "% de cierre": "closeRate",
  "tasa de cierre calificadas": "closeRate",
  "% close rate": "closeRate",

  // Tasa fantasma
  "tasa de fantasma": "tasaFantasma",
  "tasa fantasma": "tasaFantasma",
  "fantasmas": "tasaFantasma",
  "% fantasma": "tasaFantasma",

  // En nutrición
  "en nutrición": "enNutricion",
  "en nutricion": "enNutricion",
  "nutrición": "enNutricion",
  "nutricion": "enNutricion",

  // Perdidos
  "perdidos": "perdidos",

  // Seguimientos
  "seguimientos": "seguimientos",
  "unidades cerradas en seguimiento": "seguimientos",
  "cierres en seguimiento": "seguimientos",

  // Tiempo de respuesta
  "tiempo de respuesta": "tiempoRespuesta",
  "tiempo respuesta": "tiempoRespuesta",
};

/** Maps etiqueta de fila (lowercase) → field key de FinanceMetricsColumnMapping */
const FINANCE_ROW_LABEL_MAP: Record<string, string> = {
  "facturación": "facturacion",
  "facturacion": "facturacion",
  "facturado": "facturacion",
  "ingresos": "facturacion",
  "revenue": "facturacion",
  "cash collected": "cashCollected",
  "cc mes": "cashCollected",
  "cobrado": "cashCollected",
  "cobros del mes": "cashCollected",
  "margen": "margen",
  "margen bruto": "margen",
  "margen neto": "margen",
  "por cobrar": "porCobrar",
  "cuentas por cobrar": "porCobrar",
  "deuda": "porCobrar",
  "gastos": "gastos",
  "gastos totales": "gastos",
  "egresos": "gastos",
  "costos": "gastos",
};

// ─── Parser genérico transpuesto ──────────────────────────────────────────────

function parseTransposedMetrics(
  buffer: Buffer,
  rowLabelMap: Record<string, string>,
  dbNames: Record<string, string>,
  /**
   * Mapeo explícito del usuario: field key → etiqueta de fila exacta del Excel.
   * Si se provee y tiene entradas, reemplaza completamente al diccionario automático.
   */
  explicitRowMapping?: Record<string, string>,
  sheetName?: string
): { rows: MetricsSnapshotRow[]; errors: Array<{ row: number; message: string }> } {
  const wb = XLSX.read(buffer, { type: "buffer", raw: false });
  const targetSheet = sheetName
    ? (wb.SheetNames.find((n) => n === sheetName) ?? wb.SheetNames[0])
    : wb.SheetNames[0];
  const sheet = wb.Sheets[targetSheet ?? ""];
  if (!sheet) return { rows: [], errors: [{ row: 0, message: "Hoja no encontrada." }] };

  // Leer como arrays crudos para poder detectar y saltar filas de título
  const rawArrays = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  // Encontrar fila de encabezados: la primera con ≥2 celdas no vacías
  const headerRowIdx = rawArrays.findIndex(
    (row) => row.filter((v) => String(v ?? "").trim()).length >= 2
  );
  if (headerRowIdx === -1) {
    return { rows: [], errors: [{ row: 0, message: "No se encontró fila de encabezados." }] };
  }

  const headerRow = rawArrays[headerRowIdx].map((v) => String(v ?? "").trim());
  const dataRows = rawArrays.slice(headerRowIdx + 1);

  // Inferir año del encabezado si viene explícito (ej. "Marzo 2025")
  let inferredYear = new Date().getFullYear();
  for (let ci = 1; ci < headerRow.length; ci++) {
    const m = (headerRow[ci] ?? "").match(/20\d{2}/);
    if (m) { inferredYear = parseInt(m[0], 10); break; }
  }

  // Identificar columnas con nombres de período (meses)
  const colDates = new Map<number, string>();
  const colLabels = new Map<number, string>();
  for (let ci = 1; ci < headerRow.length; ci++) {
    const h = headerRow[ci];
    if (!h) continue;
    const date = parseMonthLabel(h, inferredYear);
    if (date) {
      colDates.set(ci, date);
      colLabels.set(ci, h);
    }
  }

  if (colDates.size === 0) {
    return { rows: [], errors: [{ row: 0, message: "No se encontraron columnas de período (meses)." }] };
  }

  // Construir lookup efectivo: etiqueta normalizada → field key
  // Si el usuario proveyó un mapeo explícito, invertirlo y usarlo exclusivamente.
  // Si no, usar el diccionario automático.
  const effectiveLookup: Record<string, string> = {};
  if (explicitRowMapping && Object.keys(explicitRowMapping).length > 0) {
    for (const [fieldKey, rowLabel] of Object.entries(explicitRowMapping)) {
      if (rowLabel) effectiveLookup[rowLabel.toLowerCase()] = fieldKey;
    }
  } else {
    Object.assign(effectiveLookup, rowLabelMap);
  }

  // Acumular métricas por columna
  const colMetrics = new Map<number, Record<string, number>>();
  colDates.forEach((_, ci) => colMetrics.set(ci, {}));

  for (const row of dataRows) {
    const rowLabel = String(row[0] ?? "").trim();
    if (!rowLabel) continue;
    const fieldKey = effectiveLookup[rowLabel.toLowerCase()];
    if (!fieldKey) continue; // etiqueta no mapeada — ignorar
    const dbName = dbNames[fieldKey] ?? fieldKey;
    colDates.forEach((_, ci) => {
      const val = parseNum(String(row[ci] ?? ""));
      if (val !== null) {
        const m = colMetrics.get(ci)!;
        if (!(dbName in m)) m[dbName] = val; // primera aparición gana
      }
    });
  }

  const rows: MetricsSnapshotRow[] = [];
  colDates.forEach((date, ci) => {
    const metrics = colMetrics.get(ci)!;
    if (Object.keys(metrics).length === 0) return; // columna vacía
    rows.push({ periodStart: date, periodLabel: colLabels.get(ci) ?? date, metrics });
  });

  rows.sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  return { rows, errors: [] };
}

/**
 * @param rowMapping  Mapeo manual del usuario: { [fieldKey]: "Etiqueta de fila exacta" }.
 *                    Si se provee, reemplaza el diccionario automático.
 *                    Si se omite, usa el diccionario de sinónimos como fallback.
 */
export function parseSalesMetricsTransposed(
  buffer: Buffer,
  rowMapping?: Record<string, string>,
  sheetName?: string
) {
  return parseTransposedMetrics(buffer, SALES_ROW_LABEL_MAP, SALES_DB_NAMES, rowMapping, sheetName);
}

export function parseFinanceMetricsTransposed(
  buffer: Buffer,
  rowMapping?: Record<string, string>,
  sheetName?: string
) {
  return parseTransposedMetrics(buffer, FINANCE_ROW_LABEL_MAP, FINANCE_DB_NAMES, rowMapping, sheetName);
}
