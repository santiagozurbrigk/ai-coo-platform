/**
 * El formulario de onboarding: qué se pregunta, cómo se valida y cómo cae en
 * la ficha.
 *
 * ⭐ Las preguntas son columnas configurables con `onboarding` cargado. El
 * formulario no tiene lista propia: lo que el equipo ve en la ficha y lo que el
 * cliente contesta son el mismo campo, así que no hay nada que sincronizar.
 *
 * Lógica pura: no toca base ni red. La usan la página pública (servidor y
 * navegador) y la ficha.
 */

import { activeFields, hasValue } from "@/lib/custom-fields/resolve";
import { validateFieldValue } from "@/lib/custom-fields/validate";
import {
  FALLBACK_STEP,
  ONBOARDING_STEPS,
  type OnboardingStep,
} from "@/lib/client-onboarding/steps";
import type {
  CustomFieldValues,
  FieldDefinition,
  FieldOnboardingConfig,
} from "@/types/custom-fields";

export type OnboardingField = FieldDefinition & { onboarding: FieldOnboardingConfig };

export type OnboardingFormStep = {
  step: OnboardingStep;
  fields: OnboardingField[];
};

/**
 * Las preguntas activas del formulario.
 *
 * ⭐ Sólo las que tienen sección: los valores de un cliente de un growth
 * partner se guardan y se muestran por sección. Una pregunta sin sección
 * guardaría la respuesta en un lugar que la ficha no dibuja.
 */
export function onboardingFields(all: readonly FieldDefinition[]): OnboardingField[] {
  return activeFields(all).filter(
    (field): field is OnboardingField => field.onboarding !== null && field.section !== null
  );
}

/**
 * Las preguntas agrupadas en sus pasos, en el orden del formulario.
 *
 * Un paso sin preguntas no aparece. Una pregunta cuyo paso no existe va al
 * final, en «Otras preguntas», en vez de desaparecer.
 */
export function buildOnboardingSteps(fields: readonly OnboardingField[]): OnboardingFormStep[] {
  const ordenadas = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  const conocidos = new Set(ONBOARDING_STEPS.map((step) => step.id));

  const pasos: OnboardingFormStep[] = ONBOARDING_STEPS.map((step) => ({
    step,
    fields: ordenadas.filter((field) => field.onboarding.step === step.id),
  }));
  pasos.push({
    step: FALLBACK_STEP,
    fields: ordenadas.filter((field) => !conocidos.has(field.onboarding.step)),
  });

  return pasos.filter((paso) => paso.fields.length > 0);
}

/** La pregunta como la lee el cliente. */
export function questionText(field: OnboardingField): string {
  return field.onboarding.question ?? field.label;
}

/**
 * ¿Se muestra esta pregunta con lo que se respondió hasta ahora?
 *
 * «¿Qué campañas corrés?» sólo tiene sentido si respondió que corre anuncios.
 */
export function isQuestionVisible(field: OnboardingField, answers: CustomFieldValues): boolean {
  const cond = field.onboarding.showIf;
  if (!cond) return true;
  const actual = answers[cond.key];
  return typeof actual === "string" && actual.trim() === cond.equals;
}

export type OnboardingValidation =
  | { ok: true; values: Record<string, unknown> }
  | { ok: false; errors: Record<string, string> };

/**
 * Valida las respuestas de las preguntas visibles.
 *
 * `values` trae **todas** las preguntas visibles, con `null` para las que
 * quedaron vacías: vaciar una respuesta también es responder, y tiene que
 * poder borrar lo que había. Las ocultas no aparecen, así que no se tocan.
 *
 * Todos los errores juntos, no el primero (mismo criterio que
 * `validateFieldValues`).
 */
