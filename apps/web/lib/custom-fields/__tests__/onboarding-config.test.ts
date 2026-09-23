import { describe, expect, it } from "vitest";
import { parseOnboardingConfig } from "@/lib/custom-fields/mapper";

describe("parseOnboardingConfig", () => {
  it("nulo, sin paso o con basura es null: el campo no se pregunta", () => {
    expect(parseOnboardingConfig(null)).toBeNull();
    expect(parseOnboardingConfig([])).toBeNull();
    expect(parseOnboardingConfig("oferta")).toBeNull();
    expect(parseOnboardingConfig({ question: "¿Cuál?" })).toBeNull();
    expect(parseOnboardingConfig({ step: "  " })).toBeNull();
  });

  it("lee la config completa", () => {
    expect(
      parseOnboardingConfig({
        step: "funnel",
        question: " ¿Qué campañas corrés? ",
        required: true,
        showIf: { key: "onb_runs_ads", equals: "si" },
        audio: "5 min",
      })
    ).toEqual({
      step: "funnel",
      question: "¿Qué campañas corrés?",
      required: true,
      showIf: { key: "onb_runs_ads", equals: "si" },
      audio: "5 min",
    });
  });

  it("descarta lo que no entiende sin inventar", () => {
    expect(
      parseOnboardingConfig({ step: "oferta", required: "sí", showIf: { key: "x" }, audio: 5 })
    ).toEqual({ step: "oferta", question: null, required: false, showIf: null, audio: null });
  });
});
