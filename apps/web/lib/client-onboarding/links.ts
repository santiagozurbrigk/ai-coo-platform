/**
 * Links y envíos del formulario de onboarding: tipos y lectura de filas.
 *
 * Lógica pura: no toca base ni red.
 */

import type { CustomFieldValues } from "@/types/custom-fields";

export const ONBOARDING_LINK_COLUMNS = "id, kind, sub_client_id, token, created_at, revoked_at";
export const ONBOARDING_SUBMISSION_COLUMNS =
  "id, client_id, sub_client_id, respondent_name, creator_name, answers, replaced, labels, created_at, assigned_at";

/**
 * `creator`: el link de un cliente de un growth partner; lo que responde cae
 * en su ficha. `general`: uno por organización, para quien todavía no está
 * cargado; lo que responde queda sin asignar hasta que el equipo decide.
 */
export type OnboardingLinkKind = "creator" | "general";

export type OnboardingLink = {
  id: string;
  kind: OnboardingLinkKind;
  /** Nulo en el link general. */
  subClientId: string | null;
  token: string;
  createdAt: string;
};

export type OnboardingLinkRow = {
  id: string;
  kind: string;
  sub_client_id: string | null;
  token: string;
  created_at: string;
  revoked_at: string | null;
};

export function rowToOnboardingLink(row: OnboardingLinkRow): OnboardingLink {
  return {
    id: row.id,
    kind: row.kind === "general" ? "general" : "creator",
    subClientId: row.sub_client_id,
    token: row.token,
    createdAt: row.created_at,
  };
}

export type OnboardingSubmission = {
  id: string;
  /** Nulos mientras un envío del link general no se asignó. */
  clientId: string | null;
  subClientId: string | null;
  respondentName: string | null;
  /** El creador que escribió quien completó el link general. */
  creatorName: string | null;
  /** Lo que mandó, pregunta por pregunta (`null` = la dejó vacía). */
  answers: CustomFieldValues;
  /** Lo que había antes en cada campo que cambió. */
  replaced: CustomFieldValues;
  /** El nombre de cada pregunta al momento del envío. */
  labels: Record<string, string>;
  createdAt: string;
  assignedAt: string | null;
};

export type OnboardingSubmissionRow = {
  id: string;
  client_id: string | null;
  sub_client_id: string | null;
  respondent_name: string | null;
  creator_name: string | null;
  answers: unknown;
  replaced: unknown;
  labels: unknown;
  created_at: string;
  assigned_at: string | null;
};

/**
 * La clave con la que vuelve el error de «Nombre del creador» en el link
 * general. No choca con una columna: las claves no pueden empezar con `_`.
 */
export const CREATOR_NAME_ERROR_KEY = "__creator_name";

/** La ruta pública del formulario. */
export function onboardingFormPath(token: string): string {
  return `/onboarding-cliente/${token}`;
}

/**
 * ¿Tiene forma de token? Se chequea antes de ir a la base: un token con otra
 * forma no existe, y ahorra una consulta por cada URL inventada.
 */
export function looksLikeOnboardingToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(token);
}

function objeto(raw: unknown): CustomFieldValues {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as CustomFieldValues)
    : {};
}

export function rowToOnboardingSubmission(row: OnboardingSubmissionRow): OnboardingSubmission {
  const labels: Record<string, string> = {};
  for (const [key, value] of Object.entries(objeto(row.labels))) {
    if (typeof value === "string") labels[key] = value;
  }
  return {
    id: row.id,
    clientId: row.client_id,
    subClientId: row.sub_client_id,
    respondentName: row.respondent_name,
    creatorName: row.creator_name,
    answers: objeto(row.answers),
    replaced: objeto(row.replaced),
    labels,
    createdAt: row.created_at,
    assignedAt: row.assigned_at,
  };
}
