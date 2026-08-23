"use server";

import { revalidatePath } from "next/cache";
import { requireAuthContext } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes/paths";

// ---------------------------------------------------------------------------
// Tipos exportados (usados también en agent/actions.ts onToolCall)
// ---------------------------------------------------------------------------

export type WorkboardTaskInput = {
  title: string;
  description?: string;
  area?: "marketing" | "ventas" | "operaciones" | "finanzas" | "clientes" | "general";
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
  assignee_name?: string | null;
  tags?: string[];
};

export type WorkboardTaskUpdates = {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "review" | "done";
  area?: "marketing" | "ventas" | "operaciones" | "finanzas" | "clientes" | "general";
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
  assignee_name?: string | null;
  tags?: string[];
};

// ---------------------------------------------------------------------------
// Helper privado
// ---------------------------------------------------------------------------

async function resolveAssigneeId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  assigneeName: string | null | undefined
): Promise<string | null> {
  const name = assigneeName?.trim();
  if (!name) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("organization_id", orgId)
    .ilike("full_name", name)
    .limit(1)
    .maybeSingle();

  return (profile?.id as string | undefined) ?? null;
}

// ---------------------------------------------------------------------------
// Buscar tareas en el Tablero de Trabajo
// ---------------------------------------------------------------------------

export async function searchWorkboardTasksAction(input: {
  query: string;
  status?: "todo" | "in_progress" | "review" | "done";
}): Promise<{
  ok: boolean;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    area: string;
    priority: string;
    due_date: string | null;
    assignee_id: string | null;
  }>;
  error?: string;
}> {
  try {
    const query = input.query.trim();
    if (!query) {
      return { ok: false, tasks: [], error: "La búsqueda no puede estar vacía." };
    }

    const { orgId } = await requireAuthContext();
    const supabase = await createClient();

    let request = supabase
      .from("workboard_tasks")
      .select("id, title, status, area, priority, due_date, assignee_id")
      .eq("organization_id", orgId)
      .ilike("title", `%${query}%`)
      .limit(10);

    if (input.status) {
      request = request.eq("status", input.status);
    }

    const { data, error } = await request;

    if (error) {
      return { ok: false, tasks: [], error: error.message };
    }

    return {
      ok: true,
      tasks: (data ?? []).map((row) => ({
        id: row.id as string,
        title: row.title as string,
        status: row.status as string,
        area: row.area as string,
        priority: row.priority as string,
        due_date: (row.due_date as string | null) ?? null,
        assignee_id: (row.assignee_id as string | null) ?? null,
      })),
    };
  } catch (err) {
    return {
      ok: false,
      tasks: [],
      error: err instanceof Error ? err.message : "Error al buscar tareas.",
    };
  }
}

// ---------------------------------------------------------------------------
// Actualizar tarea existente
// ---------------------------------------------------------------------------

export async function updateWorkboardTaskAction(input: {
  task_id: string;
  updates: WorkboardTaskUpdates;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const taskId = input.task_id.trim();
    if (!taskId) {
      return { ok: false, error: "ID de tarea requerido." };
    }

    const { orgId } = await requireAuthContext();
    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
      .from("workboard_tasks")
      .select("id")
      .eq("id", taskId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (existingError) {
      return { ok: false, error: existingError.message };
    }
    if (!existing) {
      return { ok: false, error: "Tarea no encontrada en tu organización." };
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const { updates } = input;

    if (updates.title !== undefined) patch.title = updates.title.trim();
    if (updates.description !== undefined) {
      patch.description = updates.description.trim();
    }
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.area !== undefined) patch.area = updates.area;
    if (updates.priority !== undefined) patch.priority = updates.priority;
    if (updates.due_date !== undefined) patch.due_date = updates.due_date || null;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.assignee_name !== undefined) {
      patch.assignee_id = await resolveAssigneeId(
        supabase,
        orgId,
        updates.assignee_name
      );
    }

    if (Object.keys(patch).length === 1) {
      return { ok: false, error: "No hay campos para actualizar." };
    }

    const { error: updateError } = await supabase
      .from("workboard_tasks")
      .update(patch)
      .eq("id", taskId)
      .eq("organization_id", orgId);

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    revalidatePath(paths.platform.workboard.root);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error al actualizar la tarea.",
    };
  }
}

// ---------------------------------------------------------------------------
// Crear tareas nuevas
// ---------------------------------------------------------------------------

export async function createWorkboardTasksAction(input: {
  tasks: WorkboardTaskInput[];
}): Promise<{ ok: boolean; created: number; taskIds: string[]; error?: string }> {
  try {
    const { orgId } = await requireAuthContext();
    const tasks = input.tasks.filter((task) => task.title?.trim());
    if (!tasks.length) {
      return { ok: false, created: 0, taskIds: [], error: "No hay tareas para crear." };
    }

    const supabase = await createClient();

    const { data: activeSprint } = await supabase
      .from("sprints")
      .select("id")
      .eq("organization_id", orgId)
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const activeSprintId = (activeSprint?.id as string | undefined) ?? null;

    const { data: maxPosRow, error: maxPosError } = await supabase
      .from("workboard_tasks")
      .select("position")
      .eq("organization_id", orgId)
      .eq("status", "todo")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxPosError) {
      return { ok: false, created: 0, taskIds: [], error: maxPosError.message };
    }

    let nextPosition = Number(maxPosRow?.position ?? 0);
    const rows: Record<string, unknown>[] = [];

    for (const task of tasks) {
      const assigneeId = await resolveAssigneeId(
        supabase,
        orgId,
        task.assignee_name
      );

      nextPosition += 1;
      rows.push({
        organization_id: orgId,
        title: task.title.trim(),
        description: task.description?.trim() ?? "",
        status: "todo",
        area: task.area ?? "general",
        priority: task.priority ?? "medium",
        assignee_id: assigneeId,
        due_date: task.due_date || null,
        tags: task.tags ?? [],
        sprint_id: activeSprintId,
        position: nextPosition,
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("workboard_tasks")
      .insert(rows)
      .select("id");

    if (insertError) {
      return { ok: false, created: 0, taskIds: [], error: insertError.message };
    }

    revalidatePath(paths.platform.workboard.root);

    const taskIds = (inserted ?? []).map((row) => row.id as string);
    return { ok: true, created: taskIds.length, taskIds };
  } catch (err) {
    return {
      ok: false,
      created: 0,
      taskIds: [],
      error: err instanceof Error ? err.message : "Error al crear tareas en el tablero.",
    };
  }
}
