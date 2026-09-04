import { describe, expect, it } from "vitest";
import {
  parseMetricSchema,
  resolveMetricSchema,
  selectableCheckpointFields,
  serializeMetricSchema,
} from "@/lib/checkpoints/metric-schema";
import { rowToCheckpoint, rowToJourneyStage } from "@/lib/checkpoints/mapper";
import { field } from "@/lib/custom-fields/__tests__/fixtures";
import type { CheckpointRow, JourneyStageRow } from "@/types/checkpoints";

describe("leer el jsonb de métricas", () => {
  it("lee la forma guardada", () => {
    expect(parseMetricSchema([{ field_key: "facturacion", required: true }])).toEqual([
      { fieldKey: "facturacion", required: true },
    ]);
  });

  it("descarta lo que no se entiende en vez de crear métricas sin nombre", () => {
    expect(parseMetricSchema([null, 3, {}, { field_key: "  " }, "x"])).toEqual([]);
    expect(parseMetricSchema({ field_key: "x" })).toEqual([]);
    expect(parseMetricSchema(null)).toEqual([]);
  });

  it("deduplica: la misma columna dos veces es la misma métrica", () => {
    expect(
      parseMetricSchema([{ field_key: "a" }, { field_key: "a", required: true }])
    ).toHaveLength(1);
  });

  it("sin `required` explícito, la métrica es opcional", () => {
    expect(parseMetricSchema([{ field_key: "a" }])[0]?.required).toBe(false);
  });

  it("va y vuelve sin perder nada", () => {
    const metrics = [{ fieldKey: "facturacion", required: true }];
    expect(parseMetricSchema(serializeMetricSchema(metrics))).toEqual(metrics);
  });
});

describe("cruzar lo que pide un checkpoint con las columnas que existen", () => {
  const facturacion = field({
    id: "f1",
    entity: "checkpoint",
    key: "facturacion",
    label: "Facturación",
    fieldType: "currency",
  });
  const clientes = field({
    id: "f2",
    entity: "checkpoint",
    key: "clientes",
    label: "Clientes",
    fieldType: "number",
    isRequired: true,
  });

  it("engancha cada métrica con su columna", () => {
    const [resolved] = resolveMetricSchema(
      [{ fieldKey: "facturacion", required: false }],
      [facturacion, clientes]
    );
    expect(resolved?.field?.label).toBe("Facturación");
  });

  it("⭐ una referencia rota se devuelve marcada, no se descarta", () => {
    // Que la pantalla pueda decir "esto apunta a una columna que ya no existe"
    // es lo que evita que alguien la busque durante media hora.
    const [resolved] = resolveMetricSchema(
      [{ fieldKey: "borrada", required: false }],
      [facturacion]
    );
    expect(resolved?.field).toBeNull();
    expect(resolved?.metric.fieldKey).toBe("borrada");
  });

  it("el checkpoint puede endurecer la obligatoriedad", () => {
    const [resolved] = resolveMetricSchema(
      [{ fieldKey: "facturacion", required: true }],
      [facturacion]
    );
    expect(resolved?.required).toBe(true);
  });

  it("⭐ pero no puede aflojarla: un campo obligatorio en C0 lo es en todos lados", () => {
    const [resolved] = resolveMetricSchema(
      [{ fieldKey: "clientes", required: false }],
      [clientes]
    );
    expect(resolved?.required).toBe(true);
  });

  it("no engancha con una columna de wins aunque la clave coincida", () => {
    const winField = field({ entity: "win", key: "facturacion", label: "Facturación win" });
    const [resolved] = resolveMetricSchema(
      [{ fieldKey: "facturacion", required: false }],
      [winField]
    );
    expect(resolved?.field).toBeNull();
  });
});

describe("qué columnas se ofrecen al armar un checkpoint", () => {
  it("sólo las de checkpoint, sin archivar, en orden", () => {
    const fields = [
      field({ id: "1", entity: "checkpoint", key: "b", label: "B", sortOrder: 2 }),
      field({ id: "2", entity: "checkpoint", key: "a", label: "A", sortOrder: 1 }),
      field({ id: "3", entity: "win", key: "w", label: "W", sortOrder: 0 }),
      field({
        id: "4",
        entity: "checkpoint",
        key: "z",
        label: "Z",
        sortOrder: 0,
        archivedAt: "2026-09-01T00:00:00Z",
      }),
    ];
    expect(selectableCheckpointFields(fields).map((f) => f.key)).toEqual(["a", "b"]);
  });
});

describe("leer filas de la base", () => {
  const stageRow: JourneyStageRow = {
    id: "s1",
    organization_id: "org-1",
    name: "Onboarding",
    color: "cat-3",
    sort_order: 1,
    archived_at: null,
    created_at: "2026-09-03T00:00:00.000Z",
    updated_at: "2026-09-03T00:00:00.000Z",
  };

  const checkpointRow: CheckpointRow = {
    id: "c1",
    organization_id: "org-1",
    stage_id: "s1",
    name: "Bienvenida",
    description: null,
    sort_order: 1,
    sets_client_status: "active",
    expected_days: 5,
    metric_schema: [{ field_key: "facturacion", required: true }],
    product_id: null,
    archived_at: null,
    created_at: "2026-09-03T00:00:00.000Z",
    updated_at: "2026-09-03T00:00:00.000Z",
  };

  it("mapea una fase", () => {
    expect(rowToJourneyStage(stageRow).color).toBe("cat-3");
  });

  it("un color desconocido cae a neutral en vez de romper la fase", () => {
    expect(rowToJourneyStage({ ...stageRow, color: "#ff0000" }).color).toBe("neutral");
  });

  it("mapea un checkpoint con su estado y su plazo", () => {
    const mapped = rowToCheckpoint(checkpointRow);
    expect(mapped.setsClientStatus).toBe("active");
    expect(mapped.expectedDays).toBe(5);
    expect(mapped.metricSchema).toEqual([{ fieldKey: "facturacion", required: true }]);
  });

  it("un estado que el código no conoce se ignora en vez de propagarse", () => {
    expect(rowToCheckpoint({ ...checkpointRow, sets_client_status: "churned" })
      .setsClientStatus).toBeNull();
  });

  it("un plazo cero o negativo se lee como 'sin plazo', no como 'vence hoy'", () => {
    expect(rowToCheckpoint({ ...checkpointRow, expected_days: 0 }).expectedDays).toBeNull();
    expect(rowToCheckpoint({ ...checkpointRow, expected_days: -3 }).expectedDays).toBeNull();
  });
});
