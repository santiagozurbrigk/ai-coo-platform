/**
 * lib/payments/verify-signature.ts
 *
 * Verificación de firma de los webhooks de pagos.
 *
 * Whop declara usar la especificación [Standard Webhooks](https://www.standardwebhooks.com/),
 * que es pública y está implementada acá. Fanbasis no documenta públicamente su
 * esquema, así que usa el HMAC-SHA256 simple sobre el cuerpo crudo, que es el
 * más habitual — **queda por verificar contra un webhook real**.
 *
 * Un webhook sin firma válida se rechaza. Estos endpoints reciben eventos de
 * dinero desde internet abierta: aceptar sin verificar dejaría a cualquiera
 * inyectar cobros falsos en las métricas de una org.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** Comparación en tiempo constante, tolerante a longitudes distintas. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Tolerancia de reloj para el timestamp del webhook. */
export const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

export type SignatureCheck = { ok: true } | { ok: false; reason: string };

/**
 * Standard Webhooks (Whop).
 *
 * Firma: HMAC-SHA256 de `{id}.{timestamp}.{payload}` en base64, con el secreto
 * decodificado desde base64 si viene con el prefijo `whsec_`. La cabecera puede
 * traer varias firmas separadas por espacio, cada una como `v1,<firma>`.
 */
export function verifyStandardWebhook(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): SignatureCheck {
  if (!headers.id || !headers.timestamp || !headers.signature) {
    return { ok: false, reason: "Faltan cabeceras de firma" };
  }

  const timestamp = Number(headers.timestamp);
  if (!Number.isFinite(timestamp)) {
    return { ok: false, reason: "Timestamp inválido" };
  }

  // Rechaza reenvíos viejos: sin esto, un evento capturado se puede reinyectar
  // indefinidamente.
  if (Math.abs(nowSeconds - timestamp) > WEBHOOK_TOLERANCE_SECONDS) {
    return { ok: false, reason: "Timestamp fuera de la ventana de tolerancia" };
  }

  const key = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice("whsec_".length), "base64")
    : Buffer.from(secret);

  const expected = createHmac("sha256", key)
    .update(`${headers.id}.${headers.timestamp}.${rawBody}`)
    .digest("base64");

  const provided = headers.signature
    .split(" ")
    .map((part) => (part.includes(",") ? part.slice(part.indexOf(",") + 1) : part))
    .filter(Boolean);

  const match = provided.some((candidate) => safeEqual(candidate, expected));
  return match ? { ok: true } : { ok: false, reason: "Firma que no coincide" };
}

/**
 * HMAC-SHA256 simple sobre el cuerpo crudo (Fanbasis).
 *
 * ⚠️ Sin verificar contra la documentación del proveedor. Acepta la firma en
 * hex o base64, con o sin prefijo `sha256=`.
 */
export function verifyHmacWebhook(
  rawBody: string,
  signature: string | null,
  secret: string
): SignatureCheck {
  if (!signature) return { ok: false, reason: "Falta la cabecera de firma" };

  const provided = signature.replace(/^sha256=/i, "").trim();

  // Dos instancias: un Hmac no se puede reutilizar después de digest().
  const asHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const asBase64 = createHmac("sha256", secret).update(rawBody).digest("base64");

  const match = safeEqual(provided, asHex) || safeEqual(provided, asBase64);
  return match ? { ok: true } : { ok: false, reason: "Firma que no coincide" };
}
