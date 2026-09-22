/**
 * Validar un valor contra su campo.
 *
 * ⭐ La regla dura, la misma que sostiene el resto del repo: **un valor que no
 * se entiende no se guarda como cero ni como vacío**. Se rechaza diciendo por
 * qué. Un campo obligatorio sin cargar tampoco pasa.
 *
 * Lógica pura: no toca base ni red.
 */
import type {
  CustomFieldValues,
  FieldDefinition,
  FieldOption,
} from "@/types/custom-fields";
import {
  hasValue,
  resolveFieldOptions,
  type ResolveOptionsContext,
} from "@/lib/custom-fields/resolve";

export type FieldValueResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

export type FieldValuesResult =
  | { ok: true; values: CustomFieldValues }
  | { ok: false; errors: Record<string, string> };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * El techo de un campo de texto, en caracteres.
 *
 * ⭐ Eran 2.000 y el founder chocó contra ellos cargando «Método único» en la
 * ficha de un cliente. Los 22 campos de Marketing, Ventas y Sistemas son todos
 * de tipo texto y guardan narrativa —un avatar entero, un script de llamadas,
 * la narrativa de un webinar—, no un renglón: 2.000 caracteres son unas 330
 * palabras, media carilla. El número no venía de ningún límite real de la base:
 * el valor vive en un `jsonb` que Postgres guarda comprimido y fuera de página
 * sin despeinarse.
 *
 * Sigue habiendo techo, y sigue siendo alto a propósito. La lista de clientes
 * viaja entera al navegador (`select("*")` en `listClientsAction`), así que un
 * campo sin límite es una pantalla de clientes que tarda por culpa de un texto
 * que nadie está leyendo ahí. 20.000 caracteres son unas 3.300 palabras por
 * campo: de sobra para lo que estos campos guardan, y acotado.
 *
 * Lo que no cambia es la regla: si no entra **se rechaza diciendo cuánto se
 * pasó**, nunca se recorta en silencio. Un texto truncado sin aviso es un dato
 * perdido que parece guardado.
 */
export const MAX_TEXT_LENGTH = 20_000;

/**
 * Normaliza y valida un valor suelto.
 *
 * Devuelve el valor **normalizado** (texto recortado, número convertido,
 * opciones deduplicadas), que es lo que se guarda: validar y normalizar en el
 * mismo lugar evita que se guarde algo distinto de lo que se validó.
 */
export function validateFieldValue(
  field: FieldDefinition,
  raw: unknown,
  context: ResolveOptionsContext = {}
): FieldValueResult {
  if (!hasValue(raw)) {
    if (field.isRequired) {
      return { ok: false, error: `"${field.label}" es obligatorio.` };
    }
    return { ok: true, value: null };
  }

  switch (field.fieldType) {
    case "text":
      return validateText(field, raw);
    case "number":
    case "currency":
      return validateNumber(field, raw);
    case "date":
      return validateDate(field, raw);
    case "select":
      return validateSelect(field, raw, context);
    case "multi_select":
      return validateMultiSelect(field, raw, context);
  }
}

function validateText(field: FieldDefinition, raw: unknown): FieldValueResult {
  if (typeof raw !== "string") {
    return { ok: false, error: `"${field.label}" tiene que ser texto.` };
  }
  const value = raw.trim();
  if (value.length > MAX_TEXT_LENGTH) {
    // Decir sólo "no puede pasar de 20.000" deja a la persona contando a ojo
    // cuánto sobra. El número propio del texto le dice qué recortar.
    return {
      ok: false,
      error: `"${field.label}" tiene ${formatCount(value.length)} caracteres y el máximo es ${formatCount(MAX_TEXT_LENGTH)}. Recortá ${formatCount(value.length - MAX_TEXT_LENGTH)} o dejá un link al documento.`,
    };
  }
  return { ok: true, value };
}

/** 20000 → "20.000". Los números largos se leen de un vistazo con separador. */
function formatCount(n: number): string {
  return n.toLocaleString("es-AR");
}

