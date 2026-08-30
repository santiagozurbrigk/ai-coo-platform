/**
 * lib/ghl/verify-webhook.ts
 *
 * Verificación de los webhooks de GoHighLevel.
 *
 * ⭐ DOS VÍAS DE ENTREGA, DOS FORMAS DE AUTENTICAR
 *
 * GHL sólo firma con su clave de plataforma los webhooks que salen de una **app
 * del Marketplace** (verificado el 2026-08-30 en
 * docs/external-apis/gohighlevel/webhook/WebhookIntegrationGuide.md: los eventos
 * y la URL se configuran dentro de la app). OTC todavía no tiene esa app
 * aprobada — es el pendiente `[FEAT-GHL-OAUTH]`.
 *
 * La vía que funciona hoy sin app es que el cliente arme un **Workflow** en su
 * sub-cuenta con una acción "Webhook" apuntando a OTC. Esos eventos NO llevan la
 * firma de la plataforma, así que se autentican con un secreto compartido por
 * organización.
 *
 * Las dos vías conviven a propósito: cuando la app del Marketplace exista, la
 * firma Ed25519 pasa a ser el camino principal sin tocar el ingest.
 *
 * Lo que NO se hace: aceptar un evento sin ninguna de las dos. Este endpoint
 * está abierto a internet y alimenta conteos del embudo; sin verificar,
 * cualquiera podría inflar las etapas de una org.
 *
 * FUENTE de las claves públicas: la guía de webhooks de GHL (misma captura).
 * La legacy RSA se deprecó el 2026-09-01 y queda sólo por el período de
 * transición.
 */

import { createVerify, timingSafeEqual, verify as cryptoVerify } from "node:crypto";

/** Clave pública Ed25519 de GHL — cabecera `X-GHL-Signature`. Es la vigente. */
export const GHL_ED25519_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAi2HR1srL4o18O8BRa7gVJY7G7bupbN3H9AwJrHCDiOg=
-----END PUBLIC KEY-----`;

/** Clave pública RSA legacy — cabecera `X-WH-Signature`. Deprecada 2026-09-01. */
export const GHL_LEGACY_RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAokvo/r9tVgcfZ5DysOSC
Frm602qYV0MaAiNnX9O8KxMbiyRKWeL9JpCpVpt4XHIcBOK4u3cLSqJGOLaPuXw6
dO0t6Q/ZVdAV5Phz+ZtzPL16iCGeK9po6D6JHBpbi989mmzMryUnQJezlYJ3DVfB
csedpinheNnyYeFXolrJvcsjDtfAeRx5ByHQmTnSdFUzuAnC9/GepgLT9SM4nCpv
uxmZMxrJt5Rw+VUaQ9B8JSvbMPpez4peKaJPZHBbU3OdeCVx5klVXXZQGNHOs8gF
3kvoV5rTnXV0IknLBXlcKKAQLZcY/Q9rG6Ifi9c+5vqlvHPCUJFT5XUGG5RKgOKU
J062fRtN+rLYZUV+BjafxQauvC8wSWeYja63VSUruvmNj8xkx2zE/Juc+yjLjTXp
IocmaiFeAO6fUtNjDeFVkhf5LNb59vECyrHD2SQIrhgXpO4Q3dVNA5rw576PwTzN
h/AMfHKIjE4xQA1SZuYJmNnmVZLIZBlQAF9Ntd03rfadZ+yDiOXCCs9FkHibELhC
HULgCsnuDJHcrGNd5/Ddm5hxGQ0ASitgHeMZ0kcIOwKDOzOU53lDza6/Y09T7sYJ
PQe7z0cvj7aE4B+Ax1ZoZGPzpJlZtGXCsu9aTEGEnKzmsFqwcSsnw3JB31IGKAyk
T1hhTiaCeIY/OwwwNUY2yvcCAwEAAQ==
-----END PUBLIC KEY-----`;

/** Cómo se autenticó el evento — se guarda en `ghl_webhook_events.auth_path`. */
export type GHLAuthPath =
  | "platform_ed25519"
  | "platform_rsa_legacy"
  | "workflow_shared_secret";

export type GHLVerification =
  | { ok: true; authPath: GHLAuthPath }
  | { ok: false; reason: string };

export type GHLSignatureHeaders = {
  ghl: string | null;
  legacy: string | null;
};

/** Comparación en tiempo constante, tolerante a longitudes distintas. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function verifyEd25519(rawBody: string, signature: string): boolean {
  try {
    return cryptoVerify(
      null,
      Buffer.from(rawBody, "utf8"),
      GHL_ED25519_PUBLIC_KEY,
      Buffer.from(signature, "base64")
    );
  } catch {
    return false;
  }
}

function verifyLegacyRsa(rawBody: string, signature: string): boolean {
  try {
    const verifier = createVerify("SHA256");
    verifier.update(rawBody);
    return verifier.verify(GHL_LEGACY_RSA_PUBLIC_KEY, signature, "base64");
  } catch {
    return false;
  }
}

/**
 * Verifica un evento por cualquiera de las dos vías.
 *
 * Orden: primero la firma de plataforma (si vino), después el secreto
 * compartido. La firma de plataforma gana porque prueba origen, no sólo
 * conocimiento de un secreto.
 *
 * `sharedSecret` es el de la org; `providedSecret` es lo que trajo la request.
 * GHL manda `N/A` en las cabeceras de firma cuando no hay ninguna, así que ese
 * valor se trata como ausencia.
 */
export function verifyGHLWebhook(
  rawBody: string,
  headers: GHLSignatureHeaders,
  sharedSecret: string | null,
  providedSecret: string | null
): GHLVerification {
  const ghlSig = headers.ghl && headers.ghl !== "N/A" ? headers.ghl : null;
  const legacySig = headers.legacy && headers.legacy !== "N/A" ? headers.legacy : null;

  if (ghlSig) {
    return verifyEd25519(rawBody, ghlSig)
      ? { ok: true, authPath: "platform_ed25519" }
      : { ok: false, reason: "Firma Ed25519 que no coincide" };
  }

  if (legacySig) {
    return verifyLegacyRsa(rawBody, legacySig)
      ? { ok: true, authPath: "platform_rsa_legacy" }
      : { ok: false, reason: "Firma RSA legacy que no coincide" };
  }

  if (sharedSecret && providedSecret) {
    return safeEqual(providedSecret, sharedSecret)
      ? { ok: true, authPath: "workflow_shared_secret" }
      : { ok: false, reason: "Secreto compartido que no coincide" };
  }

  return {
    ok: false,
    reason: sharedSecret
      ? "Sin firma de plataforma ni secreto en la request"
      : "Sin firma de plataforma y la organización no tiene secreto configurado",
  };
}
