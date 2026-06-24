"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { callClaudeJson } from "@/lib/ai/anthropic";
import { buildOrgContextText, getOrgContext } from "@/lib/ai/org-context";
import {
  rowToLaunchDetail,
  rowToLaunchSummary,
} from "@/lib/launches/mapper";
import { createClient } from "@/lib/supabase/server";
import {
  createLaunchSchema,
  firstZodError,
  recordLaunchMetricDataSchema,
  updateLaunchPatchSchema,
  uuidSchema,
} from "@/lib/validations";
import { paths } from "@/routes/paths";
import type {
  LaunchDetail,
  LaunchPickerOption,
  LaunchPostMortem,
  LaunchStatus,
  LaunchSummary,
} from "@/types/launches";

function revalidateLaunches(launchId?: string) {
  revalidatePath(paths.platform.lanzamientos);
  if (launchId) {
    revalidatePath(paths.platform.lanzamientosDetail(launchId));
  }
}

export async function getLaunchesAction(): Promise<LaunchSummary[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("launches")
    .select(
      `
      *,
      product:products(name, type, price, currency),
      workboard_tasks(count)
    `
    )
    .eq("organization_id", organizationId)
    .order("launch_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    rowToLaunchSummary(row as Record<string, unknown>)
  );
}

export async function getLaunchAction(
  launchId: string
): Promise<LaunchDetail | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("launches")
    .select(
      `
      *,
      product:products(name, type, price, currency),
      metrics:launch_metrics(*),
      tasks:workboard_tasks(
        id,
        title,
        area,
        status,
        actual_minutes,
        assignee:profiles!workboard_tasks_assignee_id_fkey(full_name, email)
      )
    `
    )
    .eq("id", launchId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) return null;
    throw new Error(error.message);
  }

  if (!data) return null;
  return rowToLaunchDetail(data as Record<string, unknown>);
}

export async function listLaunchPickerOptionsAction(): Promise<
  LaunchPickerOption[]
> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("launches")
    .select("id, name, status")
    .eq("organization_id", organizationId)
    .in("status", ["planning", "active"])
    .order("launch_date", { ascending: false, nullsFirst: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    status: row.status as LaunchStatus,
  }));
}

export async function getProductsForLaunchAction(): Promise<
  { id: string; name: string; type: string | null }[]
> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, type")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    if (isMissingTableError(error.message)) return [];
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    type: (row.type as string) ?? null,
  }));
}

export async function createLaunchAction(
  input: unknown
): Promise<LaunchSummary> {
  const parsed = createLaunchSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: launch, error } = await supabase
    .from("launches")
    .insert({
      organization_id: organizationId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      launch_date: data.launchDate || null,
      end_date: data.endDate || null,
      goal_revenue: data.goalRevenue ?? null,
      goal_clients: data.goalClients ?? null,
      product_id: data.productId || null,
      tags: data.tags ?? [],
      status: "planning",
      created_by: profile?.id ?? null,
    })
    .select(
      `
      *,
      product:products(name, type, price, currency),
      workboard_tasks(count)
    `
    )
    .single();

  if (error) throw new Error(error.message);

  revalidateLaunches();
  return rowToLaunchSummary(launch as Record<string, unknown>);
}

export async function updateLaunchAction(
  launchId: string,
  input: unknown
): Promise<{ ok: true }> {
  const idParsed = uuidSchema.safeParse(launchId);
  if (!idParsed.success) {
    throw new Error(firstZodError(idParsed.error));
  }

  const parsed = updateLaunchPatchSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.description !== undefined) {
    patch.description = data.description.trim() || null;
  }
  if (data.status !== undefined) patch.status = data.status;
  if (data.launchDate !== undefined) patch.launch_date = data.launchDate || null;
  if (data.endDate !== undefined) patch.end_date = data.endDate || null;
  if (data.goalRevenue !== undefined) patch.goal_revenue = data.goalRevenue;
  if (data.actualRevenue !== undefined) patch.actual_revenue = data.actualRevenue;
  if (data.goalClients !== undefined) patch.goal_clients = data.goalClients;
  if (data.actualClients !== undefined) patch.actual_clients = data.actualClients;
  if (data.productId !== undefined) patch.product_id = data.productId;

  const { error } = await supabase
    .from("launches")
    .update(patch)
    .eq("id", idParsed.data)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  revalidateLaunches(idParsed.data);
  return { ok: true };
}

