/**
 * ⭐ Pre-filtro barato de testimonios. **No decide**: marca candidatos.
 *
 * El bug original: **todo** mensaje en un canal llamado `#wins` quedaba marcado
 * como testimonio sin mirar el contenido, así que cada "felicitaciones 🎉"
 * entraba como testimonio al módulo de Wins.
 *
 * ⭐ Qué cambió el 2026-09-17. Antes esta función también decidía **dónde**
 * buscar, mirando si el nombre del canal contenía alguna palabra de una lista
 * ("win", "testimonio", "logro"…). Eso era una regla invisible: la pantalla no
 * podía mostrarla y el usuario no podía corregirla — un canal de logros con otro
 * nombre no se detectaba, y `#chat-general` nunca podría serlo aunque quisiera.
 *
 * Ahora el "dónde" es un tilde por canal que el usuario elige, y el que llama
 * sólo invoca esta función en los canales tildados. Acá queda una única
 * pregunta: **este texto, ¿parece un logro?**
 *
 * La clasificación de verdad la hace la app por lote con IA
 * (`lib/discord/classify-messages.ts`), que lee el contenido y produce un
 * candidato que alguien acepta. Acá sólo se abarata ese lote: un mensaje que ni
 * siquiera pasa este filtro no vale el costo de mandarlo a clasificar.
 */

const TESTIMONIAL_KEYWORDS = [
  "gracias", "logré", "conseguí", "resultados", "increíble", "recomiendo",
  "funciona", "cambió", "transformó", "mejoró", "escalé", "facturé", "cerré",
  "win", "victoria", "logro", "achievement", "resultado", "éxito", "vendí",
  "gané", "primer cliente", "primera venta",
];

/**
 * Un mensaje muy corto no es un testimonio aunque tenga la palabra justa:
 * "gracias!" y "un logro 🎉" son felicitaciones, no casos de éxito.
 */
const MIN_LENGTH = 40;

/**
 * Si el texto parece un logro.
 *
 * Alcanza **una** palabra de la lista porque el canal ya está declarado como de
 * logros: la señal del canal la puso una persona a propósito, que es mucho más
 * confiable que adivinarla del nombre. El largo mínimo es lo que separa el caso
 * de éxito de la felicitación.
 */
export function isTestimonial(content: string): boolean {
  const text = content.trim();
  if (text.length < MIN_LENGTH) return false;

  const contentLower = text.toLowerCase();
  return TESTIMONIAL_KEYWORDS.some((kw) => contentLower.includes(kw));
}
