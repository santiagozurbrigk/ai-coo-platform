import { NextResponse } from "next/server";

/**
 * Ruta legacy: ya no ejecuta sync (evita colisión Next.js Server Action ↔ API route).
 * Cron → POST /api/cron/calendly-sync con CRON_SECRET.
 * UI manual → pullCalendlyScheduledEventsAction.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "deprecated",
      message:
        "Usa pullCalendlyScheduledEventsAction (UI) o POST /api/cron/calendly-sync (cron).",
    },
    { status: 410 }
  );
}
