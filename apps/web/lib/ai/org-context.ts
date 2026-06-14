import { createAdminClient } from "@/lib/supabase/admin";

export interface OrgContext {
  orgName: string;
  industry?: string;
  salesScript?: string;
  activeSOPs?: Array<{ title: string; content: string; department: string }>;
  primaryAvatar?: Record<string, unknown>;
  products?: Array<Record<string, unknown>>;
  frameworks?: Array<Record<string, unknown>>;
}

const orgContextCache = new Map<
  string,
  { context: OrgContext; cachedAt: number }
>();

const ORG_CONTEXT_TTL = 10 * 60 * 1000;

export async function getOrgContext(organizationId: string): Promise<OrgContext> {
  const cached = orgContextCache.get(organizationId);
  if (cached && Date.now() - cached.cachedAt < ORG_CONTEXT_TTL) {
    return cached.context;
  }

  const supabase = createAdminClient();

  const [org, sops, avatar, products, frameworks, salesScript] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .maybeSingle(),

      supabase
        .from("sops")
        .select("title, content, department")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .limit(10),

      supabase
        .from("customer_avatars")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_primary", true)
        .maybeSingle(),

      supabase
        .from("products")
        .select("name, description, type, price, currency")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .limit(5),

      supabase
        .from("sales_frameworks")
        .select("name, content, type")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .limit(5),

      supabase
        .from("sales_scripts")
        .select("sections")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  const context: OrgContext = {
    orgName: org.data?.name ?? "la organización",
    salesScript: salesScript.data
      ? JSON.stringify(salesScript.data.sections)
      : undefined,
    activeSOPs: sops.data ?? [],
    primaryAvatar: avatar.data ?? undefined,
    products: products.data ?? [],
    frameworks: frameworks.data ?? [],
  };

  orgContextCache.set(organizationId, {
    context,
    cachedAt: Date.now(),
  });

  return context;
}

export function invalidateOrgContext(organizationId: string): void {
  orgContextCache.delete(organizationId);
}

export function buildOrgContextText(context: OrgContext): string {
  const sections: string[] = [];

  sections.push(`ORGANIZACIÓN: ${context.orgName}`);
  if (context.industry) {
    sections.push(`Industria: ${context.industry}`);
  }

  if (context.primaryAvatar) {
    const avatar = context.primaryAvatar;
    sections.push(`
CLIENTE IDEAL:
- Nombre del avatar: ${avatar.name}
- Dolor principal: ${avatar.main_pain}
- Deseos: ${(avatar.desires as string[])?.join(", ")}
- Objeciones frecuentes: ${(avatar.objections as string[])?.join(", ")}
- Dónde está: ${avatar.where_they_hang}
- Cómo habla: ${avatar.language_they_use}`);
  }

  if (context.products?.length) {
    sections.push(`
PRODUCTOS:
${context.products
  .map((p) => `- ${p.name} (${p.type}): $${p.price} ${p.currency}`)
  .join("\n")}`);
  }

  if (context.activeSOPs?.length) {
    sections.push(`
SOPs ACTIVOS:
${context.activeSOPs
  .map(
    (s) =>
      `[${s.department?.toUpperCase()}] ${s.title}:\n${s.content?.slice(0, 300)}...`
  )
  .join("\n\n")}`);
  }

  if (context.frameworks?.length) {
    sections.push(`
FRAMEWORKS DE VENTAS:
${context.frameworks
  .map(
    (f) =>
      `[${String(f.type ?? "").toUpperCase()}] ${f.name}:\n${String(f.content ?? "").slice(0, 300)}...`
  )
  .join("\n\n")}`);
  }

  if (context.salesScript) {
    sections.push(`
GUIÓN DE VENTAS:
${context.salesScript.slice(0, 500)}`);
  }

  return sections.join("\n\n");
}
