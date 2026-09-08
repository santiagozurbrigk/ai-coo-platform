/**
 * Derivación de la clave interna de un campo o de una opción.
 *
 * ⭐ La clave es lo único que queda escrito en cada dato cargado. Por eso se
 * genera una sola vez —al crear— y no se toca más: renombrar "Facturación" a
 * "Ingresos" cambia la etiqueta y **ningún dato**.
 *
 * Lógica pura: no toca base ni red.
 */

/** Reservadas porque romperían la lectura del jsonb o chocarían con columnas propias. */
const RESERVED_KEYS = new Set(["id", "key", "value", "custom", "metrics"]);

const MAX_KEY_LENGTH = 60;

/**
 * "Facturación al mes 3" → "facturacion_al_mes_3".
 *
 * Saca acentos, baja a minúsculas y colapsa cualquier separador en un guion
 * bajo. Devuelve `""` cuando la etiqueta no deja ni un carácter usable (por
 * ejemplo, sólo emojis): el llamador decide qué hacer con eso, acá no se
 * inventa una clave.
 */
export function deriveFieldKey(label: string): string {
  const normalized = label
    .normalize("NFD")
    // Marcas diacríticas: "ó" ya separada en "o" + tilde combinante.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, MAX_KEY_LENGTH)
    .replace(/_+$/g, "");

  // Una clave que arranca con dígito es válida en jsonb, pero incómoda de leer
  // y de usar como identificador en el resto del código.
  return /^[0-9]/.test(normalized) ? `campo_${normalized}` : normalized;
}

export function isReservedFieldKey(key: string): boolean {
  return RESERVED_KEYS.has(key);
}

/**
 * ¿Sirve esta clave? Se valida la clave ya derivada, no la etiqueta: es la que
 * termina en la base.
 */
export function isValidFieldKey(key: string): boolean {
  if (!key) return false;
  if (key.length > MAX_KEY_LENGTH) return false;
  if (isReservedFieldKey(key)) return false;
  return /^[a-z][a-z0-9_]*$/.test(key);
}

/**
 * Deriva la clave y explica el problema cuando no se puede.
 *
 * Devolver el motivo —y no un `null` mudo— es lo que permite que la pantalla
 * diga "esa etiqueta ya existe" en vez de "error".
 */
export function deriveFieldKeyOrError(
  label: string,
  existingKeys: readonly string[] = []
): { ok: true; key: string } | { ok: false; error: string } {
  const key = deriveFieldKey(label.trim());

  if (!key) {
    return {
      ok: false,
      error: "El nombre necesita al menos una letra o un número.",
    };
  }
  if (!isValidFieldKey(key)) {
    return { ok: false, error: `"${label}" no se puede usar como nombre de columna.` };
  }
  if (existingKeys.includes(key)) {
    return { ok: false, error: `Ya existe una columna que se llama "${label}".` };
  }

  return { ok: true, key };
}
