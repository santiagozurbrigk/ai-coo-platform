import type Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------- Tool definitions ----------

export const PROPOSE_CUSTOMER_AVATAR_TOOL: Anthropic.Tool = {
  name: "propose_customer_avatar",
  description:
    "Propone crear o editar un avatar de cliente en el modelo mental del negocio. " +
    "Úsala SOLO cuando el usuario describa una decisión REAL y CONCRETA sobre el cliente ideal " +
    "(no para brainstorming ni hipótesis). Si 'id' está presente es una edición, si falta es una creación.",
  input_schema: {
    type: "object" as const,
    required: ["name", "mainPain"],
    properties: {
      id: { type: "string", description: "UUID del avatar a editar (solo para updates)" },
      name: { type: "string", description: "Nombre del avatar, ej: 'Coaches de alto ticket'" },
      mainPain: { type: "string", description: "Dolor principal del avatar" },
      ageRange: { type: "string", description: "Rango etario, ej: '30-45 años'" },
      occupation: { type: "string", description: "Ocupación o rol" },
      location: { type: "string", description: "Ubicación geográfica" },
      isPrimary: { type: "boolean", description: "true si es el avatar principal del negocio" },
      desires: {
        type: "array",
        items: { type: "string" },
        description: "Lista de deseos o aspiraciones del avatar",
      },
      objections: {
        type: "array",
        items: { type: "string" },
        description: "Objeciones frecuentes del avatar",
      },
      whereTheyHang: { type: "string", description: "Dónde se encuentra este avatar (canales, comunidades)" },
      languageTheyUse: { type: "string", description: "Cómo habla o qué frases usa este avatar" },
    },
  },
};

export const PROPOSE_PRODUCT_TOOL: Anthropic.Tool = {
  name: "propose_product",
  description:
    "Propone crear o editar un producto u oferta en el modelo mental del negocio. " +
    "Úsala SOLO cuando el usuario describa una decisión REAL sobre productos o precios. " +
    "Para conectarlo a un avatar existente, usá el 'targetAvatarId' con el ID real del avatar (no lo inventes).",
  input_schema: {
    type: "object" as const,
    required: ["name"],
    properties: {
      id: { type: "string", description: "UUID del producto a editar (solo para updates)" },
      name: { type: "string", description: "Nombre del producto u oferta" },
      description: { type: "string", description: "Descripción de la promesa de la oferta" },
      type: {
        type: "string",
        enum: ["curso", "mentoria", "consultoria", "comunidad", "evento", "otro"],
        description: "Tipo de producto",
      },
      price: { type: "number", description: "Precio del producto" },
      currency: { type: "string", description: "Moneda, ej: 'USD' o 'ARS'" },
      billingType: {
        type: "string",
        enum: ["unico", "mensual", "anual", "personalizado"],
        description: "Modalidad de cobro",
      },
      targetAvatarId: { type: "string", description: "UUID del avatar objetivo (debe existir en la lista de avatares actuales)" },
      isCoreOffer: { type: "boolean", description: "true si es la oferta principal/core del negocio" },
      valueLadderPosition: { type: "number", description: "Posición en la escalera de valor (1 = más accesible)" },
    },
  },
};

export const PROPOSE_VALUE_LADDER_STEP_TOOL: Anthropic.Tool = {
  name: "propose_value_ladder_step",
  description:
    "Propone agregar un escalón a la escalera de valor del negocio. " +
    "Un escalón de valor es un producto posicionado en un nivel específico de la escalera (entrada, medio, alto). " +
    "Úsala SOLO cuando el usuario decida agregar una nueva oferta a la escalera.",
  input_schema: {
    type: "object" as const,
    required: ["name", "valueLadderPosition"],
    properties: {
      id: { type: "string", description: "UUID del producto a editar (solo para updates)" },
      name: { type: "string", description: "Nombre del escalón/oferta" },
      description: { type: "string", description: "Qué transforma o resuelve este escalón" },
      price: { type: "number", description: "Precio" },
      currency: { type: "string", description: "Moneda" },
      billingType: {
        type: "string",
        enum: ["unico", "mensual", "anual", "personalizado"],
      },
      valueLadderPosition: {
        type: "number",
        description: "Posición en la escalera: 1 = entrada (más barato), mayor número = más alto",
      },
      targetAvatarId: { type: "string", description: "UUID del avatar objetivo" },
    },
  },
};

export const PROPOSE_SALES_FRAMEWORK_TOOL: Anthropic.Tool = {
  name: "propose_sales_framework",
  description:
    "Propone crear o editar un framework/metodología de ventas. " +
    "Úsala cuando el usuario describa un script, proceso de venta, manejo de objeciones o secuencia de seguimiento que quiera formalizar.",
  input_schema: {
    type: "object" as const,
    required: ["name", "content"],
    properties: {
      id: { type: "string", description: "UUID del framework a editar (solo para updates)" },
      name: { type: "string", description: "Nombre del framework" },
      description: { type: "string", description: "Descripción breve del propósito" },
      type: {
        type: "string",
        enum: ["script", "objeciones", "followup", "onboarding", "otro"],
        description: "Tipo de framework",
      },
      content: { type: "string", description: "Contenido completo del framework (script, pasos, etc.)" },
    },
  },
};

