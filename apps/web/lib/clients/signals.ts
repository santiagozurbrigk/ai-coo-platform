/**
 * Las señales de la lista de clientes de un growth partner: hace cuánto no hay
 * novedades y qué fecha de sus creadores está por llegar.
 *
 * ⭐ Es el pedido del audio: «avisos de hace 15 días que no tenemos update del
 * cliente» y «cuándo es su próximo lanzamiento». Ninguna de las dos necesita
 * que alguien se acuerde de mirar: la lista las muestra solas.
 *
 * Lógica pura: no toca base ni red.
 */

import { resolverAvisoDeFecha, type AvisoDeFecha } from "@/lib/custom-fields/date-alert";
import type { CustomFieldValues, FieldDefinition } from "@/types/custom-fields";

export const DEFAULT_SILENCE_DAYS = 15;

/** De dónde salió la última novedad (ver `client_last_activity` en SQL). */
export const ACTIVITY_SOURCE_LABEL: Record<string, string> = {
  alta: "el alta",
  nota: "una nota",
  satisfaccion: "la satisfacción",
  linea_de_tiempo: "la línea de tiempo",
  llamada: "una llamada",
  discord: "un mensaje en Discord",
  onboarding: "el onboarding",
  win: "un win",
};

export type ClientSilence = {
  lastAt: string;
  source: string;
  /** Días enteros desde la última novedad. */
  days: number;
  isSilent: boolean;
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function resolveSilence(
  lastAt: string,
  source: string,
  thresholdDays: number,
  now: Date = new Date()
): ClientSilence | null {
  const at = new Date(lastAt).getTime();
  if (Number.isNaN(at)) return null;
  const days = Math.max(0, Math.floor((now.getTime() - at) / MS_POR_DIA));
  return { lastAt, source, days, isSilent: days >= thresholdDays };
}

export type DateAlert = {
  subClientName: string;
  fieldLabel: string;
  value: string;
  aviso: AvisoDeFecha;
};

/**
 * Las fechas con aviso de los creadores de cada growth partner que están
 * cerca o son hoy, la más próxima primero.
 *
 * ⭐ Sale de cualquier campo de fecha con «avisarme cuando falten» —no está
 * horneada la palabra "lanzamiento"—, así una fecha nueva que configure el
 * equipo también avisa. Las que ya pasaron no: un lanzamiento de hace un mes
 * no es un aviso, es un dato viejo, y se ve en la ficha.
 */
export function upcomingDateAlerts(
  fields: readonly FieldDefinition[],
  subClients: readonly { clientId: string; name: string; custom: CustomFieldValues }[],
  now: Date = new Date()
): Record<string, DateAlert[]> {
  const conAviso = fields.filter(
    (field) =>
      field.fieldType === "date" &&
      field.alertDaysBefore !== null &&
      field.section !== null &&
      field.archivedAt === null
  );
  const result: Record<string, DateAlert[]> = {};

  for (const sub of subClients) {
    for (const field of conAviso) {
      const value = sub.custom[field.key];
      const aviso = resolverAvisoDeFecha(value, field.alertDaysBefore, now);
      if (!aviso?.alerta || aviso.estado === "pasada") continue;
      (result[sub.clientId] ??= []).push({
        subClientName: sub.name,
        fieldLabel: field.label,
        value: value as string,
        aviso,
      });
    }
  }
  for (const lista of Object.values(result)) {
    lista.sort((a, b) => a.aviso.diasFaltantes - b.aviso.diasFaltantes);
  }
  return result;
}
