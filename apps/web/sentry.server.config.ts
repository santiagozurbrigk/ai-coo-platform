/**
 * Sentry — configuración del servidor (Node.js runtime).
 * Cubre Route Handlers, Server Actions, y API routes.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.SENTRY_FORCE === "true",

  // 100% de errores, 5% de trazas (las lambdas son muchas).
  sampleRate: 1.0,
  tracesSampleRate: 0.05,

  // Contexto extra para filtrar por módulo en el dashboard de Sentry.
  initialScope: {
    tags: {
      runtime: "server",
      app: "ai-coo-web",
    },
  },

  beforeSend(event) {
    // No enviar errores de rate limit conocidos (ruido).
    const msg = event.exception?.values?.[0]?.value ?? "";
    if (msg.includes("Rate limit exceeded")) return null;
    // Filtrar cookies de auth.
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
