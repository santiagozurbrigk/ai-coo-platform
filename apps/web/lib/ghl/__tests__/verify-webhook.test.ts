import { generateKeyPairSync, sign as cryptoSign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyGHLWebhook } from "../verify-webhook";

const BODY = JSON.stringify({ type: "OpportunityStageUpdate", id: "opp_1" });

describe("verifyGHLWebhook — vía de secreto compartido (Workflow)", () => {
  it("acepta el secreto correcto", () => {
    const result = verifyGHLWebhook(BODY, { ghl: null, legacy: null }, "s3cr3t", "s3cr3t");
    expect(result).toEqual({ ok: true, authPath: "workflow_shared_secret" });
  });

  it("rechaza un secreto distinto", () => {
    const result = verifyGHLWebhook(BODY, { ghl: null, legacy: null }, "s3cr3t", "otro");
    expect(result.ok).toBe(false);
  });

  it("rechaza cuando la org no tiene secreto configurado", () => {
    // Sin secreto y sin firma no hay forma de saber que el evento es legítimo.
    // Este endpoint alimenta conteos del embudo desde internet abierta.
    const result = verifyGHLWebhook(BODY, { ghl: null, legacy: null }, null, "cualquiera");
    expect(result.ok).toBe(false);
  });

  it("rechaza cuando la request no trae secreto", () => {
    const result = verifyGHLWebhook(BODY, { ghl: null, legacy: null }, "s3cr3t", null);
    expect(result.ok).toBe(false);
  });
});

describe("verifyGHLWebhook — vía de firma de plataforma", () => {
  it("rechaza una firma Ed25519 que no es de GHL", () => {
    // Firmada con otra clave: la verificación tiene que fallar aunque el
    // formato sea impecable.
    const { privateKey } = generateKeyPairSync("ed25519");
    const signature = cryptoSign(null, Buffer.from(BODY, "utf8"), privateKey).toString("base64");

    const result = verifyGHLWebhook(BODY, { ghl: signature, legacy: null }, "s3cr3t", "s3cr3t");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain("Ed25519");
  });

  it("una firma inválida NO cae al secreto compartido", () => {
    // Si cayera, cualquiera que conociera el secreto podría mandar eventos
    // haciéndolos pasar por firmados por la plataforma.
    const result = verifyGHLWebhook(BODY, { ghl: "basura", legacy: null }, "s3cr3t", "s3cr3t");
    expect(result.ok).toBe(false);
  });

  it("rechaza una firma RSA legacy que no es de GHL", () => {
    const result = verifyGHLWebhook(
      BODY,
      { ghl: null, legacy: Buffer.from("no-es-una-firma").toString("base64") },
      "s3cr3t",
      "s3cr3t"
    );
    expect(result.ok).toBe(false);
  });

  it("trata 'N/A' como ausencia de firma", () => {
    // GHL manda literalmente 'N/A' cuando no hay firma; tomarlo como firma
    // haría fallar todos los eventos de la vía de workflow.
    const result = verifyGHLWebhook(BODY, { ghl: "N/A", legacy: "N/A" }, "s3cr3t", "s3cr3t");
    expect(result).toEqual({ ok: true, authPath: "workflow_shared_secret" });
  });

  it("prefiere Ed25519 sobre la legacy cuando vienen las dos", () => {
    const result = verifyGHLWebhook(BODY, { ghl: "basura", legacy: "basura" }, null, null);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toContain("Ed25519");
  });
});
