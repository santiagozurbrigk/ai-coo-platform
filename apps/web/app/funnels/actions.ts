"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes/paths";
import {
  DEFAULT_BINDINGS,
  FUNNEL_TEMPLATES,
  isFunnelTemplateId,
  requireFunnelTemplate,
  resolvePeriod,
  type FunnelPeriodPresetId,
} from "@/lib/funnels";
import {
  resolveFunnel,
  type FunnelInstanceRow,
  type ResolvedFunnelData,
  type StepBindingRow,
} from "@/lib/funnels/resolve";

const INSTANCE_COLUMNS =
  "id, organization_id, template_id, name, product_id, currency, price_point, reporting_timezone, is_active";

/** Lista las instancias de embudo activas de la org. */
export async function listFunnelInstancesAction(): Promise<FunnelInstanceRow[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("funnel_instances")
    .select(INSTANCE_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[funnels] listFunnelInstances", error.message);
    return [];
  }

  // Una plantilla que ya no existe en código deja su instancia sin renderizable.
  return (data ?? []).filter((row) => isFunnelTemplateId(row.template_id)) as FunnelInstanceRow[];
}

/** Resuelve un embudo completo para el período pedido. */
export async function getFunnelAction(
  funnelId: string,
  presetId?: FunnelPeriodPresetId
): Promise<ResolvedFunnelData | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: instance, error } = await supabase
    .from("funnel_instances")
    .select(INSTANCE_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("id", funnelId)
    .maybeSingle();

  if (error || !instance || !isFunnelTemplateId(instance.template_id)) return null;

  const { data: bindings } = await supabase
    .from("funnel_step_bindings")
    .select("step_id, source_id")
    .eq("organization_id", organizationId)
    .eq("funnel_instance_id", funnelId);

  return resolveFunnel(
    supabase,
    instance as FunnelInstanceRow,
    (bindings ?? []) as StepBindingRow[],
    resolvePeriod(presetId)
  );
}

export type CreateFunnelInstanceInput = {
  templateId: string;
  name: string;
  currency?: string;
  pricePoint?: number;
};

/**
 * Crea una instancia y le aplica los bindings por defecto de su plantilla.
 *
 * Los steps sin binding por defecto quedan sin fuente a propósito: es más
 * honesto mostrarlos como huecos de instrumentación que inventarles un origen.
 */
export async function createFunnelInstanceAction(
  input: CreateFunnelInstanceInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  if (!isFunnelTemplateId(input.templateId)) {
    return { ok: false, error: "Tipo de embudo desconocido" };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, error: "El nombre no puede estar vacío" };

  const template = requireFunnelTemplate(input.templateId);

  const { data, error } = await supabase
    .from("funnel_instances")
    .insert({
      organization_id: organizationId,
      template_id: template.id,
      name,
      currency: input.currency ?? "USD",
      price_point: input.pricePoint ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[funnels] createFunnelInstance", error?.message);
    return { ok: false, error: error?.message ?? "No se pudo crear el embudo" };
  }

  const defaults = DEFAULT_BINDINGS[template.id] ?? {};
  const rows = Object.entries(defaults).map(([stepId, sourceId]) => ({
    organization_id: organizationId,
    funnel_instance_id: data.id,
    step_id: stepId,
    source_id: sourceId,
  }));

  if (rows.length > 0) {
    const { error: bindingError } = await supabase.from("funnel_step_bindings").insert(rows);
    if (bindingError) {
      console.error("[funnels] createFunnelInstance bindings", bindingError.message);
    }
  }

  revalidatePath(paths.platform.funnels.root);
  return { ok: true, id: data.id };
}

/** Catálogo de plantillas disponibles, para el formulario de alta. */
export async function listFunnelTemplatesAction() {
  return FUNNEL_TEMPLATES.map((t) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    badge: t.badge,
    stepCount: t.steps.length,
  }));
}
