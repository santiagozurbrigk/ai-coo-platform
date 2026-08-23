/**
 * Sentry — configuración del cliente (browser).
 * Se carga automáticamente por @sentry/nextjs si NEXT_PUBLIC_SENTRY_DSN está seteado.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Solo capturar errores en producción a menos que se fuerce con SENTRY_FORCE.
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.SENTRY_FORCE === "true",

  // Tasa de muestreo de errores: 100% para el beta.
  sampleRate: 1.0,

  // Tasa de muestreo de trazas de performance: 10% para no inflar la cuota.
  tracesSampleRate: 0.1,

  // Ocultar datos personales del usuario en los eventos.
  beforeSend(event) {
    // Eliminar cookies de autenticación antes de enviar.
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },

  integrations: [
    Sentry.breadcrumbsIntegration({ console: false }),
  ],
});
