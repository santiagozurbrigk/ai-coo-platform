/**
 * URI de retorno del OAuth de Discord.
 *
 * ⚠️ Tiene que ser **exactamente** la misma en los dos lados del flujo: la que
 * se manda al pedir la autorización y la que se manda al canjear el código.
 * Discord compara carácter por carácter y, si difieren, el canje falla con
 * `invalid_grant` — la conexión se corta a la vuelta, sin decir por qué.
 *
 * Antes cada ruta la armaba por su cuenta: el inicio la derivaba del host del
 * request y el callback usaba `DISCORD_REDIRECT_URI` si estaba. Con la variable
 * seteada a un host distinto del que abrió el navegador —`optimizatucontrol.com`
 * contra `www.optimizatucontrol.com`, por ejemplo— las dos no coincidían.
 *
 * Derivar del host tampoco alcanza solo: la app responde en el dominio con y sin
 * `www`, y cada deploy de preview tiene el suyo. Cada variante sería otra URI que
 * registrar en el portal de Discord. Con `DISCORD_REDIRECT_URI` hay una sola.
 */
export function discordRedirectUri(origin: string): string {
  return (
    process.env.DISCORD_REDIRECT_URI?.trim() ||
    `${origin}/api/integrations/discord/callback`
  );
}
