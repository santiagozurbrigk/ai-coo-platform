/**
 * ⭐ Los permisos del cliente sobre su propio resultado.
 *
 * La Ficha de Caso del Excel pregunta dos cosas que OTC no guardaba: si el
 * cliente **autorizó el uso público** y **cómo quiere aparecer**. Sin eso, se
 * puede publicar la facturación de una persona real sin que conste en ningún
 * lado que dio permiso.
 *
 * La regla: **lo que no está autorizado no se ofrece para publicar.** No se
 * esconde —el win sigue existiendo y contando para el recorrido—, pero el
 * dashboard no lo propone como material.
 *
 * Lógica pura: no toca base ni red.
 */
import type { WinConsent } from "@/types/wins";

/** ¿Se puede usar este win en marketing? Sólo si alguien lo preguntó y dijo que sí. */
export function canPublish(consent: WinConsent): boolean {
  return consent.status === "granted" && consent.display !== null;
}

/**
 * ⭐ Qué se puede mostrar de un win, según lo que el cliente autorizó.
 *
 * Es lo que evita el error caro: publicar el nombre de alguien que autorizó el
 * número pero no que se lo asocien.
 */
export function publishablePieces(consent: WinConsent): {
  canShowName: boolean;
  canShowFace: boolean;
  canShowNumbers: boolean;
} {
  if (!canPublish(consent)) {
    return { canShowName: false, canShowFace: false, canShowNumbers: false };
  }

  switch (consent.display) {
    case "name_and_face":
      return { canShowName: true, canShowFace: true, canShowNumbers: true };
    case "name_no_numbers":
      return { canShowName: true, canShowFace: true, canShowNumbers: false };
    case "anonymous":
      return { canShowName: false, canShowFace: false, canShowNumbers: true };
    default:
      return { canShowName: false, canShowFace: false, canShowNumbers: false };
  }
}

/**
 * Por qué un win no se puede publicar todavía. Se muestra: "no publicable" a
 * secas no le dice a nadie qué hacer para destrabarlo.
 */
export function blockedReason(consent: WinConsent): string | null {
  if (consent.status === "denied") return "El cliente no autorizó usarlo.";
  if (consent.status === "not_asked") return "Falta preguntarle al cliente si lo autoriza.";
  if (consent.display === null) return "Autorizó, pero falta definir cómo quiere aparecer.";
  return null;
}