function validateNumber(field: FieldDefinition, raw: unknown): FieldValueResult {
  const value =
    typeof raw === "number" ? raw : typeof raw === "string" ? parseDecimal(raw) : NaN;

  if (!Number.isFinite(value)) {
    return { ok: false, error: `"${field.label}" tiene que ser un número.` };
  }
  return { ok: true, value };
}

/**
 * Acepta lo que una persona escribe de verdad: "1.234,56" y "1234.56".
 *
 * No adivina cuando quedan varios separadores ambiguos — devuelve NaN y el
 * campo se rechaza. Un monto mal leído es peor que un monto no cargado.
 */
function parseDecimal(input: string): number {
  const cleaned = input.trim().replace(/\s/g, "");
  if (cleaned === "") return NaN;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;
  if (hasComma && hasDot) {
    // El separador decimal es el último que aparece; el otro es de miles.
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".");
  }

  return /^-?\d*\.?\d+$/.test(normalized) ? Number(normalized) : NaN;
}

function validateDate(field: FieldDefinition, raw: unknown): FieldValueResult {
  if (typeof raw !== "string" || !ISO_DATE.test(raw.trim())) {
    return { ok: false, error: `"${field.label}" tiene que ser una fecha.` };
  }
  const value = raw.trim();
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: `"${field.label}" no es una fecha que exista.` };
  }
  // El 2026-02-31 pasa el regex y `Date` lo corre a marzo sin avisar.
  if (parsed.toISOString().slice(0, 10) !== value) {
    return { ok: false, error: `"${field.label}" no es una fecha que exista.` };
  }
  return { ok: true, value };
}

function validateSelect(
  field: FieldDefinition,
  raw: unknown,
  context: ResolveOptionsContext
): FieldValueResult {
  if (typeof raw !== "string") {
    return { ok: false, error: `Elegí una opción de "${field.label}".` };
  }
  const { available } = resolveFieldOptions(field, context);
  return checkOption(field, raw.trim(), available);
}

function validateMultiSelect(
  field: FieldDefinition,
  raw: unknown,
  context: ResolveOptionsContext
): FieldValueResult {
  const list = Array.isArray(raw) ? raw : [raw];
  const { available } = resolveFieldOptions(field, context);
  const seen = new Set<string>();

  for (const entry of list) {
    if (typeof entry !== "string") {
      return { ok: false, error: `Elegí opciones de "${field.label}".` };
    }
    const checked = checkOption(field, entry.trim(), available);
    if (!checked.ok) return checked;
    seen.add(entry.trim());
  }

  return { ok: true, value: [...seen] };
}

/**
 * Una opción archivada no entra en un dato nuevo: si se aceptara, archivar no
 * significaría nada. Se sigue mostrando donde ya estaba cargada — eso lo
 * resuelve la lectura, no la escritura.
 */
function checkOption(
  field: FieldDefinition,
  value: string,
  available: readonly FieldOption[]
): FieldValueResult {
  if (!available.some((option) => option.value === value)) {
    return {
      ok: false,
      error: `"${value}" no es una opción disponible de "${field.label}".`,
    };
  }
  return { ok: true, value };
}

/**
 * Valida el jsonb entero de una fila contra su esquema.
 *
 * Devuelve **todos** los errores juntos, no el primero: completar un formulario
 * de a un error por vez es la forma más rápida de que alguien lo abandone.
 */
export function validateFieldValues(
  fields: readonly FieldDefinition[],
  raw: CustomFieldValues,
  context: ResolveOptionsContext = {}
): FieldValuesResult {
  const values: CustomFieldValues = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const result = validateFieldValue(field, raw[field.key], context);
    if (!result.ok) {
      errors[field.key] = result.error;
      continue;
    }
    // Un campo sin cargar no ocupa lugar en el jsonb: la fila guarda lo que se
    // completó, no una columna por cada campo que existe.
    if (result.value !== null) values[field.key] = result.value;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values };
}
