interface MonitoredChannel {
  channel_name?: string;
  purpose?: string;
}

interface DiscordIntegration {
  monitored_channels?: MonitoredChannel[];
}

/**
 * ⭐ Pre-filtro barato de testimonios. **No decide**: marca candidatos.
 *
 * El bug que esto arregla: antes, **todo** mensaje en un canal llamado `#wins`
 * quedaba marcado como testimonio sin mirar el contenido. En un servidor con ese
 * canal, cada "felicitaciones 🎉" entraba como testimonio, y con el tracker de
 * Wins conectado eso es ruido directo al módulo.
 *
 * Ahora el nombre del canal es **una señal más**, no la respuesta: sube la
 * sospecha, pero el mensaje igual tiene que parecer un testimonio.
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

/** Nombres de canal donde un testimonio es más probable. Sube la sospecha, no decide. */
const TESTIMONIAL_CHANNEL_PATTERNS = [
  "testimonio", "testimonial", "win", "wins", "caso", "exito", "éxito",
  "logro", "resultado", "achievement",
];

/**
 * Un mensaje muy corto no es un testimonio aunque tenga la palabra justa:
 * "gracias!" y "un logro 🎉" son felicitaciones, no casos de éxito.
 */
const MIN_LENGTH = 40;

export function isTestimonial(
  content: string,
  channelName: string,
  integration: DiscordIntegration
): boolean {
  const text = content.trim();
  if (text.length < MIN_LENGTH) return false;

  const contentLower = text.toLowerCase();
  const channelLower = channelName.toLowerCase();

  const matches = TESTIMONIAL_KEYWORDS.filter((kw) =>
    contentLower.includes(kw)
  ).length;

  // Un canal declarado como de testimonios en la configuración, o cuyo nombre lo
  // sugiere, baja el listón a una sola coincidencia — pero **nunca a cero**.
  const monitoredChannels = integration.monitored_channels || [];
  const declaredForTestimonials = monitoredChannels.some(
    (c) => c.channel_name === channelName && c.purpose === "testimonials"
  );
  const channelSuggests =
    declaredForTestimonials ||
    TESTIMONIAL_CHANNEL_PATTERNS.some((p) => channelLower.includes(p));

  return channelSuggests ? matches >= 1 : matches >= 2;
}