export function validateOnboardingAnswers(
  fields: readonly OnboardingField[],
  raw: CustomFieldValues
): OnboardingValidation {
  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (!isQuestionVisible(field, raw)) continue;

    // La obligatoriedad es la del formulario, no la de la ficha.
    if (field.onboarding.required && !hasValue(raw[field.key])) {
      errors[field.key] = "Completá esta respuesta.";
      continue;
    }
    const result = validateFieldValue({ ...field, isRequired: false }, raw[field.key]);
    if (!result.ok) {
      // El error se muestra debajo de la pregunta: el nombre corto de la ficha
      // («Cliente ideal») no le dice nada a quien leyó otra cosa.
      errors[field.key] = result.error.replace(`"${field.label}"`, "Esta respuesta");
      continue;
    }
    values[field.key] = result.value;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values };
}

export type AppliedOnboarding = {
  /** El jsonb nuevo de la ficha. */
  custom: CustomFieldValues;
  /** Lo que había antes en cada campo que cambió (`null` = estaba vacío). */
  replaced: Record<string, unknown>;
  /** Las claves que cambiaron. */
  changed: string[];
};

/**
 * Las respuestas caen en la ficha.
 *
 * ⭐ Decisión del usuario (2026-09-23): **pisan** lo que había. Se puede porque
 * `replaced` guarda el valor anterior de cada campo que cambió, y va al
 * historial del envío. Lo que no se preguntó (otras secciones, preguntas
 * ocultas) queda como estaba.
 */
export function applyOnboardingAnswers(
  loaded: CustomFieldValues,
  answered: Record<string, unknown>
): AppliedOnboarding {
  const custom: CustomFieldValues = { ...loaded };
  const replaced: Record<string, unknown> = {};
  const changed: string[] = [];

  for (const [key, next] of Object.entries(answered)) {
    const prev = hasValue(loaded[key]) ? loaded[key] : null;
    const nuevo = hasValue(next) ? next : null;
    if (JSON.stringify(prev) === JSON.stringify(nuevo)) continue;

    replaced[key] = prev;
    changed.push(key);
    if (nuevo === null) delete custom[key];
    else custom[key] = nuevo;
  }

  return { custom, replaced, changed };
}

/**
 * Lo que ya está en la ficha, para precargar el formulario.
 *
 * Si el cliente vuelve a entrar, ve lo que mandó (o lo que el equipo corrigió)
 * y edita sobre eso, en vez de empezar de cero y pisar todo con vacíos.
 */
export function initialAnswers(
  fields: readonly OnboardingField[],
  custom: CustomFieldValues
): CustomFieldValues {
  const answers: CustomFieldValues = {};
  for (const field of fields) {
    const value = custom[field.key];
    if (hasValue(value)) answers[field.key] = value;
  }
  return answers;
}

/**
 * Los campos de una solapa de la ficha, agrupados por el paso del formulario.
 *
 * En la ficha, la solapa «Onboarding» tiene decenas de respuestas: sin los
 * títulos de los pasos es una lista de 80 renglones. En Sistemas conviven los
 * estados que responde el cliente con los campos de la Plantilla Limitless, que
 * carga el equipo: van en grupos separados para que se sepa de quién es cada
 * dato.
 *
 * Si ningún campo se pregunta, devuelve un solo grupo sin título (Marketing y
 * Ventas quedan como siempre).
 */
export function groupFieldsByStep(
  fields: readonly FieldDefinition[]
): { title: string | null; fields: FieldDefinition[] }[] {
  if (!fields.some((field) => field.onboarding !== null)) {
    return [{ title: null, fields: [...fields] }];
  }
  const conocidos = new Set(ONBOARDING_STEPS.map((step) => step.id));
  const grupos: { title: string | null; fields: FieldDefinition[] }[] = ONBOARDING_STEPS.map(
    (step) => ({
      title: step.title,
      fields: fields.filter((field) => field.onboarding?.step === step.id),
    })
  );
  grupos.push({
    title: FALLBACK_STEP.title,
    fields: fields.filter(
      (field) => field.onboarding !== null && !conocidos.has(field.onboarding.step)
    ),
  });
  grupos.push({
    title: TEAM_GROUP_TITLE,
    fields: fields.filter((field) => field.onboarding === null),
  });
  return grupos.filter((grupo) => grupo.fields.length > 0);
}

/** Los campos que no se preguntan: los carga el equipo. */
export const TEAM_GROUP_TITLE = "Cargado por el equipo";
