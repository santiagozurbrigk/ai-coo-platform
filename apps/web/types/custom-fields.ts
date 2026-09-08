/**
 * C0 · Campos configurables — tipos compartidos entre Wins (Encargo A) y
 * Checkpoints (Encargo C).
 *
 * Una `FieldDefinition` es la definición de una columna. El valor cargado vive
 * en el jsonb de la fila dueña (`client_wins.custom`,
 * `client_checkpoint_events.metrics`), nunca acá.
 */

/** A qué tabla pertenece una columna configurable. */
export const FIELD_ENTITIES = ["win", "checkpoint"] as const;
export type FieldEntity = (typeof FIELD_ENTITIES)[number];

export const FIELD_TYPES = [
  "select",
  "multi_select",
  "text",
  "number",
  "currency",
  "date",
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

/** De dónde salen las opciones de un campo de lista. */
export const FIELD_OPTIONS_SOURCES = ["inline", "journey_stages"] as const;
export type FieldOptionsSource = (typeof FIELD_OPTIONS_SOURCES)[number];

/** Monedas soportadas por un campo de dinero — las mismas que usa el resto del producto. */
export const FIELD_CURRENCIES = ["USD", "ARS"] as const;
export type FieldCurrency = (typeof FIELD_CURRENCIES)[number];

/**
 * Color de una opción. Se guarda el **nombre del token**, no el hex: los
 * colores del producto salen de `--chart-cat-*` y siguen el tema claro/oscuro.
 */
export const FIELD_OPTION_COLORS = [
  "neutral",
  "cat-1",
  "cat-2",
  "cat-3",
  "cat-4",
  "cat-5",
  "cat-6",
] as const;
export type FieldOptionColor = (typeof FIELD_OPTION_COLORS)[number];

export type FieldOption = {
  /** Lo que se guarda en el dato. Estable: no cambia aunque se renombre la etiqueta. */
  value: string;
  /** Lo que se ve. */
  label: string;
  color: FieldOptionColor;
  /** Archivada: no se ofrece más, pero se sigue mostrando donde ya se cargó. */
  archived: boolean;
};

export type FieldDefinition = {
  id: string;
  organizationId: string;
  entity: FieldEntity;
  key: string;
  label: string;
  description: string | null;
  fieldType: FieldType;
  options: FieldOption[];
  optionsSource: FieldOptionsSource;
  unit: string | null;
  currency: FieldCurrency | null;
  isRequired: boolean;
  sortOrder: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** El jsonb con los valores cargados de una fila (win o evento de checkpoint). */
export type CustomFieldValues = Record<string, unknown>;

export type FieldDefinitionRow = {
  id: string;
  organization_id: string;
  entity: string;
  key: string;
  label: string;
  description: string | null;
  field_type: string;
  options: unknown;
  options_source: string;
  unit: string | null;
  currency: string | null;
  is_required: boolean;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};
