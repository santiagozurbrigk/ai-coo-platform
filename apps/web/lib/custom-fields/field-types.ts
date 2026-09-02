/**
 * Vocabulario de los tipos de campo configurables.
 *
 * Un solo lugar decide qué se puede elegir en la pantalla de configuración y
 * cómo se lee cada tipo. Si un tipo nuevo entra acá, la UI lo ofrece sola.
 */
import {
  FIELD_CURRENCIES,
  FIELD_ENTITIES,
  FIELD_OPTION_COLORS,
  FIELD_OPTIONS_SOURCES,
  FIELD_TYPES,
  type FieldCurrency,
  type FieldEntity,
  type FieldOptionColor,
  type FieldOptionsSource,
  type FieldType,
} from "@/types/custom-fields";

export const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  select: "Lista de opciones",
  multi_select: "Lista múltiple",
  text: "Texto libre",
  number: "Número",
  currency: "Dinero",
  date: "Fecha",
};

export const FIELD_TYPE_HINT: Record<FieldType, string> = {
  select: "Se elige una opción de las que cargues.",
  multi_select: "Se eligen varias opciones de las que cargues.",
  text: "Se escribe libremente.",
  number: "Un número, con unidad opcional (%, clientes).",
  currency: "Un monto, con su moneda.",
  date: "Una fecha del calendario.",
};

export const FIELD_ENTITY_LABEL: Record<FieldEntity, string> = {
  win: "Wins",
  checkpoint: "Checkpoints",
};

export const FIELD_ENTITY_HINT: Record<FieldEntity, string> = {
  win: "Columnas del tracker de wins.",
  checkpoint: "Métricas que se piden al registrar un checkpoint.",
};

export function isFieldType(value: unknown): value is FieldType {
  return typeof value === "string" && (FIELD_TYPES as readonly string[]).includes(value);
}

export function isFieldEntity(value: unknown): value is FieldEntity {
  return typeof value === "string" && (FIELD_ENTITIES as readonly string[]).includes(value);
}

export function isFieldOptionsSource(value: unknown): value is FieldOptionsSource {
  return (
    typeof value === "string" &&
    (FIELD_OPTIONS_SOURCES as readonly string[]).includes(value)
  );
}

export function isFieldCurrency(value: unknown): value is FieldCurrency {
  return typeof value === "string" && (FIELD_CURRENCIES as readonly string[]).includes(value);
}

export function isFieldOptionColor(value: unknown): value is FieldOptionColor {
  return (
    typeof value === "string" && (FIELD_OPTION_COLORS as readonly string[]).includes(value)
  );
}

/** Los tipos que necesitan una lista de opciones cargada para servir de algo. */
export function fieldTypeUsesOptions(type: FieldType): boolean {
  return type === "select" || type === "multi_select";
}

/** Los tipos que aceptan varios valores a la vez. */
export function fieldTypeIsMultiple(type: FieldType): boolean {
  return type === "multi_select";
}

/**
 * Color del token de un valor de opción.
 *
 * Devuelve la variable CSS, no un hex: los colores siguen el tema claro/oscuro
 * y salen de la paleta categórica del design system.
 */
export function fieldOptionColorVar(color: FieldOptionColor): string {
  return color === "neutral"
    ? "hsl(var(--muted-foreground))"
    : `var(--chart-${color})`;
}
