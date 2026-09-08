/**
 * D · S3 — Las capturas dentro del contenido del SOP.
 *
 * ⭐ La decisión que sostiene todo esto: **se guarda el marcador, no la URL.**
 *
 * El bucket de adjuntos es privado, así que las imágenes se ven por signed URL,
 * y esas URLs **vencen**. Si el markdown guardara la URL, el SOP se vería bien
 * hoy y aparecería roto la semana que viene. Guardando
 * `sop-attachment:<id>`, el visor resuelve la URL **en el momento de mostrar** y
 * el documento no envejece.
 *
 * Lógica pura: no toca base ni storage.
 */

/** `![alt](sop-attachment:<id>)` — el id es lo que se captura. */
const MARKER_PATTERN = /!\[([^\]]*)\]\(sop-attachment:([^)\s]+)\)/g;

export const ATTACHMENT_MARKER_PREFIX = "sop-attachment:";

/** Los ids que el markdown referencia, sin repetir y en orden de aparición. */
export function extractAttachmentIds(markdown: string): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const match of markdown.matchAll(MARKER_PATTERN)) {
    const id = match[2]?.trim();
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}

export type MarkerValidation = {
  /** El markdown con los marcadores inválidos ya removidos. */
  markdown: string;
  /** Ids que el modelo inventó y se borraron. Se registran, no se ocultan. */
  removedIds: string[];
  /** Ids válidos que quedaron en el documento. */
  usedIds: string[];
};

/**
 * Saca del markdown cualquier marcador que apunte a una captura que no existe.
 *
 * ⭐ El prompt le prohíbe al modelo inventar ids, pero **prohibir no es
 * garantizar**. Sin esta validación, un id inventado quedaría como una imagen
 * rota en el SOP para siempre. Se borra el marcador entero —no se deja el texto
 * alternativo suelto— y se devuelve qué se quitó, para poder registrarlo.
 */
export function validateAttachmentMarkers(
  markdown: string,
  validIds: readonly string[]
): MarkerValidation {
  const valid = new Set(validIds);
  const removed = new Set<string>();
  const used = new Set<string>();

  const cleaned = markdown.replace(MARKER_PATTERN, (fullMatch, _alt, rawId) => {
    const id = String(rawId).trim();
    if (valid.has(id)) {
      used.add(id);
      return fullMatch;
    }
    removed.add(id);
    return "";
  });

  return {
    // Borrar un marcador puede dejar una línea vacía en el medio: se colapsa
    // para que el documento no quede con huecos raros.
    markdown: cleaned.replace(/\n{3,}/g, "\n\n").trim(),
    removedIds: [...removed],
    usedIds: [...used],
  };
}

/**
 * Reemplaza los marcadores por las URLs firmadas, para mostrar.
 *
 * ⚠️ El resultado es **para mostrar, no para guardar**: contiene URLs que vencen.
 * Guardar esto de vuelta en la base es exactamente el bug que el marcador evita.
 */
export function resolveAttachmentMarkers(
  markdown: string,
  urlsById: Readonly<Record<string, string>>
): string {
  return markdown.replace(MARKER_PATTERN, (fullMatch, alt, rawId) => {
    const url = urlsById[String(rawId).trim()];
    // Sin URL se deja el marcador tal cual: es feo, pero es la verdad. Poner una
    // imagen rota o borrarla al mostrar escondería que la captura se perdió.
    return url ? `![${alt}](${url})` : fullMatch;
  });
}
