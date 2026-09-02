/**
 * Cómo se lee un valor cargado.
 *
 * Separado del componente a propósito: es lo que decide qué texto se ve, y por
 * eso tiene tests. El componente sólo pone el color y el borde.
 *
 * Lógica pura: no toca base ni red.
 */
import type { FieldDefinition, FieldOption } from "@/types/custom-fields";
import {
  findOption,
  hasValue,
  resolveFieldOptions,
  type ResolveOptionsContext,
} from "@/lib/custom-fields/resolve";

/** Cómo se pinta una parte de un valor. */
export type FormattedFieldPart = {
  text: string;
  option: FieldOption | null;
  /** El valor está guardado pero no existe en el catálogo: se muestra crudo y se avisa. */
  unknownOption: boolean;
};

export type FormattedFieldValue = {
  /** Vacío cuando no hay nada cargado. La UI muestra un guion, no un cero. */
  parts: FormattedFieldPart[];
  isEmpty: boolean;
};

export function formatFieldValue(
  field: FieldDefinition,
  value: unknown,
  context: ResolveOptionsContext = {}
): FormattedFieldValue {
  if (!hasValue(value)) return { parts: [], isEmpty: true };

  switch (field.fieldType) {
    case "select":
      return { parts: [optionPart(field, value, context)], isEmpty: false };

    case "multi_select": {
      const list = Array.isArray(value) ? value : [value];
      const parts = list.map((entry) => optionPart(field, entry, context));
      return { parts, isEmpty: parts.length === 0 };
    }

    case "number":
      return plain(formatNumber(field, value));

    case "currency":
      return plain(formatCurrency(field, value));

    case "date":
      return plain(formatDate(value));

    case "text":
      return plain(String(value));
  }
}

/** Una línea de texto — lo que va en una celda de tabla. */
export function fieldValueToText(
  field: FieldDefinition,
  value: unknown,
  context: ResolveOptionsContext = {}
): string {
  const formatted = formatFieldValue(field, value, context);
  return formatted.isEmpty ? "" : formatted.parts.map((part) => part.text).join(", ");
}

function plain(text: string): FormattedFieldValue {
  return { parts: [{ text, option: null, unknownOption: false }], isEmpty: false };
}

function optionPart(
  field: FieldDefinition,
  value: unknown,
  context: ResolveOptionsContext
): FormattedFieldPart {
  const { all } = resolveFieldOptions(field, context);
  const option = findOption(all, value);
  return {
    text: option?.label ?? String(value),
    option,
    unknownOption: option === null,
  };
}

function formatNumber(field: FieldDefinition, value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  const formatted = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 2,
  }).format(numeric);
  return field.unit ? `${formatted} ${field.unit}` : formatted;
}

function formatCurrency(field: FieldDefinition, value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: field.currency ?? "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function formatDate(value: unknown): string {
  const iso = String(value);
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
