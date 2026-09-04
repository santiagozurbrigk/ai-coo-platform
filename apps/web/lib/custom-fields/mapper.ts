/**
 * Fila de la base → `FieldDefinition`.
 *
 * Defensivo a propósito: `options` es un jsonb y una fila cargada a mano o por
 * una versión vieja del código puede traer cualquier cosa. Una opción que no se
 * entiende **se descarta**, no se convierte en una opción vacía que después
 * aparece en un desplegable sin nombre.
 */
import {
  type FieldDefinition,
  type FieldDefinitionRow,
  type FieldOption,
} from "@/types/custom-fields";
import {
  isFieldCurrency,
  isFieldEntity,
  isFieldOptionColor,
  isFieldOptionsSource,
  isFieldType,
} from "@/lib/custom-fields/field-types";

export function rowToFieldDefinition(row: FieldDefinitionRow): FieldDefinition | null {
  if (!isFieldEntity(row.entity) || !isFieldType(row.field_type)) return null;

  return {
    id: row.id,
    organizationId: row.organization_id,
    entity: row.entity,
    key: row.key,
    label: row.label,
    description: row.description,
    fieldType: row.field_type,
    options: parseOptions(row.options),
    optionsSource: isFieldOptionsSource(row.options_source) ? row.options_source : "inline",
    unit: row.unit,
    currency: isFieldCurrency(row.currency) ? row.currency : null,
    isRequired: row.is_required,
    sortOrder: row.sort_order,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function parseOptions(raw: unknown): FieldOption[] {
  if (!Array.isArray(raw)) return [];

  const options: FieldOption[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;

    const value = typeof record.value === "string" ? record.value.trim() : "";
    if (!value || seen.has(value)) continue;

    const label = typeof record.label === "string" ? record.label.trim() : "";
    seen.add(value);
    options.push({
      value,
      // Sin etiqueta se muestra la clave: es feo y honesto, y deja ver que la
      // fila está incompleta en vez de tapar el hueco con un espacio.
      label: label || value,
      color: isFieldOptionColor(record.color) ? record.color : "neutral",
      archived: record.archived === true,
    });
  }

  return options;
}
