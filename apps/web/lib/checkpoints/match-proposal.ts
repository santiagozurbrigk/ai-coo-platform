/**
 * ⭐ De un texto suelto a un hito del recorrido — sin inventar ninguno.
 *
 * Un mensaje de Discord ("¡grabé el VSL!") o el resumen de una llamada de
 * entrega pueden estar contando que un cliente alcanzó un hito. Este archivo
 * arma la pregunta y **filtra la respuesta**, que es donde está el trabajo real.
 *
 * Las cuatro reglas, todas por el mismo motivo —una propuesta equivocada le
 * hace perder tiempo a una persona, y varias seguidas hacen que deje de mirar
 * el buzón—:
 *
 *   1. **Un hito que no está en el catálogo no existe.** Si el modelo devuelve
 *      un id que no le pasamos, se descarta entero. Nunca se crea un hito.
 *   2. **Un texto que no le pasamos tampoco.** Misma regla, del otro lado.
 *   3. **Por debajo del umbral no se propone.** Dudar en voz alta es ruido.
 *   4. **Un texto propone un solo hito**: el de mayor confianza. Dos propuestas
 *      del mismo mensaje son dos decisiones para la misma cosa.
 *
 * Lógica pura: no toca base ni red.
 */

/** Un hito del catálogo, como se le muestra al modelo. */
export type CheckpointOption = {
  id: string;
  name: string;
  stageName: string;
  description?: string | null;
};

/** Un texto candidato: un mensaje de Discord, el resumen de una llamada. */
export type MatchCandidate = {
  id: string;
  text: string;
  /** Contexto opcional que ayuda a leer el texto (canal, título de la llamada). */
  context?: string | null;
};

export type CheckpointMatch = {
  candidateId: string;
  checkpointId: string;
  /** 0 a 1. Lo que el modelo dice de sí mismo, no una medida. */
  confidence: number;
  /** Por qué. Va a la propuesta: nadie acepta algo que no sabe de dónde salió. */
  rationale: string | null;
};

/**
 * El piso de confianza.
 *
 * Alto a propósito. El costo de una propuesta de más (alguien la mira, la
 * descarta y confía un poco menos en la próxima) es peor que el de una de menos
 * (el hito se registra a mano, como se hacía siempre).
 */
export const MIN_MATCH_CONFIDENCE = 0.7;

export const CHECKPOINT_MATCH_SYSTEM_PROMPT = `Sos un asistente que lee mensajes de clientes de un negocio de infoproductos y detecta si alguno cuenta que alcanzó un hito concreto del programa.

Reglas:
- Sólo podés elegir hitos de la lista que te doy, por su id exacto.
- Si un texto no dice claramente que el cliente alcanzó un hito, no lo incluyas.
- Que alguien mencione un tema NO significa que lo haya alcanzado: "estoy armando el VSL" no es "grabé el VSL"; "¿cómo hago la oferta?" no es "lancé la oferta".
- Un plan a futuro, una pregunta o una queja nunca son un hito alcanzado.
- Ante la duda, no incluyas nada. Es preferible perder un hito que proponer uno equivocado.
- confidence: 0 a 1, qué tan seguro estás de que el texto dice que ese hito se alcanzó.

Respondé sólo JSON:
{"matches":[{"candidateId":"...","checkpointId":"...","confidence":0.0,"rationale":"una frase corta en español"}]}
Si ninguno aplica: {"matches":[]}`;

/** El catálogo, que es nuestro. */
export function formatCheckpointCatalog(catalog: readonly CheckpointOption[]): string {
  return catalog
    .map((option) => {
      const detalle = option.description?.trim();
      return `- id: ${option.id} | fase: ${option.stageName} | hito: ${option.name}${
        detalle ? ` | detalle: ${detalle}` : ""
      }`;
    })
    .join("\n");
}

/**
 * Los textos, que **los escribió otra persona**.
 *
 * Se formatea aparte del catálogo justo por eso: quien llama envuelve este
 * bloque como contenido no confiable y deja el catálogo afuera del sobre.
 */
export function formatMatchCandidates(candidates: readonly MatchCandidate[]): string {
  return candidates
    .map((candidate) => {
      const contexto = candidate.context?.trim();
      return `- candidateId: ${candidate.id}${contexto ? ` (${contexto})` : ""}\n  texto: ${candidate.text.trim()}`;
    })
    .join("\n");
}

export function buildCheckpointMatchPrompt(
  catalog: readonly CheckpointOption[],
  candidates: readonly MatchCandidate[],
  /** Envoltorio para el bloque de textos. Por defecto, ninguno. */
  wrapCandidates: (block: string) => string = (block) => block
): string {
  return [
    "HITOS DEL RECORRIDO:",
    formatCheckpointCatalog(catalog),
    "",
    "TEXTOS A EVALUAR:",
    wrapCandidates(formatMatchCandidates(candidates)),
  ].join("\n");
}

/**
 * Filtra lo que devolvió el modelo contra lo que efectivamente le pasamos.
 *
 * Todo lo que no se puede verificar se descarta en silencio: el resultado son
 * las propuestas que sobrevivieron, no un informe de lo que falló.
 */
export function parseCheckpointMatches(
  response: unknown,
  options: {
    catalog: readonly CheckpointOption[];
    candidates: readonly MatchCandidate[];
    minConfidence?: number;
  }
): CheckpointMatch[] {
  const minConfidence = options.minConfidence ?? MIN_MATCH_CONFIDENCE;
  const validCheckpoints = new Set(options.catalog.map((option) => option.id));
  const validCandidates = new Set(options.candidates.map((candidate) => candidate.id));

  const raw =
    typeof response === "object" && response !== null
      ? (response as { matches?: unknown }).matches
      : null;
  if (!Array.isArray(raw)) return [];

  /** Un texto propone un solo hito: se queda el de mayor confianza. */
  const best = new Map<string, CheckpointMatch>();

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const row = entry as Record<string, unknown>;

    const candidateId = typeof row.candidateId === "string" ? row.candidateId : null;
    const checkpointId = typeof row.checkpointId === "string" ? row.checkpointId : null;
    if (!candidateId || !checkpointId) continue;

    // Reglas 1 y 2: sólo lo que le pasamos nosotros.
    if (!validCandidates.has(candidateId)) continue;
    if (!validCheckpoints.has(checkpointId)) continue;

    // Una confianza que no es un número no es alta: no pasa.
    const confidence = typeof row.confidence === "number" ? row.confidence : Number.NaN;
    if (!Number.isFinite(confidence) || confidence < minConfidence) continue;

    const rationale =
      typeof row.rationale === "string" && row.rationale.trim()
        ? row.rationale.trim().slice(0, 500)
        : null;

    const previous = best.get(candidateId);
    if (!previous || confidence > previous.confidence) {
      best.set(candidateId, {
        candidateId,
        checkpointId,
        confidence: Math.min(confidence, 1),
        rationale,
      });
    }
  }

  return [...best.values()];
}

/**
 * Aplana el catálogo del recorrido a la lista que ve el modelo.
 *
 * Un recorrido sin hitos devuelve una lista vacía, y con lista vacía **no se
 * pregunta nada**: no hay contra qué comparar.
 */
export function toCheckpointOptions(
  stages: readonly {
    name: string;
    checkpoints: readonly { id: string; name: string; description?: string | null }[];
  }[]
): CheckpointOption[] {
  return stages.flatMap((stage) =>
    stage.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      name: checkpoint.name,
      stageName: stage.name,
      description: checkpoint.description ?? null,
    }))
  );
}
