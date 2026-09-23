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
  type FieldOnboardingConfig,
  type FieldOption,
} from "@/types/custom-fields";
import {
  isFieldCurrency,
  isFieldEntity,
  isFieldOptionColor,
  isFieldOptionsSource,
  isFieldSection,
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
    // Un umbral fuera de rango se ignora en vez de romper la pantalla: la
    // base ya lo restringe, pero una fila vieja o tocada a mano no debería
    // dejar sin campos a toda la organización.
    alertDaysBefore:
      typeof row.alert_days_before === "number" &&
      row.alert_days_before > 0 &&
      row.alert_days_before <= 365
        ? row.alert_days_before
        : null,
    isRequired: row.is_required,
    section: isFieldSection(row.section) ? row.section : null,
    onboarding: parseOnboardingConfig(row.onboarding),
    // Una fila vieja, de antes de la columna, se lee como visible: era lo que
    // hacía la pantalla hasta ese momento.
    showInTable: row.show_in_table ?? true,
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

/**
 * El jsonb `onboarding` → config del formulario, o `null` si no se pregunta.
 *
 * Mismo criterio que `parseOptions`: lo que no se entiende se descarta. Sin
 * paso no hay dónde preguntarlo, así que un objeto sin `step` es `null`.
 */
export function parseOnboardingConfig(raw: unknown): FieldOnboardingConfig | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  const step = typeof record.step === "string" ? record.step.trim() : "";
  if (!step) return null;

  const texto = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  let showIf: FieldOnboardingConfig["showIf"] = null;
  if (typeof record.showIf === "object" && record.showIf !== null) {
    const cond = record.showIf as Record<string, unknown>;
    const key = texto(cond.key);
    const equals = texto(cond.equals);
    if (key && equals) showIf = { key, equals };
  }

  return {
    step,
    question: texto(record.question),
    required: record.required === true,
    showIf,
    audio: texto(record.audio),
  };
}
