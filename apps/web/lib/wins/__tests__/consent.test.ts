import { describe, expect, it } from "vitest";
import {
  blockedReason,
  canPublish,
  publishablePieces,
} from "@/lib/wins/consent";
import {
  pendingAttention,
  resolveUsageState,
} from "@/lib/wins/usage-state";

describe("⭐ permisos: lo que no está autorizado no se ofrece", () => {
  it("sin preguntar no se publica", () => {
    expect(canPublish({ status: "not_asked", display: null })).toBe(false);
  });

  it("si dijo que no, no se publica", () => {
    expect(canPublish({ status: "denied", display: null })).toBe(false);
  });

  it("autorizado y con forma elegida, sí", () => {
    expect(canPublish({ status: "granted", display: "name_and_face" })).toBe(true);
  });

  it("⭐ autorizado pero sin decir cómo aparecer NO alcanza", () => {
    // Es el caso a medias: se puede usar el número pero nadie sabe si se puede
    // poner el nombre. Preferimos frenar a adivinar.
    expect(canPublish({ status: "granted", display: null })).toBe(false);
  });
});

describe("⭐ qué se puede mostrar de cada uno", () => {
  it("nombre y cara: todo", () => {
    expect(publishablePieces({ status: "granted", display: "name_and_face" })).toEqual({
      canShowName: true,
      canShowFace: true,
      canShowNumbers: true,
    });
  });

  it("⭐ nombre sin números: el nombre sí, la plata no", () => {
    // El error caro sería mostrar la facturación de alguien que autorizó que se
    // lo nombre pero no que se sepa cuánto factura.
    const pieces = publishablePieces({
      status: "granted",
      display: "name_no_numbers",
    });
    expect(pieces.canShowName).toBe(true);
    expect(pieces.canShowNumbers).toBe(false);
  });

  it("anónimo: los números sí, el nombre no", () => {
    const pieces = publishablePieces({ status: "granted", display: "anonymous" });
    expect(pieces.canShowName).toBe(false);
    expect(pieces.canShowNumbers).toBe(true);
  });

  it("sin permiso no se muestra nada", () => {
    expect(publishablePieces({ status: "not_asked", display: null })).toEqual({
      canShowName: false,
      canShowFace: false,
      canShowNumbers: false,
    });
  });
});

describe("el motivo se dice, no se esconde", () => {
  it("explica qué falta en cada caso", () => {
    expect(blockedReason({ status: "not_asked", display: null })).toContain("preguntar");
    expect(blockedReason({ status: "denied", display: null })).toContain("no autorizó");
    expect(blockedReason({ status: "granted", display: null })).toContain("cómo quiere");
    expect(blockedReason({ status: "granted", display: "anonymous" })).toBeNull();
  });
});

describe("⭐ estado de uso: qué wins quedaron sin aprovechar", () => {
  it("con usos registrados está usada, sin importar lo declarado", () => {
    // Pedir que marquen "usada" además de cargar dónde se usó es pedir el mismo
    // dato dos veces, y el segundo queda viejo.
    expect(resolveUsageState("unused", 2)).toBe("used");
    expect(resolveUsageState("reserved", 1)).toBe("used");
  });

  it("sin usos, sin usar", () => {
    expect(resolveUsageState("unused", 0)).toBe("unused");
  });

  it('⭐ "reservada" se respeta: no se puede deducir de nada', () => {
    expect(resolveUsageState("reserved", 0)).toBe("reserved");
  });
});

describe("la lista de lo que está esperando algo", () => {
  const win = (
    usageState: "unused" | "used" | "reserved",
    canPublishIt: boolean,
    needsScreenshot = false
  ) => ({ usageState, canPublish: canPublishIt, needsScreenshot });

  it("separa lo listo para usar de lo que necesita permiso", () => {
    const result = pendingAttention([
      win("unused", true),
      win("unused", false),
      win("used", true),
    ]);
    expect(result.readyToUse).toHaveLength(1);
    expect(result.needsConsent).toHaveLength(1);
  });

  it("⭐ lo que está sin usar y sin permiso es lo más lejos de servir", () => {
    const result = pendingAttention([win("unused", false)]);
    expect(result.needsConsent).toHaveLength(1);
    expect(result.readyToUse).toHaveLength(0);
  });

  it("lo que falta la captura se lista aparte, esté usado o no", () => {
    const result = pendingAttention([win("used", true, true), win("unused", true, true)]);
    expect(result.needsScreenshot).toHaveLength(2);
    // Con captura pendiente no está listo para publicar todavía.
    expect(result.readyToUse).toHaveLength(0);
  });
});
