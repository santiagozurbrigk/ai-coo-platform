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
  { key: "lead_name",      label: "Nombre del lead",     required: true,  description: "Nombre completo del prospecto" },
  { key: "scheduled_at",   label: "Fecha de la llamada", required: true,  description: "Fecha en que se agendó o realizó la llamada" },
  { key: "status",         label: "Estado",              required: false, description: "cerrado / no cerrado / no show" },
  { key: "amount",         label: "Monto cobrado (USD)", required: false, description: "Importe en USD (Monto Facturación o Efectivo Recaudado)" },
  { key: "amount_local",   label: "Monto en moneda local", required: false, description: "Importe en pesos u otra moneda local" },
  { key: "setter_name",    label: "Setter",              required: false, description: "Quien agendó la llamada" },
  { key: "closed_by_name", label: "Closer",              required: false, description: "Quien cerró la venta" },
  { key: "origin",         label: "Origen / Fuente",     required: false, description: "De dónde vino el lead (Instagram, Masterclass, etc.)" },
  { key: "program",        label: "Programa ofrecido",   required: false, description: "Nombre del producto o programa vendido" },
  { key: "no_close_reason",label: "Motivo de no cierre", required: false, description: "Por qué no cerró la venta" },
  { key: "notes",          label: "Notas",               required: false, description: "Notas personales del closer o setter" },
];

export const FINANCE_FIELDS: OtcFieldDef[] = [
  { key: "date",        label: "Fecha",           required: true,  description: "Fecha del pago o gasto" },
  { key: "description", label: "Concepto",        required: true,  description: "Descripción del ingreso o gasto" },
  { key: "amount_usd",  label: "Monto USD",       required: false, description: "Importe en dólares" },
  { key: "amount_local",label: "Monto local",     required: false, description: "Importe en moneda local (pesos, etc.)" },
  { key: "category",    label: "Categoría / Tipo",required: false, description: "Tipo de gasto o producto vendido" },
  { key: "client_name", label: "Cliente",         required: false, description: "Nombre del cliente o proveedor" },
  { key: "closer_name", label: "Closer / Responsable", required: false, description: "Quién realizó la venta o gasto" },
  { key: "notes",       label: "Notas",           required: false, description: "Notas adicionales" },
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
