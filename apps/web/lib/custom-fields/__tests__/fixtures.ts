import type {
  FieldDefinition,
  FieldOption,
  FieldType,
} from "@/types/custom-fields";

export function option(
  value: string,
  overrides: Partial<FieldOption> = {}
): FieldOption {
  return {
    value,
    label: value,
    color: "neutral",
    archived: false,
    ...overrides,
  };
}

export function field(
  overrides: Partial<FieldDefinition> & { fieldType?: FieldType } = {}
): FieldDefinition {
  return {
    id: "field-1",
    organizationId: "org-1",
    entity: "win",
    key: "tipo_de_win",
    label: "Tipo de win",
    description: null,
    fieldType: "select",
    options: [],
    optionsSource: "inline",
    unit: null,
    currency: null,
    isRequired: false,
    sortOrder: 0,
    archivedAt: null,
    createdAt: "2026-09-03T00:00:00.000Z",
    updatedAt: "2026-09-03T00:00:00.000Z",
    ...overrides,
  };
}
