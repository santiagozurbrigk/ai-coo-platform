interface MonitoredChannel {
  channel_name?: string;
  purpose?: string;
}

interface DiscordIntegration {
  monitored_channels?: MonitoredChannel[];
}

const TESTIMONIAL_KEYWORDS = [
  "gracias",
  "logré",
  "conseguí",
  "resultados",
  "increíble",
  "recomiendo",
  "funciona",
  "cambió",
  "transformó",
  "mejoró",
  "escalé",
  "facturé",
  "cerré",
  "win",
  "victoria",
  "logro",
  "achievement",
  "resultado",
  "éxito",
  "vendí",
  "gané",
];

const TESTIMONIAL_CHANNEL_PATTERNS = [
  "testimonio",
  "testimonial",
  "win",
  "wins",
  "caso",
  "exito",
  "éxito",
  "logro",
  "resultado",
  "achievement",
];

export function isTestimonial(
  content: string,
  channelName: string,
  integration: DiscordIntegration
): boolean {
  const contentLower = content.toLowerCase();
  const channelLower = channelName.toLowerCase();

  if (TESTIMONIAL_CHANNEL_PATTERNS.some((p) => channelLower.includes(p))) {
    return true;
  }

  const monitoredChannels = integration.monitored_channels || [];
  const channelConfig = monitoredChannels.find(
    (c) => c.channel_name === channelName
  );
  if (channelConfig?.purpose === "testimonials") return true;

  const matches = TESTIMONIAL_KEYWORDS.filter((kw) =>
    contentLower.includes(kw)
  );
  return matches.length >= 2;
}
