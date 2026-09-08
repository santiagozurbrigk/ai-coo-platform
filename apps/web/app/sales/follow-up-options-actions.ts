"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  BUILT_IN_CATALOG,
  buildFollowUpCatalog,
  isFollowUpBehavior,
  isFollowUpColor,
  isFollowUpKind,
  slugifyOptionLabel,
  type FollowUpBehavior,
  type FollowUpCatalog,
  type FollowUpColor,
  type FollowUpKind,
  type FollowUpOption,
} from "@/lib/sales/follow-up-options";
import { paths } from "@/routes";

/**
 * Los valores de seguimiento propios de la organización.
 *
 * Los de fábrica no viven en la base: se juntan con estos al leer. Así una
 * organización nueva ya tiene vocabulario, y borrar filas acá no deja a nadie
 * sin próximo paso posible.
 */

type OptionRow = {
  id: string;
  kind: FollowUpKind;
  slug: string;
  label: string;
  color: string;
  behavior: string;
  sort_order: number;
  archived_at: string | null;
};

function rowToOption(row: OptionRow): FollowUpOption {
  return {
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    label: row.label,
    // Un color o comportamiento que no reconocemos no rompe la fila: cae al
    // default visible. El dato que importa —el slug— se conserva igual.
    color: isFollowUpColor(row.color) ? row.color : "slate",
    behavior: isFollowUpBehavior(row.behavior) ? row.behavior : "needs_date",
    sortOrder: row.sort_order,
    builtIn: false,
    archived: row.archived_at !== null,
  };
}

/** Catálogo completo: de fábrica + propios, listo para la UI y para el motor. */
export async function getFollowUpCatalogAction(): Promise<FollowUpCatalog> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales_follow_up_options")
    .select("id, kind, slug, label, color, behavior, sort_order, archived_at")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true });

  // Sin catálogo propio la pantalla sigue funcionando con los de fábrica: es
  // preferible a dejar la tabla sin valores porque falló una query.
  if (error || !data) return BUILT_IN_CATALOG;

  return buildFollowUpCatalog((data as OptionRow[]).map(rowToOption));
}

export async function createFollowUpOptionAction(params: {
  kind: FollowUpKind;
  label: string;
  color?: FollowUpColor;
  behavior?: FollowUpBehavior;
}): Promise<{ ok: boolean; error?: string; option?: FollowUpOption }> {
  const organizationId = await requireOrganizationId();

  const label = params.label.trim();
  if (!label) return { ok: false, error: "El valor necesita un nombre." };
  if (label.length > 60) {
    return { ok: false, error: "El nombre no puede pasar de 60 caracteres." };
  }
  if (!isFollowUpKind(params.kind)) {
    return { ok: false, error: "Tipo de valor desconocido." };
  }

  // Una calificación sólo describe: no puede cerrar el hilo ni pedir fecha.
  const behavior: FollowUpBehavior =
    params.kind === "qualification" ? "neutral" : (params.behavior ?? "needs_date");
  if (params.kind === "next_action" && behavior === "neutral") {
    return {
      ok: false,
      error: "Un próximo paso tiene que pedir fecha o cerrar el hilo.",
    };
  }

  const slug = slugifyOptionLabel(label);
  const builtIns =
    params.kind === "next_action"
      ? BUILT_IN_CATALOG.nextActions
      : BUILT_IN_CATALOG.qualifications;
  if (builtIns.some((o) => o.slug === slug || o.label === label)) {
    return { ok: false, error: "Ya existe un valor con ese nombre." };
  }

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("sales_follow_up_options")
    .select("sort_order")
    .eq("organization_id", organizationId)
    .eq("kind", params.kind)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("sales_follow_up_options")
    .insert({
      organization_id: organizationId,
      kind: params.kind,
      slug,
      label,
      color: params.color ?? "slate",
      behavior,
      sort_order: ((last?.sort_order as number | undefined) ?? -1) + 1,
    })
    .select("id, kind, slug, label, color, behavior, sort_order, archived_at")
    .single();

  if (error) {
    // 23505: ya existe ese slug en la organización, probablemente archivado.
    if (error.code === "23505") {
      return { ok: false, error: "Ya existe un valor con ese nombre." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(paths.platform.sales.closing);
  return { ok: true, option: rowToOption(data as OptionRow) };
}

export async function updateFollowUpOptionAction(params: {
  id: string;
  label?: string;
  color?: FollowUpColor;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await requireOrganizationId();

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (params.label !== undefined) {
    const label = params.label.trim();
    if (!label) return { ok: false, error: "El valor necesita un nombre." };
    // El slug **no** se toca al renombrar: los turnos ya cargados lo apuntan.
    patch.label = label;
  }
  if (params.color !== undefined) patch.color = params.color;

  const supabase = await createClient();
  const { error } = await supabase
    .from("sales_follow_up_options")
    .update(patch)
    .eq("id", params.id)
    .eq("organization_id", organizationId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(paths.platform.sales.closing);
  return { ok: true };
}

/**
 * Archiva o desarchiva un valor propio.
 *
 * ⭐ **No se borra.** Hay turnos apuntando a este slug: borrarlo vaciaría ese
 * dato en silencio. Archivado desaparece del selector, pero las filas que ya lo
 * tenían lo siguen mostrando.
 */
export async function setFollowUpOptionArchivedAction(params: {
  id: string;
  archived: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sales_follow_up_options")
    .update({
      archived_at: params.archived ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("organization_id", organizationId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(paths.platform.sales.closing);
  return { ok: true };
}
