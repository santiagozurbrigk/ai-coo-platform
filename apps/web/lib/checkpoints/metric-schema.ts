/**
 * El puente entre un checkpoint y los campos configurables de C0.
 *
 * ⭐ La regla que sostiene esto: un checkpoint **no define métricas**, elige
 * cuáles de las columnas ya definidas te pide. No hay un segundo mecanismo de
 * campos configurables.
 *
 * Lógica pura: no toca base ni red.
 */
import type { CheckpointMetric } from "@/types/checkpoints";
import type { FieldDefinition } from "@/types/custom-fields";

/**
 * Lee el jsonb crudo.
 *
 * Defensivo igual que las opciones de C0: una entrada que no se entiende se
 * descarta en vez de convertirse en una métrica sin nombre.
 */
export function parseMetricSchema(raw: unknown): CheckpointMetric[] {
  if (!Array.isArray(raw)) return [];

  const metrics: CheckpointMetric[] = [];
  const seen = new Set<string>();

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;

    const fieldKey =
      typeof record.field_key === "string"
        ? record.field_key.trim()
        : typeof record.fieldKey === "string"
          ? record.fieldKey.trim()
          : "";

    if (!fieldKey || seen.has(fieldKey)) continue;
    seen.add(fieldKey);
    metrics.push({ fieldKey, required: record.required === true });
  }

  return metrics;
}

/** Cómo se guarda: snake_case, igual que el resto de los jsonb del repo. */
export function serializeMetricSchema(
  metrics: readonly CheckpointMetric[]
): { field_key: string; required: boolean }[] {
  return metrics.map((metric) => ({
    field_key: metric.fieldKey,
    required: metric.required,
  }));
}

export type ResolvedMetric = {
  metric: CheckpointMetric;
  /** `null` cuando la columna que referencia ya no existe. */
  field: FieldDefinition | null;
  /**
   * Obligatoria de verdad: el checkpoint puede **endurecer** lo que dice el
   * campo, nunca aflojarlo. Un campo obligatorio en C0 lo es en todos lados.
   */
  required: boolean;
};

/**
 * Cruza lo que pide un checkpoint con las columnas que existen hoy.
 *
 * Una referencia rota **se devuelve marcada**, no se descarta: que la pantalla
 * pueda decir "esta métrica apunta a una columna que ya no existe" es
 * exactamente el aviso que evita que alguien la busque durante media hora.
 */
export function resolveMetricSchema(
  metrics: readonly CheckpointMetric[],
  fields: readonly FieldDefinition[]
): ResolvedMetric[] {
  const byKey = new Map(
    fields.filter((field) => field.entity === "checkpoint").map((f) => [f.key, f])
  );

  return metrics.map((metric) => {
    const field = byKey.get(metric.fieldKey) ?? null;
    return {
      metric,
      field,
      required: metric.required || field?.isRequired === true,
    };
  });
}

/** Las columnas de checkpoint que se pueden ofrecer para agregar a un hito. */
export function selectableCheckpointFields(
  fields: readonly FieldDefinition[]
): FieldDefinition[] {
  return fields
    .filter((field) => field.entity === "checkpoint" && field.archivedAt === null)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, "es"));
}
