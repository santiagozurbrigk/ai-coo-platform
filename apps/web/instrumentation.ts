/**
 * Arranque de Sentry en el servidor.
 *
 * Con @sentry/nextjs 8+ los `sentry.server.config.ts` / `sentry.edge.config.ts`
 * no se cargan solos: los importa este `register()`. Sin este archivo,
 * `Sentry.captureException` en route handlers y server actions no hacía nada y
 * los errores del backend sólo quedaban en los logs de Vercel.
 */
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Errores no capturados de Server Components, route handlers y middleware.
export const onRequestError = Sentry.captureRequestError;
