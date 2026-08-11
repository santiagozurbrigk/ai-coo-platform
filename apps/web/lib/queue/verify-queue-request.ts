/**
 * Verificación de autenticación para endpoints de cola (QStash + WORKER_AUTH_SECRET).
 *
 * Orden de verificación:
 *   1. WORKER_AUTH_SECRET — header X-Worker-Secret (custom), Authorization: Bearer, o query param.
 *      QStash reenvía estos cuando se configuran en publishJSON({ headers }).
 *   2. QStash signature — fallback si no hay WORKER_AUTH_SECRET (signing keys configuradas).
 *
 * Consistente con la lógica de verifySignature() en apps/reel-worker/src/index.ts.
 */

import { verifyQStashRequest } from "./qstash-verify";

export async function verifyQueueRequest(
  request: Request,
  rawBody: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const workerSecret = process.env.WORKER_AUTH_SECRET?.trim();

  if (workerSecret) {
    // a) Header custom (nunca stripeado por proxies ni QStash)
    const xWorkerSecret = request.headers.get("x-worker-secret");
    if (xWorkerSecret === workerSecret) return { ok: true };

    // b) Authorization: Bearer <secret>
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${workerSecret}`) return { ok: true };

    // c) Query param (fallback absoluto — QStash nunca modifica query params)
    const url = new URL(request.url);
    const qSecret = url.searchParams.get("workerSecret");
    if (qSecret === workerSecret) return { ok: true };

    console.warn("[Queue] WORKER_AUTH_SECRET configurado pero ningún método coincidió");
    return { ok: false, status: 401, error: "Invalid WORKER_AUTH_SECRET" };
  }

  // Fallback: QStash signature (requiere QSTASH_CURRENT_SIGNING_KEY + QSTASH_NEXT_SIGNING_KEY)
  return verifyQStashRequest(request, rawBody);
}
