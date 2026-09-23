/**
 * Links y envíos del formulario de onboarding: tipos y lectura de filas.
 *
 * Lógica pura: no toca base ni red.
 */

import type { CustomFieldValues } from "@/types/custom-fields";

export const ONBOARDING_LINK_COLUMNS = "id, sub_client_id, token, created_at, revoked_at";
export const ONBOARDING_SUBMISSION_COLUMNS =
  "id, sub_client_id, respondent_name, answers, replaced, labels, created_at";

export type OnboardingLink = {
  id: string;
  subClientId: string;
  token: string;
  createdAt: string;
};

export type OnboardingSubmission = {
  id: string;
  subClientId: string;
  respondentName: string | null;
  /** Lo que mandó, pregunta por pregunta (`null` = la dejó vacía). */
  answers: CustomFieldValues;
  /** Lo que había antes en cada campo que cambió. */
  replaced: CustomFieldValues;
  /** El nombre de cada pregunta al momento del envío. */
  labels: Record<string, string>;
  createdAt: string;
};

export type OnboardingSubmissionRow = {
  id: string;
  sub_client_id: string;
  respondent_name: string | null;
  answers: unknown;
  replaced: unknown;
  labels: unknown;
  created_at: string;
};

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
    subClientId: row.sub_client_id,
    respondentName: row.respondent_name,
    answers: objeto(row.answers),
    replaced: objeto(row.replaced),
    labels,
    createdAt: row.created_at,
  };
}
