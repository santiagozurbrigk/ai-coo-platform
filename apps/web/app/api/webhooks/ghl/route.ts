import { NextResponse } from "next/server";
import {
  ingestGHLOpportunityEvent,
  resolveOrganizationByLocation,
} from "@/lib/ghl/ingest-opportunity-event";
import { getGHLWebhookSecret } from "@/lib/ghl/integration";
import { extractGHLEventType } from "@/lib/ghl/opportunity-event";
import { verifyGHLWebhook } from "@/lib/ghl/verify-webhook";

export const runtime = "nodejs";

/**
 * Webhook de oportunidades de GoHighLevel — I-4 del plan de integraciones.
 *
 * Es la única fuente posible de M21, M22, M23 y M25: la API v3 no expone
 * historial de cambios de etapa, así que el historial lo construye OTC con
 * estos eventos (ver docs/external-apis/gohighlevel/RESUMEN-OTC.md §4).
 *
 * ⭐ DOS VÍAS DE ENTREGA
 *
 * 1. **App del Marketplace** — GHL firma con Ed25519 (`X-GHL-Signature`) y
 *    manda el `locationId` en el payload, con el que se resuelve la org. No
 *    necesita nada en la URL:
 *      https://<app>/api/webhooks/ghl
 *    Requiere que OTC tenga app aprobada; hoy no la tiene.
 *
 * 2. **Workflow de la sub-cuenta** — el cliente agrega una acción "Webhook" en
 *    un Workflow de GHL apuntando a OTC. No hay firma de plataforma, así que se
 *    autentica con un secreto por organización:
 *      https://<app>/api/webhooks/ghl?organizationId=<uuid>&secret=<secreto>
 *    Es la vía que funciona hoy, sin depender de la aprobación del Marketplace.
 *
 * El `organizationId` de la URL NO autentica nada: sólo dice contra qué secreto
 * verificar. Lo que autoriza es la firma o el secreto.
 *
 * ⚠️ El payload de la vía 2 lo arma quien configura el workflow y NO está
 * documentado. El normalizador busca los campos en varias capas y persiste el
 * evento crudo antes de interpretarlo — ver docs/API_DOCS_PENDIENTES.md.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const rawBody = await request.text();

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  // La org sale de la URL (vía workflow) o del locationId del payload (vía
  // plataforma, donde la URL es una sola para todas las sub-cuentas).
  const locationId = typeof body.locationId === "string" ? body.locationId : null;
  const organizationId =
    url.searchParams.get("organizationId") ??
    (locationId ? await resolveOrganizationByLocation(locationId) : null);

  if (!organizationId) {
    return NextResponse.json(
      { ok: false, error: "No se pudo resolver la organización del evento" },
      { status: 404 }
    );
  }

  const sharedSecret = await getGHLWebhookSecret(organizationId);
  const providedSecret =
    url.searchParams.get("secret") ?? request.headers.get("x-otc-webhook-secret");

  const check = verifyGHLWebhook(
    rawBody,
    {
      ghl: request.headers.get("x-ghl-signature"),
      legacy: request.headers.get("x-wh-signature"),
    },
    sharedSecret,
    providedSecret
  );

  if (!check.ok) {
    console.warn("[ghl-webhook] rechazado:", check.reason);
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  // GHL manda muchos tipos de evento por el mismo endpoint. Los que no son de
  // oportunidad se descartan sin guardar: no aportan al embudo y traen datos
  // personales que no hace falta almacenar.
  const eventType = extractGHLEventType(body) ?? "";
  if (!eventType.startsWith("Opportunity")) {
    return NextResponse.json({ ok: true, ignored: eventType || "sin tipo" });
  }

  const result = await ingestGHLOpportunityEvent(organizationId, body, check.authPath);

  // Siempre 200 en un evento autorizado, incluso si no se supo interpretar: ya
  // quedó guardado y reintentarlo no cambiaría el resultado.
  return NextResponse.json({ ok: true, ...result });
}
