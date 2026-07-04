import { paths } from "@/routes/paths";
import type {
  ProductAvatar,
  ProductData,
  ProductOffer,
  SpatialProductNode,
  ValueLadderStep,
  ValueProposition,
} from "@/types/product";

export type CustomerAvatarRow = {
  id: string;
  organization_id: string;
  name: string;
  age_range: string | null;
  gender: string | null;
  location: string | null;
  occupation: string | null;
  income_range: string | null;
  main_pain: string;
  secondary_pains: unknown;
  desires: unknown;
  fears: unknown;
  objections: unknown;
  where_they_hang: string | null;
  language_they_use: string | null;
  is_primary: boolean;
};

export type ProductRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  type: string | null;
  price: number | null;
  currency: string | null;
  billing_type: string | null;
  value_ladder_position: number;
  is_active: boolean;
  is_core_offer?: boolean;
  bonuses: unknown;
  guarantee: string | null;
  target_avatar_id: string | null;
  target_avatar?: { name: string } | { name: string }[] | null;
};

export type ValueLadderRow = {
  id: string;
  level: number;
  name: string;
  description: string | null;
  price_range: string | null;
  goal: string | null;
  product?: ProductRow | ProductRow[] | null;
};

export type SalesFrameworkRow = {
  id: string;
  name: string;
  description: string | null;
  content: string;
  type: string | null;
  is_active: boolean;
};

function parseStringArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === "string");
  return [];
}

