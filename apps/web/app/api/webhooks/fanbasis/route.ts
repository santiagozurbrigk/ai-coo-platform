import { NextResponse } from "next/server";
import { getWebhookSecret } from "@/lib/payments/integration";
import { ingestPaymentWebhook } from "@/lib/payments/ingest";
import { verifyHmacWebhook } from "@/lib/payments/verify-signature";

export const runtime = "nodejs";

/**
 * Webhook de Fanbasis — I-2 del plan de integraciones.
 *
 * El otro proveedor que el documento asigna a la etapa Cash (§05).
 *
 * URL a registrar en Fanbasis:
 *   https://<app>/api/webhooks/fanbasis?organizationId=<uuid>
 *
 * ⚠️ El esquema de firma NO está verificado contra la documentación de Fanbasis,
 * que no es alcanzable desde el entorno de desarrollo. Se asume HMAC-SHA256 sobre
 * el cuerpo crudo, que es lo más habitual. Al conectar la primera cuenta real,
 * confirmar el nombre de la cabecera y el formato de la firma.
 */
const SIGNATURE_HEADERS = [
  "x-fanbasis-signature",
  "x-signature",
  "x-webhook-signature",
  "signature",
];

export async function POST(request: Request) {
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json(
      { ok: false, error: "Falta organizationId" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  const secret = await getWebhookSecret(organizationId, "fanbasis");
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "La organización no tiene Fanbasis conectado" },
      { status: 404 }
    );
  }

  const signature = SIGNATURE_HEADERS.map((h) => request.headers.get(h)).find(Boolean) ?? null;

  const check = verifyHmacWebhook(rawBody, signature, secret);
  if (!check.ok) {
    console.warn("[fanbasis] firma rechazada:", check.reason);
    return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const result = await ingestPaymentWebhook("fanbasis", organizationId, body);
  return NextResponse.json({ ok: true, ...result });
}
