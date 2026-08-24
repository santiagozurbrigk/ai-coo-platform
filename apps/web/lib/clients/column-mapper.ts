/**
 * column-mapper.ts
 * Mapeo de columnas de Excel/CSV en español → campos canónicos del sistema.
 * Ejecutable en cliente y servidor (sin side-effects de APIs).
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ClientImportField =
  | "name"
  | "joinDate"
  | "paymentType"
  | "platform"
  | "totalAmount"
  | "status"
  | "nickname"
  | "salesFathomUrl";

export const ALL_FIELDS: ClientImportField[] = [
  "name",
  "joinDate",
  "paymentType",
  "platform",
  "totalAmount",
  "status",
  "nickname",
  "salesFathomUrl",
];

export const REQUIRED_FIELDS: ClientImportField[] = [
  "name",
  "joinDate",
  "paymentType",
  "platform",
  "totalAmount",
];

export const FIELD_LABELS: Record<ClientImportField, string> = {
  name: "Nombre",
  joinDate: "Fecha de ingreso",
  paymentType: "Forma de pago",
  platform: "Plataforma de cobro",
  totalAmount: "Inversión",
  status: "Estado",
  nickname: "Apodo",
  salesFathomUrl: "Link de llamada",
};

export type ColumnMapping = Record<string, ClientImportField | null>;

export type MappingResult = {
  /** Mapea cada header original → campo canónico (null si no se reconoció) */
  mapping: ColumnMapping;
  /** Headers que no pudieron mapearse a ningún campo */
  unmapped: string[];
  /** Si todos los campos requeridos tienen un header asignado */
  allRequiredMapped: boolean;
};

// ─── Normalización de clave ──────────────────────────────────────────────────

/** Normaliza un string para búsqueda de alias: minúsculas, sin tildes, sin puntuación */
export function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quitar diacríticos
    .replace(/[^a-z0-9\s]/g, " ") // no alfanumérico → espacio
    .replace(/\s+/g, " ") // colapsar espacios
    .trim();
}

// ─── Diccionario de aliases ──────────────────────────────────────────────────

const ALIASES: [string[], ClientImportField][] = [
  // name — Nombre del cliente/alumno
  [
    [
      "nombre",
      "alumno",
      "alumna",
      "cliente",
      "estudiante",
      "student",
      "name",
      "apellido y nombre",
      "apellido nombre",
      "nombre completo",
      "full name",
      "contacto",
      "persona",
      "lead",
    ],
    "name",
  ],
  // joinDate — Fecha de ingreso/compra
  [
    [
      "fecha",
      "fecha de ingreso",
      "fecha ingreso",
      "inicio",
      "start date",
      "join date",
      "joindate",
      "fecha de compra",
      "fecha compra",
      "compra",
      "fecha de alta",
      "fecha alta",
      "alta",
      "fecha pago",
      "fecha inicio",
      "fecha de inicio",
      "ingreso",
      "inscripcion",
      "fecha inscripcion",
      "fecha de inscripcion",
      "fecha de pago",
      "fecha de cobro",
      "cobro",
    ],
    "joinDate",
  ],
  // totalAmount — Inversión/monto cobrado
  [
    [
      "inversion",
      "inversión",
      "monto",
      "precio",
      "importe",
      "valor",
      "total",
      "cobrado",
      "ticket",
      "pago",
      "cuota total",
      "amount",
      "price",
      "total amount",
      "totalamount",
      "inversion total",
      "monto total",
      "precio total",
      "tarifa",
      "costo",
      "monto cobrado",
      "total cobrado",
    ],
    "totalAmount",
  ],
  // paymentType — Modalidad de pago
  [
    [
      "forma de pago",
      "tipo de pago",
      "modalidad",
      "modalidad de pago",
      "payment type",
      "paymenttype",
      "tipo",
      "forma pago",
      "tipo pago",
      "modalidad pago",
      "metodo de pago",
      "metodo pago",
      "condicion de pago",
      "condicion pago",
    ],
    "paymentType",
  ],
  // platform — Plataforma/medio de cobro
  [
    [
      "plataforma",
      "medio de pago",
      "herramienta",
      "platform",
      "pago via",
      "via",
      "canal",
      "medio pago",
      "plataforma de pago",
      "via de pago",
      "medio",
      "cobrado por",
      "cobrado via",
    ],
    "platform",
  ],
  // status — Estado del alumno
  [
    [
      "estado",
      "situacion",
      "situación",
      "status",
      "etapa",
      "situacion actual",
      "estado actual",
    ],
    "status",
  ],
  // nickname — Apodo o nombre corto
  [["apodo", "nickname", "alias", "nombre corto"], "nickname"],
  // salesFathomUrl — Link de llamada de cierre
  [
    [
      "llamada",
      "link llamada",
      "fathom",
      "url llamada",
      "video",
      "link video",
      "grabacion",
      "sales fathom url",
      "salesfathomurl",
      "fathom url",
      "llamada de ventas",
      "link de llamada",
      "url de llamada",
    ],
    "salesFathomUrl",
  ],
];

// Construir mapa plano normalizado → campo
const ALIAS_MAP = new Map<string, ClientImportField>();
for (const [aliases, field] of ALIASES) {
  for (const alias of aliases) {
    ALIAS_MAP.set(normalizeKey(alias), field);
  }
}

// ─── Mapeo de headers ────────────────────────────────────────────────────────

/**
 * Mapea los headers de un archivo → campos canónicos usando el diccionario de aliases.
 * Un campo solo puede tener un header asignado (el primero que matchee).
 */
