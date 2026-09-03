/**
 * Filas de la base → tipos del dominio.
 *
 * Defensivo igual que el mapper de C0: una fila con un valor que el código no
 * conoce se descarta o cae a un valor neutro, nunca rompe la pantalla entera.
 */
import {
  CHECKPOINT_CLIENT_STATUSES,
  CHECKPOINT_EVENT_SOURCES,
  type Checkpoint,
  type CheckpointEvent,
  type CheckpointEventRow,
  type CheckpointEventSource,
  type CheckpointRow,
  type ClientStatusValue,
  type JourneyStage,
  type JourneyStageRow,
} from "@/types/checkpoints";
import { isFieldOptionColor } from "@/lib/custom-fields";
import { parseMetricSchema } from "@/lib/checkpoints/metric-schema";

export function rowToJourneyStage(row: JourneyStageRow): JourneyStage {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    color: isFieldOptionColor(row.color) ? row.color : "neutral",
    sortOrder: row.sort_order,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToCheckpoint(row: CheckpointRow): Checkpoint {
  return {
    id: row.id,
    organizationId: row.organization_id,
    stageId: row.stage_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
    setsClientStatus: isClientStatusValue(row.sets_client_status)
      ? row.sets_client_status
      : null,
    expectedDays:
      typeof row.expected_days === "number" && row.expected_days > 0
        ? row.expected_days
        : null,
    metricSchema: parseMetricSchema(row.metric_schema),
    productId: row.product_id,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isClientStatusValue(value: unknown): value is ClientStatusValue {
  return (
    typeof value === "string" &&
    (CHECKPOINT_CLIENT_STATUSES as readonly string[]).includes(value)
  );
}

export function rowToCheckpointEvent(row: CheckpointEventRow): CheckpointEvent {
  return {
    id: row.id,
    organizationId: row.organization_id,
    clientId: row.client_id,
    checkpointId: row.checkpoint_id,
    reachedAt: row.reached_at,
    // El jsonb puede traer cualquier cosa; un objeto que no es objeto se lee
    // como vacío en vez de romper la lectura de todos los eventos del cliente.
    metrics:
      typeof row.metrics === "object" && row.metrics !== null && !Array.isArray(row.metrics)
        ? (row.metrics as Record<string, unknown>)
        : {},
    note: row.note,
    recordedBy: row.recorded_by,
    source: isCheckpointEventSource(row.source) ? row.source : "manual",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isCheckpointEventSource(value: unknown): value is CheckpointEventSource {
  return (
    typeof value === "string" &&
    (CHECKPOINT_EVENT_SOURCES as readonly string[]).includes(value)
  );
}
