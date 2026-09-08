/**
 * D · Cómo se parte un audio largo para transcribirlo.
 *
 * ⭐ El problema: Whisper corta en **25 MB por request**. Un Loom de 20 minutos
 * en mp4 pesa cientos de MB, pero el **audio** extraído a mp3 mono 16 kHz pesa
 * ~1 MB por minuto: unos 60 minutos entran en un solo request. Sólo cuando el
 * audio pasa ese largo hay que partirlo.
 *
 * ⭐ Los cortes llevan **solape**: si se corta seco en el segundo 3600, la
 * palabra que estaba diciéndose se pierde en los dos pedazos. Con unos segundos
 * de solape la palabra aparece entera en al menos uno — y después se quita la
 * repetición al unir (`joinTranscriptChunks`).
 *
 * Lógica pura: no toca ffmpeg, ni la red, ni el disco.
 */

/** Límite duro de Whisper. */
export const WHISPER_MAX_BYTES = 25 * 1024 * 1024;

/**
 * Peso estimado del audio que produce ffmpeg: mp3 mono a 16 kHz ≈ 32 kbps.
 * Se usa un valor conservador a propósito: subestimar el peso haría cortes
 * demasiado largos, y el error recién aparecería contra la API.
 */
export const ESTIMATED_BYTES_PER_SECOND = 4400;

/** Segundos de solape entre pedazos. Suficiente para no partir una frase. */
export const DEFAULT_OVERLAP_SECONDS = 5;

export type AudioChunk = {
  index: number;
  /** Desde qué segundo del audio original arranca este pedazo. */
  startSeconds: number;
  /** Cuánto dura. */
  durationSeconds: number;
};

export type ChunkOptions = {
  bytesPerSecond?: number;
  maxBytes?: number;
  overlapSeconds?: number;
};

/**
 * Parte un audio de `durationSeconds` en pedazos que entren en el límite.
 *
 * Devuelve **un solo pedazo sin solape** cuando todo entra en un request, que es
 * el caso normal: partir sin necesidad costaría llamadas de más y uniones que
 * pueden salir mal.
 */
export function computeAudioChunks(
  durationSeconds: number,
  options: ChunkOptions = {}
): AudioChunk[] {
  const bytesPerSecond = options.bytesPerSecond ?? ESTIMATED_BYTES_PER_SECOND;
  const maxBytes = options.maxBytes ?? WHISPER_MAX_BYTES;
  const overlap = Math.max(0, options.overlapSeconds ?? DEFAULT_OVERLAP_SECONDS);

  // Un audio sin duración conocida no se puede partir: que el llamador lo trate
  // como un solo pedazo y falle contra la API si no entra, en vez de inventar
  // cortes sobre un número que no existe.
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return [];
  if (bytesPerSecond <= 0 || maxBytes <= 0) return [];

  const maxChunkSeconds = Math.floor(maxBytes / bytesPerSecond);
  if (maxChunkSeconds <= 0) return [];

  if (durationSeconds <= maxChunkSeconds) {
    return [{ index: 0, startSeconds: 0, durationSeconds }];
  }

  // El solape no puede comerse el pedazo entero: si lo hiciera, cada corte
  // avanzaría cero segundos y el bucle no terminaría nunca.
  const safeOverlap = Math.min(overlap, Math.floor(maxChunkSeconds / 2));
  const step = maxChunkSeconds - safeOverlap;

  const chunks: AudioChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < durationSeconds) {
    const remaining = durationSeconds - start;
    const length = Math.min(maxChunkSeconds, remaining);
    chunks.push({ index, startSeconds: start, durationSeconds: length });

    if (start + length >= durationSeconds) break;
    start += step;
    index += 1;
  }

  return chunks;
}

/**
 * Une las transcripciones de los pedazos quitando la repetición del solape.
 *
 * ⭐ Sin esto, cada corte deja unas palabras repetidas en la transcripción final,
 * y esas repeticiones después terminan como pasos duplicados en el SOP.
 *
 * La búsqueda es por texto y no por tiempo porque Whisper no devuelve los dos
 * pedazos alineados al milisegundo: se busca el final del anterior dentro del
 * principio del siguiente.
 */
export function joinTranscriptChunks(
  parts: readonly string[],
  maxOverlapWords = 40
): string {
  const clean = parts.map((part) => part.trim()).filter(Boolean);
  if (clean.length === 0) return "";

  let joined = clean[0]!;

  for (let i = 1; i < clean.length; i += 1) {
    const next = clean[i]!;
    const overlapLength = findOverlap(joined, next, maxOverlapWords);
    joined =
      overlapLength > 0
        ? `${joined} ${next.slice(overlapLength).trim()}`.trim()
        : `${joined} ${next}`;
  }

  return joined.trim();
}

/**
 * Cuántos caracteres del principio de `next` repiten el final de `previous`.
 *
 * Compara normalizado (sin mayúsculas ni puntuación) porque Whisper puntúa
 * distinto los dos pedazos, pero devuelve el largo en el texto original para
 * poder cortarlo sin desalinearse.
 */
function findOverlap(previous: string, next: string, maxWords: number): number {
  const nextWords = next.split(/\s+/);
  const limit = Math.min(maxWords, nextWords.length);

  // Se prueba desde el solape más largo al más corto: preferimos sacar de más
  // antes que dejar una repetición a medias.
  for (let count = limit; count >= 3; count -= 1) {
    const candidate = nextWords.slice(0, count).join(" ");
    if (normalize(previous).endsWith(normalize(candidate))) {
      return candidate.length;
    }
  }
  return 0;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cuánto costó transcribir, en dólares. Whisper cobra por minuto, no por token. */
export const WHISPER_USD_PER_MINUTE = 0.006;

export function estimateTranscriptionCostUsd(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return (seconds / 60) * WHISPER_USD_PER_MINUTE;
}
