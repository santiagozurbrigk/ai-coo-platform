import { describe, expect, it } from "vitest";
import {
  MIN_MATCH_CONFIDENCE,
  buildCheckpointMatchPrompt,
  parseCheckpointMatches,
  toCheckpointOptions,
  type CheckpointOption,
  type MatchCandidate,
} from "@/lib/checkpoints/match-proposal";

const catalog: CheckpointOption[] = [
  { id: "cp-1", name: "Grabó el VSL", stageName: "Producción", description: null },
  { id: "cp-2", name: "Lanzó la oferta", stageName: "Lanzamiento", description: null },
];

const candidates: MatchCandidate[] = [
  { id: "msg-1", text: "Terminé de grabar el VSL", context: "#cliente-juan" },
  { id: "msg-2", text: "Buen día a todos" },
];

function response(matches: unknown) {
  return { matches };
}

describe("⭐ sólo se propone lo que está en el catálogo", () => {
  it("acepta un hito del catálogo", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1", confidence: 0.9, rationale: "Lo dice" }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.checkpointId).toBe("cp-1");
    expect(result[0]!.rationale).toBe("Lo dice");
  });

  it("⭐ descarta un hito inventado, aunque venga con confianza altísima", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-inventado", confidence: 1 }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(0);
  });

  it("⭐ descarta un texto que no le pasamos", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-fantasma", checkpointId: "cp-1", confidence: 0.95 }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(0);
  });

  it("con el catálogo vacío no sobrevive nada", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1", confidence: 0.99 }]),
      { catalog: [], candidates }
    );
    expect(result).toHaveLength(0);
  });
});

describe("el umbral de confianza", () => {
  it("por debajo del piso no se propone", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1", confidence: 0.5 }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(0);
  });

  it("justo en el piso sí", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1", confidence: MIN_MATCH_CONFIDENCE }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(1);
  });

  it("⭐ una confianza que no es un número no es alta: se descarta", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1", confidence: "muy alta" }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(0);
  });

  it("sin confianza tampoco pasa", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1" }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(0);
  });

  it("una confianza mayor que 1 se recorta a 1", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1", confidence: 4 }]),
      { catalog, candidates }
    );
    expect(result[0]!.confidence).toBe(1);
  });
});

describe("⭐ un texto propone un solo hito", () => {
  it("se queda el de mayor confianza", () => {
    const result = parseCheckpointMatches(
      response([
        { candidateId: "msg-1", checkpointId: "cp-1", confidence: 0.75, rationale: "flojo" },
        { candidateId: "msg-1", checkpointId: "cp-2", confidence: 0.92, rationale: "fuerte" },
      ]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.checkpointId).toBe("cp-2");
    expect(result[0]!.rationale).toBe("fuerte");
  });

  it("dos textos distintos sí producen dos propuestas", () => {
    const result = parseCheckpointMatches(
      response([
        { candidateId: "msg-1", checkpointId: "cp-1", confidence: 0.8 },
        { candidateId: "msg-2", checkpointId: "cp-2", confidence: 0.8 },
      ]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(2);
  });
});

describe("respuestas rotas no rompen la corrida", () => {
  it("una respuesta que no es objeto devuelve vacío", () => {
    expect(parseCheckpointMatches("no soy json", { catalog, candidates })).toEqual([]);
    expect(parseCheckpointMatches(null, { catalog, candidates })).toEqual([]);
  });

  it("matches que no es lista devuelve vacío", () => {
    expect(parseCheckpointMatches(response("nada"), { catalog, candidates })).toEqual([]);
  });

  it("una entrada rota no se lleva puestas a las buenas", () => {
    const result = parseCheckpointMatches(
      response([null, "texto", { candidateId: "msg-1", checkpointId: "cp-1", confidence: 0.9 }]),
      { catalog, candidates }
    );
    expect(result).toHaveLength(1);
  });

  it("un motivo vacío queda en null, no en cadena vacía", () => {
    const result = parseCheckpointMatches(
      response([{ candidateId: "msg-1", checkpointId: "cp-1", confidence: 0.9, rationale: "   " }]),
      { catalog, candidates }
    );
    expect(result[0]!.rationale).toBeNull();
  });
});

describe("el prompt lleva todo lo que hace falta para elegir", () => {
  it("incluye los ids, los nombres y las fases", () => {
    const prompt = buildCheckpointMatchPrompt(catalog, candidates);
    expect(prompt).toContain("cp-1");
    expect(prompt).toContain("Grabó el VSL");
    expect(prompt).toContain("Producción");
    expect(prompt).toContain("msg-1");
    expect(prompt).toContain("Terminé de grabar el VSL");
  });

  it("el contexto viaja cuando existe", () => {
    expect(buildCheckpointMatchPrompt(catalog, candidates)).toContain("#cliente-juan");
  });
});

describe("aplanar el recorrido", () => {
  it("cada hito se lleva el nombre de su fase", () => {
    const options = toCheckpointOptions([
      {
        name: "Onboarding",
        checkpoints: [{ id: "a", name: "Llamada inicial", description: "La primera" }],
      },
      { name: "Producción", checkpoints: [{ id: "b", name: "Grabó el VSL" }] },
    ]);
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({
      id: "a",
      name: "Llamada inicial",
      stageName: "Onboarding",
      description: "La primera",
    });
    expect(options[1]!.description).toBeNull();
  });

  it("una fase sin hitos no aporta nada", () => {
    expect(toCheckpointOptions([{ name: "Vacía", checkpoints: [] }])).toEqual([]);
  });
});
