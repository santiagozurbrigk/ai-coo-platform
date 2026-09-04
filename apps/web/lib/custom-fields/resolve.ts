/**
 * Resolver el esquema de campos de una entidad: qué columnas se ofrecen hoy,
 * qué opciones tiene cada una y cuáles siguen mostrándose aunque ya no se
 * ofrezcan.
 *
 * Las tres reglas que sostienen todo esto:
 *   1. Se guarda el `value`, nunca el `label`.
 *   2. Una opción no se borra: se archiva, y los datos viejos la siguen mostrando.
 *   3. Un campo archivado deja de ofrecerse pero sigue mostrándose donde ya se cargó.
 *
 * Lógica pura: no toca base ni red.
 */
import type {
  FieldDefinition,
  FieldOption,
  FieldOptionColor,
} from "@/types/custom-fields";
import { fieldTypeUsesOptions } from "@/lib/custom-fields/field-types";

/**
 * Fases del recorrido del cliente, para los campos con
 * `options_source = 'journey_stages'`.
 *
 * El catálogo lo entrega C1. Hasta entonces esta lista llega siempre vacía y
 * `resolveFieldOptions` lo dice explícitamente en vez de fingir que el campo
 * no tiene opciones por decisión de alguien.
 */
export type JourneyStageOption = {
  id: string;
  name: string;
  color?: FieldOptionColor;
  archived?: boolean;
};

export type ResolveOptionsContext = {
  journeyStages?: JourneyStageOption[];
};

/** Los campos que se ofrecen para cargar un dato nuevo, en orden. */
export function activeFields(fields: readonly FieldDefinition[]): FieldDefinition[] {
  return fields
    .filter((field) => field.archivedAt === null)
    .slice()
    .sort(bySortOrder);
}

/**
 * Los campos a mostrar sobre un dato ya cargado: los activos, más los
 * archivados que ese dato usa. Un win no pierde una columna porque alguien la
 * archivó después.
 */
export function fieldsForValues(
  fields: readonly FieldDefinition[],
  values: Record<string, unknown> | null | undefined
): FieldDefinition[] {
  const loaded = values ?? {};
  return fields
    .filter((field) => field.archivedAt === null || hasValue(loaded[field.key]))
    .slice()
    .sort(bySortOrder);
}

function bySortOrder(a: FieldDefinition, b: FieldDefinition): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.label.localeCompare(b.label, "es");
}

/**
 * Las opciones de un campo de lista.
 *
 * `available` son las que se ofrecen al cargar; `all` incluye las archivadas,
 * que es lo que hay que usar para *mostrar* un dato viejo.
 */
export function resolveFieldOptions(
  field: FieldDefinition,
  context: ResolveOptionsContext = {}
): { all: FieldOption[]; available: FieldOption[] } {
  if (!fieldTypeUsesOptions(field.fieldType)) {
    return { all: [], available: [] };
  }

  const all =
    field.optionsSource === "journey_stages"
      ? (context.journeyStages ?? []).map(stageToOption)
      : field.options;

  return { all, available: all.filter((option) => !option.archived) };
}

function stageToOption(stage: JourneyStageOption): FieldOption {
  return {
    value: stage.id,
    label: stage.name,
    color: stage.color ?? "neutral",
    archived: stage.archived ?? false,
  };
}

/**
 * La opción que corresponde a un valor guardado.
 *
 * Devuelve `null` cuando el valor no está en el catálogo — por ejemplo, una
 * opción que alguien borró de verdad. La celda muestra el valor crudo y avisa;
 * **no lo reemplaza por vacío**, que sería tapar el problema.
 */
export function findOption(
  options: readonly FieldOption[],
  value: unknown
): FieldOption | null {
  if (typeof value !== "string") return null;
  return options.find((option) => option.value === value) ?? null;
}

/** ¿Este valor cargado dice algo? Un string vacío o una lista vacía no. */
export function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return true;
}

/**
 * Saca del jsonb las claves que ya no corresponden a ningún campo.
 *
 * Se usa al guardar, no al leer: lo cargado se conserva tal cual, pero un dato
 * nuevo no arrastra columnas fantasma.
 */
export function pickKnownValues(
  fields: readonly FieldDefinition[],
  values: Record<string, unknown>
): Record<string, unknown> {
  const known = new Set(fields.map((field) => field.key));
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (known.has(key)) result[key] = value;
  }
  return result;
}