export function mapColumnHeaders(headers: string[]): MappingResult {
  const mapping: ColumnMapping = {};
  const usedFields = new Set<ClientImportField>();
  const unmapped: string[] = [];

  for (const header of headers) {
    const key = normalizeKey(header);
    const field = ALIAS_MAP.get(key) ?? null;
    if (field && !usedFields.has(field)) {
      mapping[header] = field;
      usedFields.add(field);
    } else {
      mapping[header] = null;
      unmapped.push(header);
    }
  }

  const allRequiredMapped = REQUIRED_FIELDS.every((f) => usedFields.has(f));
  return { mapping, unmapped, allRequiredMapped };
}

/**
 * Aplica el mapeo para renombrar columnas en los records.
 * Columnas sin mapeo (null) son descartadas.
 */
export function applyColumnMapping(
  records: Record<string, string>[],
  mapping: ColumnMapping
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

// ─── Normalizadores de valores ────────────────────────────────────────────────

const PLATFORM_MAP: Record<string, string> = {
  mp: "mercadopago",
  "mercado pago": "mercadopago",
  meli: "mercadopago",
  mercadopago: "mercadopago",
  mercado: "mercadopago",
  paypal: "paypal",
  stripe: "stripe",
  transferencia: "bank_transfer",
  "bank transfer": "bank_transfer",
  bank_transfer: "bank_transfer",
  banco: "bank_transfer",
  "transferencia bancaria": "bank_transfer",
  efectivo: "bank_transfer",
  otro: "other",
  otros: "other",
  other: "other",
  ninguno: "other",
  "no especificado": "other",
};

const PAYMENT_TYPE_MAP: Record<string, string> = {
  contado: "upfront",
  unico: "upfront",
  "pago unico": "upfront",
  "pago contado": "upfront",
  upfront: "upfront",
  completo: "upfront",
  "pago completo": "upfront",
  "pago total": "upfront",
  cuotas: "installments",
  cuota: "installments",
  financiado: "installments",
  financiamiento: "installments",
  installments: "installments",
  mensual: "installments",
  "en cuotas": "installments",
  "fee + cuotas": "upfront_fee",
  "upfront + cuotas": "upfront_fee",
  anticipo: "upfront_fee",
  "pago inicial": "upfront_fee",
  upfront_fee: "upfront_fee",
  "anticipo + cuotas": "upfront_fee",
};

const STATUS_MAP: Record<string, string> = {
  activo: "active",
  active: "active",
  vigente: "active",
  cursando: "active",
  "en curso": "active",
  "en programa": "active",
  pendiente: "pending_onboarding",
  "sin onboarding": "pending_onboarding",
  pending_onboarding: "pending_onboarding",
  inicio: "pending_onboarding",
  "nuevo ingreso": "pending_onboarding",
  nuevo: "pending_onboarding",
  completado: "onboarding_done",
  finalizado: "onboarding_done",
  egresado: "onboarding_done",
  onboarding_done: "onboarding_done",
  terminado: "onboarding_done",
  graduado: "onboarding_done",
  "caso de exito": "success_case",
  testimonio: "success_case",
  exito: "success_case",
  success_case: "success_case",
  referente: "success_case",
};

// Pre-normalizar claves de los mapas para que normalizeKey(value) matchee correctamente
// (p. ej. "fee + cuotas" → normalizeKey → "fee cuotas", que no matchearía la clave literal)
const _platformLookup = new Map(
  Object.entries(PLATFORM_MAP).map(([k, v]) => [normalizeKey(k), v])
);
const _paymentTypeLookup = new Map(
  Object.entries(PAYMENT_TYPE_MAP).map(([k, v]) => [normalizeKey(k), v])
);
const _statusLookup = new Map(
  Object.entries(STATUS_MAP).map(([k, v]) => [normalizeKey(k), v])
);

export function normalizePlatform(value: string): string {
  const key = normalizeKey(value);
  return _platformLookup.get(key) ?? value.toLowerCase().trim();
}

export function normalizePaymentType(value: string): string {
  const key = normalizeKey(value);
  return _paymentTypeLookup.get(key) ?? value.toLowerCase().trim();
}

export function normalizeStatus(value: string): string {
  const key = normalizeKey(value);
  return _statusLookup.get(key) ?? value.toLowerCase().trim();
}

/**
 * Normaliza montos monetarios a string numérico.
 * Soporta: "$1.500,00", "1,500.00", "1.500", "1500", "$1500.50"
 */
export function normalizeAmount(value: string): string {
  const s = value.trim().replace(/^[$\s€]+/, "").replace(/\s/g, "");
  // Formato europeo/latinoamericano: "1.500,00" (punto como miles, coma como decimal)
  if (/^\d{1,3}(\.\d{3})*,\d+$/.test(s)) {
    return s.replace(/\./g, "").replace(",", ".");
  }
  // Formato anglosajón: "1,500.00" (coma como miles, punto como decimal)
  if (/^\d{1,3}(,\d{3})*\.\d+$/.test(s)) {
    return s.replace(/,/g, "");
  }
  // Número con punto como miles sin decimales: "1.500"
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    return s.replace(/\./g, "");
  }
  // Remover comas restantes (separadores de miles)
  return s.replace(/,/g, "");
}

/**
 * Normaliza fechas a formato YYYY-MM-DD.
 * Soporta: "01/07/2026", "1-7-2026", "2026-07-01", "01.07.2026"
 * También acepta datetime: "01/07/2026 10:00", "01/07/2026 10:00:00" (ignora la hora).
 * Para fechas ambiguas DD/MM vs MM/DD asume formato latinoamericano (DD/MM).
 */
export function normalizeDate(value: string): string {
  const s = value.trim();
  if (!s) return s;
  // Ya está en formato ISO (con o sin hora) — tomar solo la fecha
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  // DD/MM/YYYY [HH:MM...] — regex sin $ para aceptar datetime con hora al final
  const dmy = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }
  return s;
}
