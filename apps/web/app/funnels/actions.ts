"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes/paths";
import {
  DEFAULT_BINDINGS,
  FUNNEL_TEMPLATES,
  getFunnelSource,
  getInstrumentationTool,
  getSpineStage,
  isFunnelSourceId,
  isFunnelTemplateId,
  requireFunnelTemplate,
  resolvePeriod,
  sourcesForStage,
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

// ─── Configuración de fuentes por step ────────────────────────────────────────

export type StepBindingOption = {
  sourceId: string;
  label: string;
  description: string;
};

export type StepBindingRowView = {
  stepId: string;
  stepLabel: string;
  stageId: string;
  stageLabel: string;
  metricLabel: string;
  /** Fuente configurada hoy, o `null` si el paso no tiene ninguna. */
  currentSourceId: string | null;
  /** Fuentes que tienen sentido para la etapa de este paso. */
  options: StepBindingOption[];
  /** Herramienta que el documento fuente le asigna a este paso. */
  documentTool: string;
};

/** Devuelve el estado de configuración de fuentes de un embudo. */
export async function getFunnelBindingsAction(
  funnelId: string
): Promise<{ instanceName: string; templateLabel: string; rows: StepBindingRowView[] } | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: instance } = await supabase
    .from("funnel_instances")
    .select("id, name, template_id")
    .eq("organization_id", organizationId)
    .eq("id", funnelId)
    .maybeSingle();

  if (!instance || !isFunnelTemplateId(instance.template_id)) return null;

  const template = requireFunnelTemplate(instance.template_id);

  const { data: bindings } = await supabase
    .from("funnel_step_bindings")
    .select("step_id, source_id")
    .eq("organization_id", organizationId)
    .eq("funnel_instance_id", funnelId);

  const byStep = new Map((bindings ?? []).map((b) => [b.step_id, b.source_id]));

  return {
    instanceName: instance.name,
    templateLabel: template.label,
    rows: template.steps.map((step) => ({
      stepId: step.id,
      stepLabel: step.label,
      stageId: step.stageId,
      stageLabel: getSpineStage(step.stageId).label,
      metricLabel: step.metricLabel,
      currentSourceId: byStep.get(step.id) ?? null,
      options: sourcesForStage(step.stageId).map((source) => ({
        sourceId: source.id,
        label: source.label,
        description: source.description,
      })),
      documentTool: getInstrumentationTool(step.sourceHint).label,
    })),
  };
}

/**
 * Fija o borra la fuente de un paso.
 *
 * Pasar `sourceId: null` desconecta el paso: vuelve a resolver como "sin datos",
 * que es distinto de cero. Es una operación legítima, no un error.
 */
export async function setFunnelStepBindingAction(
  funnelId: string,
  stepId: string,
  sourceId: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: instance } = await supabase
    .from("funnel_instances")
    .select("id, template_id")
    .eq("organization_id", organizationId)
    .eq("id", funnelId)
    .maybeSingle();

  if (!instance || !isFunnelTemplateId(instance.template_id)) {
    return { ok: false, error: "Embudo no encontrado" };
  }

  const template = requireFunnelTemplate(instance.template_id);
  const step = template.steps.find((s) => s.id === stepId);
  if (!step) return { ok: false, error: "Paso desconocido para este embudo" };

  if (sourceId === null) {
    const { error } = await supabase
      .from("funnel_step_bindings")
      .delete()
      .eq("organization_id", organizationId)
      .eq("funnel_instance_id", funnelId)
      .eq("step_id", stepId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(paths.platform.funnels.detail(funnelId));
    return { ok: true };
  }

  if (!isFunnelSourceId(sourceId)) {
    return { ok: false, error: "Fuente desconocida" };
  }

  // Una fuente sólo puede alimentar una etapa para la que fue pensada: bindear
  // conteos de llamadas a la etapa Lead daría un número sin sentido.
  const source = getFunnelSource(sourceId)!;
  if (!(source.suitableFor as readonly string[]).includes(step.stageId)) {
    return {
      ok: false,
      error: `"${source.label}" no aplica a la etapa ${getSpineStage(step.stageId).label}`,
    };
  }

  const { error } = await supabase.from("funnel_step_bindings").upsert(
    {
      organization_id: organizationId,
      funnel_instance_id: funnelId,
      step_id: stepId,
      source_id: sourceId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "funnel_instance_id,step_id" }
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(paths.platform.funnels.detail(funnelId));
  return { ok: true };
}
