/**
 * parse-closing-import.ts
 * Parseo e importación de llamadas de cierre desde CSV/Excel.
 * Mismo patrón que lib/clients/parse-client-import.ts.
 */

import type { ClosingCall, ClosingCallStatus } from "@/types/closing";
import { normalizeKey, normalizeDate, normalizeAmount } from "@/lib/clients/column-mapper";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ClosingImportField =
  | "leadName"
  | "scheduledAt"
  | "status"
  | "fathomUrl"
  | "revenue"
  | "paymentType"
  | "noCloseReason"
  | "closedByName";

export type ClosingColumnMapping = Record<string, ClosingImportField | null>;

export type ImportClosingCallRowError = {
  row: number;
  message: string;
};

export type ParsedClosingImport = {
  rows: Omit<ClosingCall, "id">[];
  errors: ImportClosingCallRowError[];
};

// ─── Labels para la UI ───────────────────────────────────────────────────────

export const CLOSING_FIELD_LABELS: Record<ClosingImportField, string> = {
  leadName: "Nombre del lead",
  scheduledAt: "Fecha de llamada",
  status: "Estado / resultado",
  fathomUrl: "Link de grabación",
  revenue: "Ingreso cobrado",
  paymentType: "Forma de pago",
  noCloseReason: "Motivo no cierre",
  closedByName: "Closer",
};

export const CLOSING_ALL_FIELDS: ClosingImportField[] = [
  "leadName",
  "scheduledAt",
  "status",
  "fathomUrl",
  "revenue",
  "paymentType",
  "noCloseReason",
  "closedByName",
];

export const CLOSING_REQUIRED_FIELDS: ClosingImportField[] = [
  "leadName",
  "scheduledAt",
];

// ─── Aliases ──────────────────────────────────────────────────────────────────

const CLOSING_ALIASES: [string[], ClosingImportField][] = [
  // leadName
  [
    [
      "nombre",
      "lead",
      "alumno",
      "alumna",
      "cliente",
      "contacto",
      "persona",
      "nombre del lead",
      "nombre lead",
      "prospecto",
      "candidato",
      "full name",
      "name",
      "nombre completo",
      "apellido y nombre",
    ],
    "leadName",
  ],
  // scheduledAt
  [
    [
      "fecha",
      "fecha de llamada",
      "fecha llamada",
      "fecha de cierre",
      "fecha cierre",
      "dia",
      "día",
      "fecha y hora",
      "horario",
      "scheduled at",
      "start",
      "fecha agendada",
      "fecha de reunion",
      "fecha reunion",
    ],
    "scheduledAt",
  ],
  // status
  [
    [
      "estado",
      "resultado",
      "status",
      "resultado de llamada",
      "resultado llamada",
      "situacion",
      "situación",
      "etapa",
      "desenlace",
      "como salio",
      "como salió",
    ],
    "status",
  ],
  // fathomUrl
  [
    [
      "link de grabacion",
      "link grabacion",
      "fathom",
      "fathom url",
      "grabacion",
      "grabación",
      "link fathom",
      "video",
      "link video",
      "url grabacion",
      "url de llamada",
      "link llamada",
      "recording",
    ],
    "fathomUrl",
  ],
  // revenue
  [
    [
      "ingreso",
      "monto cobrado",
      "monto",
      "inversion",
      "inversión",
      "precio",
      "importe",
      "valor",
      "cobrado",
      "ticket",
      "total",
      "revenue",
      "amount",
      "ingreso cobrado",
      "monto cerrado",
      "inversion ofrecida",
    ],
    "revenue",
  ],
  // paymentType
  [
    [
      "forma de pago",
      "tipo de pago",
      "modalidad",
      "modalidad de pago",
      "payment type",
      "tipo pago",
      "forma pago",
      "condicion de pago",
      "condicion pago",
    ],
    "paymentType",
  ],
  // noCloseReason
  [
    [
      "motivo",
      "motivo no cierre",
      "razon",
      "razón",
      "porque no cerro",
      "por qué no cerró",
      "objecion",
      "objeción",
      "no close reason",
      "motivo de no cierre",
      "razon de no cierre",
    ],
    "noCloseReason",
  ],
  // closedByName
  [
    [
      "closer",
      "cerrado por",
      "vendedor",
      "vendedora",
      "asesor",
      "asesora",
      "agente",
      "quien cerro",
      "quién cerró",
      "nombre del closer",
      "closed by",
    ],
    "closedByName",
  ],
];

// Mapa plano normalizado → campo
const CLOSING_ALIAS_MAP = new Map<string, ClosingImportField>();
for (const [aliases, field] of CLOSING_ALIASES) {
  for (const alias of aliases) {
    CLOSING_ALIAS_MAP.set(normalizeKey(alias), field);
  }
}

// ─── Mapeo de headers ────────────────────────────────────────────────────────

export type ClosingMappingResult = {
  mapping: ClosingColumnMapping;
  unmapped: string[];
  allRequiredMapped: boolean;
};

export function mapClosingColumnHeaders(headers: string[]): ClosingMappingResult {
  const mapping: ClosingColumnMapping = {};
  const usedFields = new Set<ClosingImportField>();
  const unmapped: string[] = [];

  for (const header of headers) {
    const key = normalizeKey(header);
    const field = CLOSING_ALIAS_MAP.get(key) ?? null;
    if (field && !usedFields.has(field)) {
      mapping[header] = field;
      usedFields.add(field);
    } else {
      mapping[header] = null;
      unmapped.push(header);
    }
  }

  const allRequiredMapped = CLOSING_REQUIRED_FIELDS.every((f) => usedFields.has(f));
  return { mapping, unmapped, allRequiredMapped };
}

// ─── Normalización de valores ────────────────────────────────────────────────