export const PROPOSE_VALUE_PROPOSITION_TOOL: Anthropic.Tool = {
  name: "propose_value_proposition",
  description:
    "Propone actualizar la propuesta de valor del negocio. " +
    "Úsala cuando el usuario redefina explícitamente su propuesta: a quién ayuda, qué logra, qué dolor elimina y en cuánto tiempo. " +
    "Siempre es una actualización (no hay múltiples propuestas de valor, hay exactamente una por negocio).",
  input_schema: {
    type: "object" as const,
    required: ["avatar", "result", "painRemoved", "timeframe"],
    properties: {
      avatar: { type: "string", description: "A quién ayuda (el avatar), ej: 'coaches de alto ticket'" },
      result: { type: "string", description: "Qué resultado logra, ej: 'llenar su agenda de clientes'" },
      painRemoved: { type: "string", description: "Qué dolor o fricción elimina" },
      timeframe: { type: "string", description: "En cuánto tiempo, ej: '90 días'" },
    },
  },
};

export const ALL_PROPOSAL_TOOLS: Anthropic.Tool[] = [
  PROPOSE_CUSTOMER_AVATAR_TOOL,
  PROPOSE_PRODUCT_TOOL,
  PROPOSE_VALUE_LADDER_STEP_TOOL,
  PROPOSE_SALES_FRAMEWORK_TOOL,
  PROPOSE_VALUE_PROPOSITION_TOOL,
];

export const PROPOSAL_TOOL_NAMES = new Set([
  "propose_customer_avatar",
  "propose_product",
  "propose_value_ladder_step",
  "propose_sales_framework",
  "propose_value_proposition",
] as const);

// ---------- Entity context for the system prompt ----------

export type ProductEntityContext = {
  avatars: Array<{ id: string; name: string; isPrimary: boolean }>;
  products: Array<{ id: string; name: string; type: string | null }>;
  frameworks: Array<{ id: string; name: string; type: string | null }>;
};

/**
 * Loads a lightweight list of existing entities (id + name) so Claude can
 * reference them correctly when creating connections (e.g. product → avatar).
 * Returns an empty context if the table is missing or not configured.
 */
export async function loadProductEntityContext(
  organizationId: string
): Promise<ProductEntityContext> {
  try {
    const supabase = createAdminClient();

    const [avatarsRes, productsRes, frameworksRes] = await Promise.all([
      supabase
        .from("customer_avatars")
        .select("id, name, is_primary")
        .eq("organization_id", organizationId)
        .order("is_primary", { ascending: false }),
      supabase
        .from("products")
        .select("id, name, type")
        .eq("organization_id", organizationId)
        .eq("is_active", true),
      supabase
        .from("sales_frameworks")
        .select("id, name, type")
        .eq("organization_id", organizationId)
        .eq("is_active", true),
    ]);

    return {
      avatars: (avatarsRes.data ?? []).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        isPrimary: Boolean(r.is_primary),
      })),
      products: (productsRes.data ?? []).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        type: r.type as string | null,
      })),
      frameworks: (frameworksRes.data ?? []).map((r) => ({
        id: r.id as string,
        name: r.name as string,
        type: r.type as string | null,
      })),
    };
  } catch {
    return { avatars: [], products: [], frameworks: [] };
  }
}

export function buildEntityContextText(ctx: ProductEntityContext): string {
  if (
    ctx.avatars.length === 0 &&
    ctx.products.length === 0 &&
    ctx.frameworks.length === 0
  ) {
    return "";
  }

  const lines: string[] = ["ENTIDADES ACTUALES DEL NEGOCIO (IDs para referenciar en tools):"];

  if (ctx.avatars.length > 0) {
    lines.push("Avatares:");
    for (const a of ctx.avatars) {
      lines.push(`  • id="${a.id}"  nombre="${a.name}"${a.isPrimary ? "  [PRIMARIO]" : ""}`);
    }
  }

  if (ctx.products.length > 0) {
    lines.push("Productos:");
    for (const p of ctx.products) {
      lines.push(`  • id="${p.id}"  nombre="${p.name}"  tipo="${p.type ?? "otro"}"`);
    }
  }

  if (ctx.frameworks.length > 0) {
    lines.push("Frameworks:");
    for (const f of ctx.frameworks) {
      lines.push(`  • id="${f.id}"  nombre="${f.name}"  tipo="${f.type ?? "otro"}"`);
    }
  }

  return lines.join("\n");
}
