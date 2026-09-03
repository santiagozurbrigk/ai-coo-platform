/**
 * C1 · El recorrido del cliente — tipos.
 *
 * Dos niveles: las **fases** son los tramos grandes; los **checkpoints** son los
 * hitos concretos dentro de cada fase.
 *
 * Esto es el catálogo, no lo que ocurrió. El registro de que un cliente alcanzó
 * un checkpoint lo trae C2.
 */
import type { FieldOptionColor } from "@/types/custom-fields";

export type JourneyStage = {
  id: string;
  organizationId: string;
  name: string;
  color: FieldOptionColor;
  sortOrder: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Una métrica que pide un checkpoint.
 *
 * ⭐ `fieldKey` **referencia** un `field_definitions` con `entity = 'checkpoint'`
 * (C0). No es una copia de esa definición: guardar la clave es lo que hace que
 * renombrar una métrica la cambie en todos los checkpoints a la vez.
 */
export type CheckpointMetric = {
  fieldKey: string;
  /**
   * Obligatoria **en este checkpoint**. Puede endurecer lo que dice el campo,
   * nunca aflojarlo: un campo obligatorio en C0 lo es en todos lados.
   */
  required: boolean;
};

export type Checkpoint = {
  id: string;
  organizationId: string;
  stageId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  /** Al alcanzarlo, el cliente pasa a este estado. `null` = no cambia nada. */
  setsClientStatus: ClientStatusValue | null;
  /** Días esperados **desde el checkpoint anterior**, no desde el alta. */
  expectedDays: number | null;
  metricSchema: CheckpointMetric[];
  productId: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Los cuatro estados de `clients.status`.
 *
 * Se re-declaran acá y no se importa `ClientStatus` para dejar explícito que el
 * estado grueso **no se hace configurable**: esta lista dice a qué estado puede
 * llevar un checkpoint, que es otra decisión.
 */
export const CHECKPOINT_CLIENT_STATUSES = [
  "pending_onboarding",
  "onboarding_done",
  "active",
  "success_case",
] as const;
export type ClientStatusValue = (typeof CHECKPOINT_CLIENT_STATUSES)[number];

export const CHECKPOINT_CLIENT_STATUS_LABEL: Record<ClientStatusValue, string> = {
  pending_onboarding: "Pendiente onboarding",
  onboarding_done: "Onboarding hecho",
  active: "Activo",
  success_case: "Caso de éxito",
};

/** Una fase con sus checkpoints ya ordenados. Es lo que la pantalla dibuja. */
export type JourneyStageWithCheckpoints = JourneyStage & {
  checkpoints: Checkpoint[];
};

export type JourneyStageRow = {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CheckpointRow = {
  id: string;
  organization_id: string;
  stage_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  sets_client_status: string | null;
  expected_days: number | null;
  metric_schema: unknown;
  product_id: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};
