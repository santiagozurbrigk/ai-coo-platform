/**
 * Lectura del título de una reunión de Fathom.
 *
 * ⭐ **Por posición, no por contenido.** El clasificador anterior buscaba 60
 * keywords en *cualquier parte* del título, así que `"Weekly de ventas"` (una
 * reunión de equipo) caía en venta por contener `venta`, y `"Reunión con Juan"`
 * (una venta) caía en equipo por contener `reunion`. Acá el tipo se busca sólo a
 * la **izquierda** del separador y la identidad sólo a la **derecha**:
 *
 *     Llamada de venta - Mariano Gonzales
 *     └──── tipo ────┘   └──── quién ────┘
 *
 * Un título sin separador —o con un tipo que no reconocemos— devuelve `null`.
 * **Sin convención no hay adivinanza:** la llamada queda sin clasificar por esta
 * vía y se resuelve con las otras señales, o va a la cola de pendientes.
 *
 * ⭐ **Es un respaldo, no el mecanismo principal.** Depende de que una persona
 * escriba bien después de cada llamada, y el 86% de los títulos reales son
 * `"Impromptu Google Meet Meeting"`. Las señales fuertes son los invitados y el
 * cruce con la agenda; esto cubre las improvisadas que alguien sí renombra.
 */

export type CallPurpose = "sales" | "delivery" | "team";

export type ParsedCallTitle = {
  purpose: CallPurpose;
  /** Texto a la derecha del separador, limpio. `null` si no quedó nada. */
  counterpartyName: string | null;
};

/** Separadores aceptados entre el tipo y el nombre. */
const SEPARATORS = ["—", "–", "-", ":", "|", "»", ">"];

/**
 * Sinónimos por propósito.
 *
 * Se comparan contra el lado izquierdo **completo y normalizado**, no como
 * subcadena: `"weekly de ventas"` no es ninguna de estas frases, así que no
 * matchea — que es justamente la corrección respecto del clasificador viejo.
 */
const PURPOSE_SYNONYMS: Record<CallPurpose, string[]> = {
  sales: [
    "venta",
    "ventas",
    "llamada de venta",
    "llamada de ventas",
    "llamada de cierre",
    "call de venta",
    "call de ventas",
    "call de cierre",
    "cierre",
    "closing",
    "closing call",
    "sales",
    "sales call",
    "discovery",
    "discovery call",
    "demo",
    "reunion de venta",
    "consultoria inicial",
  ],
  delivery: [
    "entrega",
    "delivery",
    "sesion",
    "sesion de entrega",
    "sesion de coaching",
    "sesion de mentoria",
    "mentoria",
    "coaching",
    "consultoria",
    "consulting",
    "onboarding",
    "seguimiento",
    "soporte",
    "acompanamiento",
  ],
  team: [
    "equipo",
    "team",
    "reunion de equipo",
    "call de equipo",
    "team meeting",
    "interna",
    "reunion interna",
    "daily",
    "standup",
    "sync",
    "sync de equipo",
    "weekly de equipo",
  ],
};

/** Palabras que preceden al nombre y no forman parte de él. */
const NAME_PREFIXES = ["lead", "cliente", "client", "con", "c/", "para"];

export function normalizeTitlePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const PURPOSE_BY_PHRASE: Map<string, CallPurpose> = (() => {
  const map = new Map<string, CallPurpose>();
  for (const [purpose, phrases] of Object.entries(PURPOSE_SYNONYMS)) {
    for (const phrase of phrases) {
      // Una frase asignada a dos propósitos sería ambigua por definición; gana
      // la primera y el test de conflictos lo vigila.
      if (!map.has(phrase)) map.set(phrase, purpose as CallPurpose);
    }
  }
  return map;
})();

/** Encuentra el primer separador que tenga texto a ambos lados. */
function splitOnSeparator(title: string): [string, string] | null {
  for (let i = 1; i < title.length - 1; i++) {
    if (!SEPARATORS.includes(title[i]!)) continue;
    const left = title.slice(0, i).trim();
    const right = title.slice(i + 1).trim();
    if (left && right) return [left, right];
  }
  return null;
}

function cleanCounterpartyName(raw: string): string | null {
  let name = raw.trim();

  // Quitar prefijos tipo "lead", "cliente", "con".
  for (const prefix of NAME_PREFIXES) {
    const normalized = normalizeTitlePart(name);
    if (normalized.startsWith(`${prefix} `)) {
      name = name.slice(prefix.length).trim();
    }
  }

  // Emojis y adornos al principio o al final: los nombres reales de la base
  // vienen así ("🩷 Diana Villarreal").
  name = name.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[^\p{L}\p{N}.]+$/u, "").trim();

  return name.length >= 2 ? name : null;
}

export function parseCallTitle(title: string | null | undefined): ParsedCallTitle | null {
  if (typeof title !== "string" || !title.trim()) return null;

  const parts = splitOnSeparator(title.trim());
  if (!parts) return null;

  const [left, right] = parts;
  const purpose = PURPOSE_BY_PHRASE.get(normalizeTitlePart(left));
  if (!purpose) return null;

  return { purpose, counterpartyName: cleanCounterpartyName(right) };
}
