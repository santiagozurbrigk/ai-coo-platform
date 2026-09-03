import type { Checkpoint, JourneyStage } from "@/types/checkpoints";

export function stage(overrides: Partial<JourneyStage> = {}): JourneyStage {
  return {
    id: "stage-1",
    organizationId: "org-1",
    name: "Onboarding",
    color: "neutral",
    sortOrder: 0,
    archivedAt: null,
    createdAt: "2026-09-03T00:00:00.000Z",
    updatedAt: "2026-09-03T00:00:00.000Z",
    ...overrides,
  };
}

export function checkpoint(overrides: Partial<Checkpoint> = {}): Checkpoint {
  return {
    id: "cp-1",
    organizationId: "org-1",
    stageId: "stage-1",
    name: "Llamada de bienvenida",
    description: null,
    sortOrder: 0,
    setsClientStatus: null,
    expectedDays: null,
    metricSchema: [],
    productId: null,
    archivedAt: null,
    createdAt: "2026-09-03T00:00:00.000Z",
    updatedAt: "2026-09-03T00:00:00.000Z",
    ...overrides,
  };
}
