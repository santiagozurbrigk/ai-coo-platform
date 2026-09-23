import { describe, expect, it } from "vitest";
import {
  applyOnboardingAnswers,
  buildOnboardingSteps,
  groupFieldsByStep,
  initialAnswers,
  isQuestionVisible,
  onboardingFields,
  questionText,
  validateOnboardingAnswers,
  type OnboardingField,
} from "@/lib/client-onboarding/form";
import { field, option } from "@/lib/custom-fields/__tests__/fixtures";
import type { FieldDefinition, FieldOnboardingConfig } from "@/types/custom-fields";

function pregunta(
  key: string,
  onboarding: Partial<FieldOnboardingConfig> = {},
  overrides: Partial<FieldDefinition> = {}
): OnboardingField {
  return field({
    id: key,
    key,
    label: key,
    entity: "client",
    fieldType: "text",
    section: "onboarding",
    onboarding: {
      step: "oferta",
      question: null,
      required: true,
      showIf: null,
      audio: null,
      ...onboarding,
    },
    ...overrides,
  }) as OnboardingField;
}

const correAds = pregunta(
  "runs_ads",
  { step: "funnel" },
  {
    fieldType: "select",
    options: [option("si", { label: "Sí" }), option("no", { label: "No" })],
    sortOrder: 1,
  }
);
const campanas = pregunta(
  "ad_campaigns",
  { step: "funnel", showIf: { key: "runs_ads", equals: "si" } },
  { sortOrder: 2 }
);

describe("onboardingFields", () => {
  it("deja sólo las preguntas activas con sección", () => {
    const sinConfig = field({ key: "avatar", entity: "client", section: "marketing" });
    const sinSeccion = pregunta("suelta", {}, { section: null });
    const archivada = pregunta("vieja", {}, { archivedAt: "2026-09-01T00:00:00.000Z" });
    const buena = pregunta("buena");

    expect(onboardingFields([sinConfig, sinSeccion, archivada, buena]).map((f) => f.key)).toEqual([
      "buena",
    ]);
  });
});

describe("buildOnboardingSteps", () => {
  it("respeta el orden de los pasos y el orden de cada campo", () => {
    const a = pregunta("a", { step: "funnel" }, { sortOrder: 5 });
    const b = pregunta("b", { step: "negocio" }, { sortOrder: 9 });
    const c = pregunta("c", { step: "funnel" }, { sortOrder: 1 });

    const pasos = buildOnboardingSteps([a, b, c]);
    expect(pasos.map((p) => p.step.id)).toEqual(["negocio", "funnel"]);
    expect(pasos[1]?.fields.map((f) => f.key)).toEqual(["c", "a"]);
  });

  it("una pregunta con un paso que no existe va al final, no desaparece", () => {
    const perdida = pregunta("perdida", { step: "paso_borrado" });
    const pasos = buildOnboardingSteps([perdida, pregunta("x", { step: "negocio" })]);
    expect(pasos.map((p) => p.step.id)).toEqual(["negocio", "otras"]);
  });
});

describe("questionText", () => {
  it("usa la pregunta y, si no hay, la etiqueta", () => {
    expect(questionText(pregunta("a", { question: "¿Cuál?" }))).toBe("¿Cuál?");
    expect(questionText(pregunta("a"))).toBe("a");
  });
});

describe("isQuestionVisible", () => {
  it("muestra la pregunta condicionada sólo con la respuesta que la habilita", () => {
    expect(isQuestionVisible(campanas, {})).toBe(false);
    expect(isQuestionVisible(campanas, { runs_ads: "no" })).toBe(false);
    expect(isQuestionVisible(campanas, { runs_ads: "si" })).toBe(true);
    expect(isQuestionVisible(correAds, {})).toBe(true);
  });
});

describe("validateOnboardingAnswers", () => {
  it("exige las obligatorias visibles y junta todos los errores", () => {
    const r = validateOnboardingAnswers([correAds, campanas, pregunta("avatar")], {
      runs_ads: "si",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["ad_campaigns", "avatar"]);
    expect(r.errors.avatar).toBe("Completá esta respuesta.");
  });

  it("no exige ni devuelve las preguntas ocultas", () => {
    const r = validateOnboardingAnswers([correAds, campanas], { runs_ads: "no" });
    expect(r).toEqual({ ok: true, values: { runs_ads: "no" } });
  });

  it("una opcional vacía vuelve como null, para poder borrar lo que había", () => {
    const opcional = pregunta("equipo", { required: false });
    expect(validateOnboardingAnswers([opcional], { equipo: "  " })).toEqual({
      ok: true,
      values: { equipo: null },
    });
  });

  it("la obligatoriedad de la ficha no cuenta en el formulario", () => {
    const soloFicha = pregunta("x", { required: false }, { isRequired: true });
    expect(validateOnboardingAnswers([soloFicha], {}).ok).toBe(true);
  });

  it("rechaza una opción que no existe, sin nombrar la etiqueta de la ficha", () => {
    const r = validateOnboardingAnswers([correAds], { runs_ads: "quizas" });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.runs_ads).not.toContain('"runs_ads"');
  });

  it("recorta el texto", () => {
    expect(validateOnboardingAnswers([pregunta("a")], { a: "  hola  " })).toEqual({
      ok: true,
      values: { a: "hola" },
    });
  });
});

describe("applyOnboardingAnswers", () => {
  it("pisa lo que cambió y guarda lo que había antes", () => {
    const r = applyOnboardingAnswers(
      { avatar: "viejo", oferta: "igual", marketing_propio: "del equipo" },
      { avatar: "nuevo", oferta: "igual", nicho: "fitness" }
    );
    expect(r.custom).toEqual({
      avatar: "nuevo",
      oferta: "igual",
      nicho: "fitness",
      marketing_propio: "del equipo",
    });
    expect(r.replaced).toEqual({ avatar: "viejo", nicho: null });
    expect(r.changed.sort()).toEqual(["avatar", "nicho"]);
  });

  it("una respuesta vaciada borra el valor y queda en el historial", () => {
    const r = applyOnboardingAnswers({ equipo: "Juan" }, { equipo: null });
    expect(r.custom).toEqual({});
    expect(r.replaced).toEqual({ equipo: "Juan" });
  });

  it("vacío contra vacío no es un cambio", () => {
    const r = applyOnboardingAnswers({ equipo: "" }, { equipo: null });
    expect(r.changed).toEqual([]);
  });
});

describe("initialAnswers", () => {
  it("precarga sólo las preguntas del formulario con algo cargado", () => {
    expect(
      initialAnswers([pregunta("a"), pregunta("b")], { a: "hola", b: "", avatar: "no va" })
    ).toEqual({ a: "hola" });
  });
});

describe("groupFieldsByStep", () => {
  it("sin pasos, un solo grupo sin título (Marketing, Ventas, Sistemas)", () => {
    const a = field({ key: "a" });
    expect(groupFieldsByStep([a])).toEqual([{ title: null, fields: [a] }]);
  });

  it("agrupa por paso en el orden del formulario, y lo suelto va al final", () => {
    const suelto = field({ key: "suelto", section: "onboarding" });
    const funnel = pregunta("f", { step: "funnel" });
    const negocio = pregunta("n", { step: "negocio" });
    const grupos = groupFieldsByStep([suelto, funnel, negocio]);
    expect(grupos.map((g) => g.title)).toEqual([
      "Tu negocio",
      "Paso 6 — Tu funnel y tus ads",
      "Otras preguntas",
    ]);
    expect(grupos[2]?.fields.map((f) => f.key)).toEqual(["suelto"]);
  });
});
