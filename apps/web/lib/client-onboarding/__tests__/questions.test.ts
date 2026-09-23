import { describe, expect, it } from "vitest";
import { ONBOARDING_QUESTIONS } from "@/lib/client-onboarding/questions";
import { ONBOARDING_STEPS } from "@/lib/client-onboarding/steps";
import { isValidFieldKey } from "@/lib/custom-fields/key";

/**
 * La plantilla se inserta directo en la base, sin pasar por el zod de
 * `createFieldDefinitionAction`. Estos tests son esa validación.
 */
describe("ONBOARDING_QUESTIONS", () => {
  it("trae las 74 preguntas del formulario original más la del equipo", () => {
    expect(ONBOARDING_QUESTIONS).toHaveLength(75);
  });

  it("cada clave es válida, única y con prefijo onb_", () => {
    const keys = ONBOARDING_QUESTIONS.map((q) => q.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) {
      expect(isValidFieldKey(key), key).toBe(true);
      expect(key.startsWith("onb_"), key).toBe(true);
    }
  });

  it("cada pregunta va a un paso que existe", () => {
    const pasos = new Set(ONBOARDING_STEPS.map((s) => s.id));
    for (const q of ONBOARDING_QUESTIONS) expect(pasos.has(q.step), q.key).toBe(true);
  });

  it("las etiquetas entran en el límite de la pantalla de campos", () => {
    for (const q of ONBOARDING_QUESTIONS) {
      expect(q.label.length, q.key).toBeLessThanOrEqual(120);
      expect((q.help ?? "").length, q.key).toBeLessThanOrEqual(2000);
    }
  });

  it("cada condición apunta a una lista anterior y a una opción que existe", () => {
    ONBOARDING_QUESTIONS.forEach((q, index) => {
      if (!q.showIf) return;
      const origen = ONBOARDING_QUESTIONS.findIndex((o) => o.key === q.showIf!.key);
      expect(origen, q.key).toBeGreaterThanOrEqual(0);
      expect(origen, q.key).toBeLessThan(index);
      const opciones = ONBOARDING_QUESTIONS[origen]!.options ?? [];
      expect(opciones.map((o) => o.value), q.key).toContain(q.showIf.equals);
    });
  });
});