function parseAgeFromRange(ageRange: string | null | undefined): number | null {
  if (!ageRange) return null;
  const match = ageRange.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function billingLabel(billing: string | null | undefined): string {
  switch (billing) {
    case "unico":
      return "Pago único";
    case "mensual":
      return "Mensual";
    case "anual":
      return "Anual";
    case "personalizado":
      return "Personalizado";
    default:
      return billing ?? "—";
  }
}

function typeLabel(type: string | null | undefined): string {
  if (!type) return "Producto";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function avatarRowToProductAvatar(row: CustomerAvatarRow): ProductAvatar {
  const secondaryPains = parseStringArray(row.secondary_pains);
  const desires = parseStringArray(row.desires);
  const objections = parseStringArray(row.objections);

  return {
    id: row.id,
    name: row.name,
    age: parseAgeFromRange(row.age_range) ?? 30,
    role: row.occupation ?? "—",
    location: row.location ?? "—",
    isMain: row.is_primary,
    currentRevenue: row.income_range ?? "—",
    targetRevenue: "—",
    yearsInBusiness: "—",
    innerVoice: row.language_they_use
      ? `"${row.language_they_use}"`
      : `"${row.main_pain}"`,
    pains: [row.main_pain, ...secondaryPains],
    dreams: desires,
    objections: objections.map((text) => ({ text })),
    buyTrigger: row.where_they_hang ?? "—",
    aiInsights: [],
  };
}

export function productRowToOffer(row: ProductRow): ProductOffer {
  const avatarRaw = row.target_avatar;
  const avatar = Array.isArray(avatarRaw) ? avatarRaw[0] : avatarRaw;
  const bonuses = parseStringArray(row.bonuses);

  return {
    id: row.id,
    name: row.name,
    price: row.price != null ? Number(row.price) : 0,
    promise: row.description ?? "",
    targetAvatar: avatar?.name ?? "—",
    promisedResult: row.description ?? "",
    timeframe: billingLabel(row.billing_type),
    guarantee: row.guarantee ?? "",
    mainObjection: "",
    objectionHandler: "",
    includes: bonuses.map((title) => ({ title })),
    stats: {
      monthlyRevenue: "Sin datos",
      closeRate: 0,
      topObjection: "Sin datos",
      completionRate: 0,
    },
    aiInsight: "",
  };
}

export function valueLadderRowToStep(row: ValueLadderRow): ValueLadderStep {
  const productRaw = row.product;
  const product = Array.isArray(productRaw) ? productRaw[0] : productRaw;

  return {
    id: row.id,
    productId: product?.id ?? undefined,
    name: row.name,
    price: product?.price != null ? Number(product.price) : 0,
    priceModel: row.price_range ?? billingLabel(product?.billing_type),
    description: row.description ?? product?.description ?? "",
    isCore: product?.is_core_offer ?? false,
    closesPerMonth: "Sin datos",
    closeRate: 0,
  };
}

export function productRowToLadderStep(row: ProductRow): ValueLadderStep {
  return {
    id: row.id,
    productId: row.id,
    name: row.name,
    price: row.price != null ? Number(row.price) : 0,
    priceModel: billingLabel(row.billing_type),
    description: row.description ?? "",
    isCore: row.is_core_offer ?? false,
    closesPerMonth: "Sin datos",
    closeRate: 0,
  };
}

export type ValuePropositionRow = {
  organization_id: string;
  avatar_text: string;
  result_text: string;
  pain_removed_text: string;
  timeframe_text: string;
  updated_at: string;
};

export function rowToValueProposition(row: ValuePropositionRow): ValueProposition {
  return {
    avatar: row.avatar_text,
    result: row.result_text,
    painRemoved: row.pain_removed_text,
    timeframe: row.timeframe_text,
  };
}

export function buildProposition(
  avatars: ProductAvatar[],
  offers: ProductOffer[]
): ValueProposition {
  const main = avatars.find((a) => a.isMain) ?? avatars[0];
  const core = offers[0];

  return {
    avatar: main ? `${main.name} — ${main.role}` : "tu cliente ideal",
    result: core?.promisedResult ?? "resultado transformacional",
    painRemoved: main?.pains[0] ?? "el dolor principal",
    timeframe: core?.timeframe ?? "—",
  };
}

export const emptyProductData: ProductData = {
  avatars: [],
  valueLadder: [],
  offers: [],
  proposition: {
    avatar: "",
    result: "",
    painRemoved: "",
    timeframe: "",
  },
};

export function buildProductData(
  avatarRows: CustomerAvatarRow[],
  productRows: ProductRow[],
  ladderRows: ValueLadderRow[],
  savedProposition?: ValueProposition | null
): ProductData {
  const avatars = avatarRows.map(avatarRowToProductAvatar);
  const offers = productRows.filter((p) => p.is_active).map(productRowToOffer);

  const valueLadder =
    ladderRows.length > 0
      ? ladderRows.map(valueLadderRowToStep)
      : [...productRows]
          .filter((p) => p.is_active)
          .sort((a, b) => a.value_ladder_position - b.value_ladder_position)
          .map(productRowToLadderStep);

  const derived = buildProposition(avatars, offers);
  const proposition = savedProposition ?? derived;

  return {
    avatars,
    offers,
    valueLadder,
    proposition,
  };
}

export function buildSpatialNodes(data: ProductData): SpatialProductNode[] {
  const nodes: SpatialProductNode[] = [];

  const mainAvatar = data.avatars.find((a) => a.isMain) ?? data.avatars[0];
  const secondaryAvatar = data.avatars.find((a) => !a.isMain);

  if (mainAvatar) {
    nodes.push({
      id: `avatar-${mainAvatar.id}`,
      type: "avatar",
      title: `${mainAvatar.name}, ${mainAvatar.age}`,
      subtitle: mainAvatar.role,
      badge: mainAvatar.isMain ? "Avatar principal" : "Avatar",
      badgeColor: "bg-blue-500/15 text-blue-400",
      position: { x: "50%", y: "15%" },
      href: paths.platform.product.avatar(mainAvatar.id),
    });
  }

  if (secondaryAvatar) {
    nodes.push({
      id: `avatar-${secondaryAvatar.id}`,
      type: "avatar",
      title: `${secondaryAvatar.name}, ${secondaryAvatar.age}`,
      subtitle: secondaryAvatar.role,
      badge: "Sub-avatar",
      badgeColor: "bg-blue-500/10 text-blue-300",
      position: { x: "20%", y: "30%" },
      href: paths.platform.product.avatar(secondaryAvatar.id),
    });
  }

  data.offers.slice(0, 2).forEach((offer, index) => {
    nodes.push({
      id: `offer-${offer.id}`,
      type: "offer",
      title: offer.name,
      subtitle: `$${offer.price.toLocaleString()} · ${offer.timeframe}`,
      badge: index === 0 ? "Oferta entrada" : "Oferta core",
      badgeColor:
        index === 0
          ? "bg-violet-500/15 text-violet-400"
          : "bg-violet-500/20 text-violet-300",
      position: { x: index === 0 ? "16%" : "84%", y: "62%" },
      href: paths.platform.product.offer(offer.id),
    });
  });

  if (data.valueLadder.length > 0) {
    const prices = data.valueLadder.map((s) => s.price).filter((p) => p > 0);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 0;

    nodes.push({
      id: "value-ladder",
      type: "value-ladder",
      title: "Escalera de valor",
      subtitle: `${data.valueLadder.length} escalones · $${min}-$${max}`,
      badge: "Escalera",
      badgeColor: "bg-green-500/15 text-green-400",
      position: { x: "50%", y: "82%" },
      href: paths.platform.product.valueLadder,
    });
  }

  nodes.push({
    id: "proposition",
    type: "proposition",
    title: "Propuesta de valor",
    subtitle: data.proposition.result.slice(0, 32),
    badge: "Mensaje",
    badgeColor: "bg-amber-500/15 text-amber-400",
    position: { x: "80%", y: "30%" },
    href: paths.platform.product.proposition,
  });

  return nodes;
}

export type ProductAgentContext = {
  primaryAvatar: CustomerAvatarRow | null;
  products: ProductRow[];
  frameworks: Pick<SalesFrameworkRow, "name" | "content" | "type">[];
  valueProposition?: ValueProposition | null;
};

export function buildProductContextText(ctx: ProductAgentContext): string {
  const propositionText = ctx.valueProposition
    ? `
PROPUESTA DE VALOR:
Ayudo a ${ctx.valueProposition.avatar} a lograr ${ctx.valueProposition.result}
sin ${ctx.valueProposition.painRemoved} en ${ctx.valueProposition.timeframe}.
`.trim()
    : "";

  const avatarText = ctx.primaryAvatar
    ? `
AVATAR PRINCIPAL DEL NEGOCIO:
- Nombre: ${ctx.primaryAvatar.name}
- Dolor principal: ${ctx.primaryAvatar.main_pain}
- Deseos: ${parseStringArray(ctx.primaryAvatar.desires).join(", ") || "—"}
- Objeciones frecuentes: ${parseStringArray(ctx.primaryAvatar.objections).join(", ") || "—"}
`.trim()
    : "";

  const productsText =
    ctx.products.length > 0
      ? `
PRODUCTOS DE LA ORGANIZACIÓN:
${ctx.products
  .map(
    (p) =>
      `- ${p.name} (${p.type ?? "otro"}): $${p.price ?? 0} ${p.currency ?? "USD"} ${p.billing_type ?? ""}`
  )
  .join("\n")}
`.trim()
      : "";

  const frameworksText =
    ctx.frameworks.length > 0
      ? `
FRAMEWORKS Y METODOLOGÍAS:
${ctx.frameworks
  .map(
    (f) =>
      `[${(f.type ?? "otro").toUpperCase()}] ${f.name}:\n${f.content.slice(0, 300)}...`
  )
  .join("\n\n")}
`.trim()
      : "";

  return [propositionText, avatarText, productsText, frameworksText]
    .filter(Boolean)
    .join("\n\n");
}
