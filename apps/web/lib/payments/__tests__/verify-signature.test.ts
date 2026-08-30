/**
 * Verificación de firma de webhooks de pagos.
 *
 * Estos endpoints reciben eventos de dinero desde internet abierta. Aceptar sin
 * verificar dejaría a cualquiera inyectar cobros falsos en las métricas de una
 * organización.
 */

import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  verifyStandardWebhook,
  verifyHmacWebhook,
  WEBHOOK_TOLERANCE_SECONDS,
} from "../verify-signature";

const SECRET = "un-secreto-de-prueba";
const BODY = '{"type":"payment.succeeded","data":{"id":"tx_1"}}';
const NOW = 1_800_000_000;

function standardSignature(id: string, timestamp: number, body: string, secret = SECRET) {
  return createHmac("sha256", secret).update(`${id}.${timestamp}.${body}`).digest("base64");
}

describe("Standard Webhooks (Whop)", () => {
  const headers = (over: Record<string, string | null> = {}) => ({
    id: "msg_1",
    timestamp: String(NOW),
    signature: `v1,${standardSignature("msg_1", NOW, BODY)}`,
    ...over,
  });

  it("acepta una firma válida", () => {
    expect(verifyStandardWebhook(BODY, headers(), SECRET, NOW).ok).toBe(true);
  });

  it("acepta cuando la cabecera trae varias firmas", () => {
    const signature = `v1,otra-firma v1,${standardSignature("msg_1", NOW, BODY)}`;
    expect(verifyStandardWebhook(BODY, headers({ signature }), SECRET, NOW).ok).toBe(true);
  });

  it("rechaza un cuerpo alterado", () => {
    const alterado = BODY.replace("tx_1", "tx_2");
    expect(verifyStandardWebhook(alterado, headers(), SECRET, NOW).ok).toBe(false);
  });

  it("rechaza un secreto distinto", () => {
    expect(verifyStandardWebhook(BODY, headers(), "otro-secreto", NOW).ok).toBe(false);
  });

  it("rechaza si falta alguna cabecera", () => {
    expect(verifyStandardWebhook(BODY, headers({ signature: null }), SECRET, NOW).ok).toBe(false);
    expect(verifyStandardWebhook(BODY, headers({ id: null }), SECRET, NOW).ok).toBe(false);
    expect(verifyStandardWebhook(BODY, headers({ timestamp: null }), SECRET, NOW).ok).toBe(false);
  });

  it("rechaza un evento viejo aunque la firma sea correcta", () => {
    // Sin esto, un evento capturado se puede reinyectar para siempre.
    const viejo = NOW - WEBHOOK_TOLERANCE_SECONDS - 1;
    const stale = {
      id: "msg_1",
      timestamp: String(viejo),
      signature: `v1,${standardSignature("msg_1", viejo, BODY)}`,
    };
    const result = verifyStandardWebhook(BODY, stale, SECRET, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/tolerancia/i);
  });

  it("acepta dentro de la ventana de tolerancia", () => {
    const casi = NOW - WEBHOOK_TOLERANCE_SECONDS + 10;
    const headersCasi = {
      id: "msg_1",
      timestamp: String(casi),
      signature: `v1,${standardSignature("msg_1", casi, BODY)}`,
    };
    expect(verifyStandardWebhook(BODY, headersCasi, SECRET, NOW).ok).toBe(true);
  });

  it("rechaza un timestamp que no es número", () => {
    expect(verifyStandardWebhook(BODY, headers({ timestamp: "ayer" }), SECRET, NOW).ok).toBe(false);
  });

  it("decodifica el secreto con prefijo whsec_", () => {
    const raw = "clave-binaria";
    const b64 = Buffer.from(raw).toString("base64");
    const signature = `v1,${createHmac("sha256", Buffer.from(raw)).update(`msg_1.${NOW}.${BODY}`).digest("base64")}`;
    const result = verifyStandardWebhook(
      BODY,
      { id: "msg_1", timestamp: String(NOW), signature },
      `whsec_${b64}`,
      NOW
    );
    expect(result.ok).toBe(true);
  });
});

describe("HMAC simple (Fanbasis)", () => {
  const hex = createHmac("sha256", SECRET).update(BODY).digest("hex");
  const b64 = createHmac("sha256", SECRET).update(BODY).digest("base64");

  it("acepta la firma en hex", () => {
    expect(verifyHmacWebhook(BODY, hex, SECRET).ok).toBe(true);
  });

  it("acepta la firma en base64", () => {
    expect(verifyHmacWebhook(BODY, b64, SECRET).ok).toBe(true);
  });

  it("acepta el prefijo sha256=", () => {
    expect(verifyHmacWebhook(BODY, `sha256=${hex}`, SECRET).ok).toBe(true);
  });

  it("rechaza un cuerpo alterado", () => {
    expect(verifyHmacWebhook(BODY.replace("tx_1", "tx_9"), hex, SECRET).ok).toBe(false);
  });

  it("rechaza cuando falta la firma", () => {
    expect(verifyHmacWebhook(BODY, null, SECRET).ok).toBe(false);
  });

  it("rechaza una firma de largo distinto sin romper", () => {
    expect(verifyHmacWebhook(BODY, "corta", SECRET).ok).toBe(false);
  });
});