const STATUS_MAP: Record<string, ClosingCallStatus> = {
  cerrado: "closed",
  cerrada: "closed",
  closed: "closed",
  vendido: "closed",
  venta: "closed",
  "sale": "closed",
  "si cerro": "closed",
  "sí cerró": "closed",
  "no cerrado": "not_closed",
  "no cerrada": "not_closed",
  not_closed: "not_closed",
  "no vendido": "not_closed",
  "no venta": "not_closed",
  rechazado: "not_closed",
  rechazada: "not_closed",
  perdido: "not_closed",
  "no show": "no_show",
  "no se presento": "no_show",
  "no se presentó": "no_show",
  noshow: "no_show",
  no_show: "no_show",
  ausente: "no_show",
  "no aparecio": "no_show",
  "no apareció": "no_show",
  agendado: "scheduled",
  agendada: "scheduled",
  scheduled: "scheduled",
  pendiente: "scheduled",
  programado: "scheduled",
  programada: "scheduled",
};

const PAYMENT_TYPE_MAP: Record<string, "upfront" | "installments" | "upfront_fee"> = {
  contado: "upfront",
  unico: "upfront",
  "pago unico": "upfront",
  upfront: "upfront",
  completo: "upfront",
  cuotas: "installments",
  cuota: "installments",
  financiado: "installments",
  installments: "installments",
  mensual: "installments",
  anticipo: "upfront_fee",
  upfront_fee: "upfront_fee",
  "anticipo + cuotas": "upfront_fee",
  "fee + cuotas": "upfront_fee",
};

// Pre-normalizar claves (p. ej. "fee + cuotas" → "fee cuotas")
const _statusLookup = new Map(
  Object.entries(STATUS_MAP).map(([k, v]) => [normalizeKey(k), v] as const)
);
const _paymentTypeLookup = new Map(
  Object.entries(PAYMENT_TYPE_MAP).map(([k, v]) => [normalizeKey(k), v] as const)
);

function normalizeStatus(value: string): ClosingCallStatus {
  if (!value?.trim()) return "scheduled";
  const key = normalizeKey(value);
  return _statusLookup.get(key) ?? "scheduled";
}

function normalizePaymentType(
  value: string
): "upfront" | "installments" | "upfront_fee" | undefined {
  if (!value?.trim()) return undefined;
  const key = normalizeKey(value);
  return _paymentTypeLookup.get(key);
}

// ─── Aplicar mapeo ────────────────────────────────────────────────────────────

function applyClosingColumnMapping(
  records: Record<string, string>[],
  mapping: ClosingColumnMapping
): Record<string, string>[] {
  return records.map((record) => {
    const result: Record<string, string> = {};
    for (const [original, value] of Object.entries(record)) {
      const field = mapping[original];
      if (field) {
        result[field] = value;
      }
    }
    return result;
  });
}

// ─── Parseo de fila ──────────────────────────────────────────────────────────

function parseClosingCallRow(
  row: Record<string, string>,
  rowNumber: number
): { call: Omit<ClosingCall, "id"> | null; errors: ImportClosingCallRowError[] } {
  const errors: ImportClosingCallRowError[] = [];

  const leadName = row.leadName?.trim();
  if (!leadName) {
    errors.push({ row: rowNumber, message: "El nombre del lead es obligatorio" });
  }

  const rawDate = row.scheduledAt?.trim();
  if (!rawDate) {
    errors.push({ row: rowNumber, message: "La fecha de llamada es obligatoria" });
  }
  const scheduledAt = normalizeDate(rawDate ?? "");
  // Validate date format after normalization
  if (scheduledAt && !/^\d{4}-\d{2}-\d{2}/.test(scheduledAt)) {
    errors.push({ row: rowNumber, message: `Fecha inválida: "${rawDate}"` });
  }

  if (errors.length > 0) return { call: null, errors };

  const status = normalizeStatus(row.status ?? "");

  // Build scheduledAt with time if not present (default to noon UTC)
  const scheduledAtFull = scheduledAt.includes("T")
    ? scheduledAt
    : `${scheduledAt}T12:00:00Z`;

  // outcome fields
  const revenueRaw = row.revenue?.trim();
  const revenueParsed = revenueRaw ? Number(normalizeAmount(revenueRaw)) : undefined;
  const revenue = revenueParsed && Number.isFinite(revenueParsed) ? revenueParsed : undefined;
  const paymentType = normalizePaymentType(row.paymentType ?? "");
  const noCloseReason = row.noCloseReason?.trim() || undefined;

  const hasOutcome = revenue !== undefined || paymentType !== undefined || noCloseReason !== undefined;

  return {
    call: {
      leadName: leadName!,
      scheduledAt: scheduledAtFull,
      status,
      formAnswers: [],
      fathomUrl: row.fathomUrl?.trim() || undefined,
      closedByName: row.closedByName?.trim() || undefined,
      outcome: hasOutcome
        ? { revenue, paymentType, noCloseReason }
        : undefined,
    },
    errors: [],
  };
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function parseClosingImportRowsMapped(
  records: Record<string, string>[],
  mapping: ClosingColumnMapping
): ParsedClosingImport {
  if (records.length === 0) {
    return {
      rows: [],
      errors: [{ row: 1, message: "El archivo no contiene filas con datos" }],
    };
  }

  const remapped = applyClosingColumnMapping(records, mapping);
  const errors: ImportClosingCallRowError[] = [];
  const rows: Omit<ClosingCall, "id">[] = [];

  remapped.forEach((record, index) => {
    const parsed = parseClosingCallRow(record, index + 2);
    errors.push(...parsed.errors);
    if (parsed.call) rows.push(parsed.call);
  });

  return { rows, errors };
}
