/**
 * Catálogo de ítems del onboarding.
 *
 * Es sólo datos: qué se le pide al usuario, en qué nivel, y a dónde lo manda.
 * La pregunta de si un ítem **está cumplido** no se responde acá — se deriva
 * de las tablas reales en `derive.ts`. Ver docs/ONBOARDING_PLAN.md.
 */

import { paths } from "@/routes/paths";

/**
 * Los tres niveles salen de una sola pregunta: qué se rompe si el ítem falta y
 * el usuario lo descubre recién en el mes 2.
 *
 * - `gate`      — contamina datos hacia adelante. Bloquea la entrada.
 * - `checklist` — el módulo queda vacío, pero nada se corrompe. Nunca bloquea.
 * - `suggested` — suma contexto. Se ofrece, no se pide.
 */
export type OnboardingTier = "gate" | "checklist" | "suggested";

export type OnboardingItemId =
  | "business_identity"
  | "core_offer"
  | "primary_avatar"
  | "data_source"
  | "first_funnel"
  | "historical_import"
  | "team_invited"
  | "knowledge_base";

export type OnboardingItem = {
  id: OnboardingItemId;
  tier: OnboardingTier;
  label: string;
  /** Qué gana el usuario al completarlo — no qué campo tiene que llenar. */
  description: string;
  href: string;
  /** Nombre de ícono Lucide, mismo criterio que `sidebar-modules.ts`. */
  icon: string;
  /**
   * `false` para los ítems que el usuario no puede decidir ignorar.
   * Los del gate no se descartan: para eso está `skip_onboarding`, que sólo
   * toca el super-admin.
   */
  dismissible: boolean;
};

export const ONBOARDING_ITEMS: readonly OnboardingItem[] = [
  {
    id: "business_identity",
    tier: "gate",
    label: "Datos del negocio",
    description:
      "Moneda y zona horaria definen cómo se suma y se agrupa cada número del producto. Cambiarlas después no corrige lo ya cargado.",
    href: paths.platform.settings,
    icon: "building-2",
    dismissible: false,
  },
  {
    id: "core_offer",
    tier: "gate",
    label: "Oferta principal",
    description:
      "Sin una oferta marcada como principal no hay ticket, ni LTV, ni embudo que medir.",
    href: paths.platform.product.root,
    icon: "package",
    dismissible: false,
  },
  {
    id: "primary_avatar",
    tier: "gate",
    label: "Avatar principal",
    description:
      "Es contra quién razonan el agente, el etiquetado de contenido y el análisis de llamadas.",
    href: paths.platform.product.root,
    icon: "user-round",
    dismissible: false,
  },
  {
    id: "data_source",
    tier: "checklist",
    label: "Conectar una fuente de datos",
    description:
      "Cualquiera sirve: Zernio, GoHighLevel, un proveedor de pagos, Calendly o Fathom. Sin ninguna, los módulos muestran ceros.",
    href: paths.platform.integrations,
    icon: "plug",
    dismissible: true,
  },
  {
    id: "first_funnel",
    tier: "checklist",
    label: "Primer embudo medido",
    description:
      "Crear el embudo y vincular todos sus pasos a una fuente. Un embudo a medio vincular muestra huecos, no números.",
    href: paths.platform.funnels.root,
    icon: "filter",
    dismissible: true,
  },
  {
    id: "historical_import",
    tier: "checklist",
    label: "Importar histórico",
    description:
      "La diferencia entre un panel vacío y uno que ya sabe de tu negocio durante la primera semana.",
    href: paths.platform.integrationsImport,
    icon: "upload",
    dismissible: true,
  },
  {
    id: "team_invited",
    tier: "checklist",
    label: "Invitar al equipo",
    description:
      "Cada persona ve sólo los módulos que le habilites.",
    href: paths.platform.team.members,
    icon: "users",
    dismissible: true,
  },
  {
    id: "knowledge_base",
    tier: "suggested",
    label: "Cargar documentos del negocio",
    description:
      "El agente los usa como contexto. Cuantos más tenga, menos genéricas son sus respuestas.",
    href: paths.platform.businessContext.documents,
    icon: "book-open",
    dismissible: true,
  },
] as const;

const ITEMS_BY_ID = new Map(ONBOARDING_ITEMS.map((item) => [item.id, item]));

export function getOnboardingItem(id: OnboardingItemId): OnboardingItem {
  const item = ITEMS_BY_ID.get(id);
  if (!item) throw new Error(`Ítem de onboarding desconocido: ${id}`);
  return item;
}

export function onboardingItemsByTier(tier: OnboardingTier): OnboardingItem[] {
  return ONBOARDING_ITEMS.filter((item) => item.tier === tier);
}

/** Los ítems del gate, en el orden en que se piden. */
export const GATE_ITEM_IDS = onboardingItemsByTier("gate").map((i) => i.id);