export async function recordLaunchMetricAction(
  launchId: string,
  input: unknown
): Promise<{ ok: true }> {
  const idParsed = uuidSchema.safeParse(launchId);
  if (!idParsed.success) {
    throw new Error(firstZodError(idParsed.error));
  }

  const parsed = recordLaunchMetricDataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const validatedLaunchId = idParsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error: metricError } = await supabase.from("launch_metrics").upsert(
    {
      launch_id: validatedLaunchId,
      organization_id: organizationId,
      date: data.date,
      revenue: data.revenue,
      new_clients: data.newClients,
      conversations_started: data.conversationsStarted ?? 0,
      bookings: data.bookings ?? 0,
    },
    { onConflict: "launch_id,date" }
  );

  if (metricError) throw new Error(metricError.message);

  const { data: totals } = await supabase
    .from("launch_metrics")
    .select("revenue, new_clients")
    .eq("launch_id", validatedLaunchId)
    .eq("organization_id", organizationId);

  const actualRevenue = (totals ?? []).reduce(
    (sum, row) => sum + Number(row.revenue ?? 0),
    0
  );
  const actualClients = (totals ?? []).reduce(
    (sum, row) => sum + Number(row.new_clients ?? 0),
    0
  );

  await supabase
    .from("launches")
    .update({
      actual_revenue: actualRevenue,
      actual_clients: actualClients,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validatedLaunchId)
    .eq("organization_id", organizationId);

  revalidateLaunches(validatedLaunchId);
  return { ok: true };
}

export async function generateLaunchPostMortemAction(
  launchId: string
): Promise<LaunchPostMortem> {
  const idParsed = uuidSchema.safeParse(launchId);
  if (!idParsed.success) {
    throw new Error(firstZodError(idParsed.error));
  }

  const validatedLaunchId = idParsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const launch = await getLaunchAction(validatedLaunchId);
  if (!launch) throw new Error("Lanzamiento no encontrado");
  if (launch.status !== "completed") {
    throw new Error("Marcá el lanzamiento como completado antes del post-mortem");
  }

  const orgContext = await getOrgContext(organizationId);
  const orgContextText = buildOrgContextText(orgContext);

  const revenueAchieved = launch.goalRevenue
    ? Math.round((launch.actualRevenue / launch.goalRevenue) * 100)
    : null;

  const clientsAchieved = launch.goalClients
    ? Math.round((launch.actualClients / launch.goalClients) * 100)
    : null;

  const tasksCompleted = launch.tasks.filter((t) => t.status === "done").length;
  const totalTasks = launch.tasks.length;

  const prompt = `Analizá este lanzamiento de un negocio de infoproductos y generá un post-mortem ejecutivo en JSON.

LANZAMIENTO: ${launch.name}
Descripción: ${launch.description ?? "No especificada"}
Fechas: ${launch.launchDate ?? "—"} → ${launch.endDate ?? "En curso"}
Estado: ${launch.status}

RESULTADOS:
- Revenue: $${launch.actualRevenue} ${revenueAchieved ? `(${revenueAchieved}% del objetivo de $${launch.goalRevenue})` : ""}
- Clientes: ${launch.actualClients} ${clientsAchieved ? `(${clientsAchieved}% del objetivo de ${launch.goalClients})` : ""}
- Tareas completadas: ${tasksCompleted}/${totalTasks}

Devolvé ÚNICAMENTE un JSON:
{
  "summary": "<resumen ejecutivo en 3-4 oraciones>",
  "what_worked": ["<cosa que funcionó>"],
  "what_didnt_work": ["<cosa que no funcionó>"],
  "key_learnings": ["<aprendizaje clave>"],
  "next_launch_recommendations": ["<recomendación>"],
  "overall_rating": <1-10>
}`;

  const postMortem = await callClaudeJson<LaunchPostMortem>({
    task: "sales_analysis",
    cachedSystemPrompt: orgContextText,
    user: prompt,
    maxTokens: 1500,
    feature: "launch_post_mortem",
    organizationId,
  });

  if (!postMortem) {
    throw new Error("No se pudo generar el post-mortem. Verificá la API key de Claude.");
  }

  const { error } = await supabase
    .from("launches")
    .update({
      post_mortem: JSON.stringify(postMortem),
      post_mortem_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", validatedLaunchId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  revalidateLaunches(validatedLaunchId);
  return postMortem;
}
