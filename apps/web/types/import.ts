export type ImportModule = "closing" | "finance" | "content";

export type SheetPreview = {
  name: string;
  headerRow: number;
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  filledPct: number;
  detectedType: "closing_leads" | "monthly_summary" | "finance" | "content" | "unknown";
  detectedTypeLabel: string;
};

export type FileAnalysis = {
  sheets: SheetPreview[];
  recommendedSheets: string[];
  recommendedModule: ImportModule;
  mergeStrategy: "concatenate" | "first_only";
  aiReasoning: string;
};

export type ColumnMapping = {
  /** key = OTC field name, value = source column header (or null = skip) */
  [field: string]: string | null;
};

export type OtcFieldDef = {
  key: string;
  label: string;
  required: boolean;
  description: string;
};

export const CLOSING_FIELDS: OtcFieldDef[] = [
  { key: "lead_name", label: "Nombre del lead", required: true, description: "Nombre completo del prospecto" },
  { key: "scheduled_at", label: "Fecha de la llamada", required: true, description: "Fecha en que se agendó o realizó la llamada" },
  { key: "status", label: "Estado", required: false, description: "cerrado / no cerrado / no show" },
  { key: "amount", label: "Monto cobrado", required: false, description: "Importe en moneda local o USD" },
  { key: "setter_name", label: "Setter", required: false, description: "Quien agendó la llamada" },
  { key: "closed_by_name", label: "Closer", required: false, description: "Quien cerró la venta" },
];

export type ImportRowResult =
  | { ok: true; rowIndex: number }
  | { ok: false; rowIndex: number; reason: string };

export type ImportResult = {
  batchId: string;
  imported: number;
  skipped: number;
  skipReasons: { rowIndex: number; reason: string }[];
};

export type ImportBatch = {
  id: string;
  module: ImportModule;
  fileName: string;
  status: "pending" | "completed" | "undone" | "error";
  rowsImported: number;
  rowsSkipped: number;
  createdAt: string;
};
