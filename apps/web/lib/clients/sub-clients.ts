/**
 * Los clientes de un cliente: lógica pura, sin base ni servidor.
 *
 * ⭐ Sólo existen con el add-on `growth_partners`. Un growth partner (el
 * cliente) trabaja con varios infoproductores (sus clientes), y Marketing,
 * Ventas y Sistemas son datos del negocio de cada infoproductor.
 */

import { hasValue } from "@/lib/custom-fields/resolve";
import type { CustomFieldValues, FieldDefinition } from "@/types/custom-fields";

export type SubClient = {
  id: string;
  clientId: string;
  name: string;
  instagramUrl: string | null;
  custom: CustomFieldValues;
  createdAt: string;
};

export type SubClientRow = {
  id: string;
  client_id: string;
  name: string;
  instagram_url: string | null;
  custom: unknown;
  created_at: string;
};

export const SUB_CLIENT_COLUMNS = "id, client_id, name, instagram_url, custom, created_at";

export const SUB_CLIENT_NAME_MAX = 200;

export function rowToSubClient(row: SubClientRow): SubClient {
  const custom =
    row.custom && typeof row.custom === "object" && !Array.isArray(row.custom)
      ? (row.custom as CustomFieldValues)
      : {};
  return {
    id: row.id,
    clientId: row.client_id,
    name: row.name,
    instagramUrl: row.instagram_url,
    custom,
    createdAt: row.created_at,
  };
}

/**
 * Lo que pegaron en el campo del link, convertido en una URL.
 *
 * ⭐ Lo más común es pegar el usuario y no el link: «@juanperez» o
 * «juanperez». Pedir la URL completa obliga a ir a Instagram a copiarla; se
 * arma sola. Un link de cualquier otro sitio también vale — el pedido es "un
 * link, que puede ser a un Instagram", no "sólo Instagram".
 *
 * Devuelve `null` si viene vacío, y un error si no se puede leer como link.
 */
export function normalizeInstagramUrl(
  raw: string | null | undefined
): { ok: true; url: string | null } | { ok: false; error: string } {
  const texto = (raw ?? "").trim();
  if (!texto) return { ok: true, url: null };

  if (/^https?:\/\//i.test(texto)) {
    try {
      const url = new URL(texto);
      if (!url.hostname.includes(".")) throw new Error("sin dominio");
      return { ok: true, url: texto };
    } catch {
      return { ok: false, error: "Ese link no se puede abrir. Revisalo." };
    }
  }

  // «instagram.com/usuario», sin protocolo.
  if (/^(www\.)?instagram\.com\//i.test(texto)) {
    return { ok: true, url: `https://${texto.replace(/^www\./i, "")}` };
  }

  // «@usuario» o «usuario»: letras, números, punto y guion bajo, como Instagram.
  const usuario = texto.replace(/^@/, "");
  if (/^[A-Za-z0-9._]{1,30}$/.test(usuario)) {
    return { ok: true, url: `https://instagram.com/${usuario}` };
  }

  return {
    ok: false,
    error: "Pegá el link de Instagram o el usuario (@usuario).",
  };
}

/**
 * Cómo mostrar el link en una línea: `@usuario` si es Instagram, el dominio si
 * es otra cosa.
 */
export function instagramLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "instagram.com") {
      const usuario = parsed.pathname.split("/").filter(Boolean)[0];
      if (usuario) return `@${usuario}`;
    }
    return host;
  } catch {
    return url;
  }
}

/** Las claves de los campos con sección (Marketing, Ventas, Sistemas). */
export function sectionFieldKeys(fields: readonly FieldDefinition[]): Set<string> {
  return new Set(fields.filter((field) => field.section !== null).map((field) => field.key));
}

/**
 * Los datos de Marketing, Ventas y Sistemas que quedaron cargados **en el
 * growth partner**, de antes de que existieran sus clientes.
 *
 * Incluye los de campos archivados: siguen siendo datos que alguien cargó.
 */
export function legacySectionValues(
  fields: readonly FieldDefinition[],
  clientCustom: CustomFieldValues | null | undefined
): CustomFieldValues {
  const keys = sectionFieldKeys(fields);
  const result: CustomFieldValues = {};
  for (const [key, value] of Object.entries(clientCustom ?? {})) {
    if (keys.has(key) && hasValue(value)) result[key] = value;
  }
  return result;
}

export type LegacyMovePlan = {
  /** Los valores del cliente de destino, con lo que se pasa sumado. */
  subClientCustom: CustomFieldValues;
  /** Los valores del growth partner, sin lo que se pasó. */
  clientCustom: CustomFieldValues;
  moved: string[];
  /** Claves que el destino ya tenía cargadas: no se pisan y quedan donde estaban. */
  kept: string[];
};

/**
 * Pasar los datos viejos del growth partner a uno de sus clientes.
 *
 * ⭐ **Nunca se pisa nada.** Si el cliente de destino ya tiene cargado ese
 * campo, se deja lo suyo y el dato viejo se queda en el growth partner, para
 * que se pueda pasar a otro cliente. Borrar el dato viejo en ese caso sería
 * perderlo sin que nadie lo decida.
 */
export function planLegacyMove(
  fields: readonly FieldDefinition[],
  clientCustom: CustomFieldValues | null | undefined,
  subClientCustom: CustomFieldValues | null | undefined
): LegacyMovePlan {
  const legacy = legacySectionValues(fields, clientCustom);
  const nextSub: CustomFieldValues = { ...(subClientCustom ?? {}) };
  const nextClient: CustomFieldValues = { ...(clientCustom ?? {}) };
  const moved: string[] = [];
  const kept: string[] = [];

  for (const [key, value] of Object.entries(legacy)) {
    if (hasValue(nextSub[key])) {
      kept.push(key);
      continue;
    }
    nextSub[key] = value;
    delete nextClient[key];
    moved.push(key);
  }

  return { subClientCustom: nextSub, clientCustom: nextClient, moved, kept };
}
