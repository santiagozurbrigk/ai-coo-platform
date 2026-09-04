import { describe, expect, it } from "vitest";
import {
  DEFAULT_OVERLAP_SECONDS,
  ESTIMATED_BYTES_PER_SECOND,
  WHISPER_MAX_BYTES,
  computeAudioChunks,
  estimateTranscriptionCostUsd,
  joinTranscriptChunks,
} from "@/lib/sops/audio-chunks";

/** Cuántos segundos entran en un request con los valores por defecto. */
const MAX_SECONDS = Math.floor(WHISPER_MAX_BYTES / ESTIMATED_BYTES_PER_SECOND);

describe("partir el audio", () => {
  it("⭐ un audio que entra en el límite NO se parte", () => {
    // Es el caso normal: un Loom de 20 minutos entra entero. Partir sin
    // necesidad costaría llamadas de más y uniones que pueden salir mal.
    const chunks = computeAudioChunks(20 * 60);
    expect(chunks).toEqual([{ index: 0, startSeconds: 0, durationSeconds: 1200 }]);
  });

  it("justo en el límite tampoco se parte", () => {
    expect(computeAudioChunks(MAX_SECONDS)).toHaveLength(1);
  });

  it("uno más largo se parte y los pedazos cubren todo el audio", () => {
    const duration = MAX_SECONDS * 2 + 300;
    const chunks = computeAudioChunks(duration);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.startSeconds).toBe(0);

    const last = chunks[chunks.length - 1]!;
    expect(last.startSeconds + last.durationSeconds).toBe(duration);
  });

  it("⭐ los pedazos se solapan, para no partir una palabra al medio", () => {
    const chunks = computeAudioChunks(MAX_SECONDS * 2 + 300);
    const first = chunks[0]!;
    const second = chunks[1]!;
    const gap = first.startSeconds + first.durationSeconds - second.startSeconds;
    expect(gap).toBe(DEFAULT_OVERLAP_SECONDS);
  });

  it("ningún pedazo supera el límite", () => {
    for (const chunk of computeAudioChunks(MAX_SECONDS * 3)) {
      expect(chunk.durationSeconds * ESTIMATED_BYTES_PER_SECOND).toBeLessThanOrEqual(
        WHISPER_MAX_BYTES
      );
    }
  });

  it("⭐ un solape gigante no cuelga el cálculo", () => {
    // Si el solape se comiera el pedazo entero, cada corte avanzaría cero
    // segundos y el bucle no terminaría nunca.
    const chunks = computeAudioChunks(MAX_SECONDS * 2, { overlapSeconds: 999_999 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.length).toBeLessThan(100);
  });

  it("una duración que no se conoce no produce cortes inventados", () => {
    expect(computeAudioChunks(0)).toEqual([]);
    expect(computeAudioChunks(-5)).toEqual([]);
    expect(computeAudioChunks(Number.NaN)).toEqual([]);
  });

  it("los índices van en orden y sin huecos", () => {
    const chunks = computeAudioChunks(MAX_SECONDS * 3);
    expect(chunks.map((c) => c.index)).toEqual(chunks.map((_, i) => i));
  });
});

describe("unir las transcripciones", () => {
  it("una sola parte se devuelve tal cual", () => {
    expect(joinTranscriptChunks(["hola qué tal"])).toBe("hola qué tal");
  });

  it("⭐ quita la repetición que deja el solape", () => {
    // Sin esto, las palabras repetidas terminan como pasos duplicados en el SOP.
    const joined = joinTranscriptChunks([
      "primero abrís el panel y después vas a configuración",
      "y después vas a configuración y tocás guardar",
    ]);
    expect(joined).toBe(
      "primero abrís el panel y después vas a configuración y tocás guardar"
    );
  });

  it("reconoce la repetición aunque la puntuación cambie entre pedazos", () => {
    const joined = joinTranscriptChunks([
      "abrís el panel de control",
      "El panel de control, y tocás guardar",
    ]);
    expect(joined).toContain("y tocás guardar");
    expect(joined.toLowerCase().split("panel de control").length - 1).toBe(1);
  });

  it("sin repetición, simplemente concatena", () => {
    expect(joinTranscriptChunks(["primer paso", "segundo paso"])).toBe(
      "primer paso segundo paso"
    );
  });

  it("ignora pedazos vacíos", () => {
    expect(joinTranscriptChunks(["", "  ", "algo"])).toBe("algo");
    expect(joinTranscriptChunks([])).toBe("");
  });
});

describe("costo de la transcripción", () => {
  it("cobra por minuto: 20 minutos ≈ 12 centavos", () => {
    expect(estimateTranscriptionCostUsd(20 * 60)).toBeCloseTo(0.12, 5);
  });

  it("una duración desconocida no cuesta un número inventado", () => {
    expect(estimateTranscriptionCostUsd(0)).toBe(0);
    expect(estimateTranscriptionCostUsd(Number.NaN)).toBe(0);
  });
});
