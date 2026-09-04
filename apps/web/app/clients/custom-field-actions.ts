"use server";

/**
 * C0 · Campos configurables — CRUD del catálogo de columnas.
 *
 * Esta tabla es configuración, no datos del negocio. Las tres reglas que la
 * mantienen sana están en `lib/custom-fields/`, y acá se aplican:
 *   1. La clave se deriva al crear y **no se puede cambiar** (renombrar la
 *      etiqueta no toca ningún dato cargado).
 *   2. Una opción en uso no se borra: se archiva.
 *   3. Un campo archivado deja de ofrecerse pero sigue mostrándose.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import {
  FIELD_ENTITIES,
  FIELD_OPTION_COLORS,
  FIELD_TYPES,
  type FieldDefinition,
  type FieldDefinitionRow,
  type FieldEntity,
} from "@/types/custom-fields";
import {
  deriveFieldKey,
  deriveFieldKeyOrError,
  fieldTypeUsesOptions,
  rowToFieldDefinition,
} from "@/lib/custom-fields";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { firstZodError } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";

/**
 * Tablas donde puede estar cargado el valor de un campo.
 *
 * Ninguna existe todavía: las entrega el Encargo A (wins) y C2 (checkpoints).
 * `isFieldInUse` lo maneja — una tabla que no existe es un campo sin uso, no un
 * error. Cuando esas migraciones entren, el chequeo empieza a funcionar solo.
 */
const VALUES_TABLE: Record<FieldEntity, { table: string; column: string }> = {
  win: { table: "client_wins", column: "custom" },
  checkpoint: { table: "client_checkpoint_events", column: "metrics" },
};

const optionSchema = z.object({
  value: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1, "La opción necesita un nombre.").max(120),
  color: z.enum(FIELD_OPTION_COLORS).default("neutral"),
  archived: z.boolean().default(false),
});

const createSchema = z.object({
  entity: z.enum(FIELD_ENTITIES),
  label: z.string().trim().min(1, "La columna necesita un nombre.").max(120),
  description: z.string().trim().max(500).nullable().default(null),
  fieldType: z.enum(FIELD_TYPES),
  options: z.array(optionSchema).max(60).default([]),
  unit: z.string().trim().max(20).nullable().default(null),
  currency: z.enum(["USD", "ARS"]).nullable().default(null),
  isRequired: z.boolean().default(false),
});

/** La clave, el tipo y la entidad no se editan: cambiarlos reescribiría el pasado. */
const updateSchema = createSchema
  .omit({ entity: true, fieldType: true })
  .partial()
  .extend({ id: z.string().uuid() });

export type CreateFieldDefinitionInput = z.input<typeof createSchema>;
export type UpdateFieldDefinitionInput = z.input<typeof updateSchema>;

async function requireFounder() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "founder") {
    throw new Error("Solo el founder puede configurar las columnas");
  }
}

function revalidate() {
  revalidatePath(paths.platform.clients.customFields);
}

// ─── Lectura ────────────────────────────────────────────────────────────────

/**
 * Todas las columnas de la organización, archivadas incluidas.
 *
 * Devolverlas todas es deliberado: quien muestra un dato ya cargado necesita
 * las archivadas para no perder una columna que alguien archivó después.
 * Filtrar es trabajo de `activeFields` / `fieldsForValues`.
 */
export async function listFieldDefinitionsAction(
  entity?: FieldEntity
): Promise<FieldDefinition[]> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    let query = supabase
      .from("field_definitions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true });

    if (entity) query = query.eq("entity", entity);

    const { data, error } = await query;

    if (error) {
      if (isMissingTableError(error.message)) return [];
      console.error("[listFieldDefinitions]", error.message);
      return [];
    }

    return (data as FieldDefinitionRow[])
      .map(rowToFieldDefinition)
      .filter((field): field is FieldDefinition => field !== null);
  } catch {
    return [];
  }
}

export async function getCustomFieldsPageDataAction(): Promise<{
  fields: FieldDefinition[];
  canManage: boolean;
}> {
  const [fields, profile] = await Promise.all([
    listFieldDefinitionsAction(),
    getCurrentProfile(),
  ]);
  return { fields, canManage: profile?.role === "founder" };
}

// ─── Escritura ──────────────────────────────────────────────────────────────

export async function createFieldDefinitionAction(
  input: CreateFieldDefinitionInput
): Promise<MutationResult<FieldDefinition>> {
  return runMutation(async () => {
    await requireFounder();
    const organizationId = await requireOrganizationId();

    const parsed = createSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const values = parsed.data;

    const existing = await listFieldDefinitionsAction(values.entity);
    const key = deriveFieldKeyOrError(
      values.label,
      existing.map((field) => field.key)
    );
    if (!key.ok) throw new Error(key.error);

    assertOptionsMatchType(values.fieldType, values.options);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("field_definitions")
      .insert({
        organization_id: organizationId,
        entity: values.entity,
        key: key.key,
        label: values.label,
        description: values.description,
        field_type: values.fieldType,
        options: values.options,
        options_source: "inline",
        unit: values.fieldType === "number" ? values.unit : null,
        currency: values.fieldType === "currency" ? (values.currency ?? "USD") : null,
        is_required: values.isRequired,
        // Al final de la lista: una columna nueva no se mete en el medio de un
        // orden que alguien ya acomodó.
        sort_order: nextSortOrder(existing),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const field = rowToFieldDefinition(data as FieldDefinitionRow);
    if (!field) throw new Error("No se pudo leer la columna recién creada");

    revalidate();
    return field;
  });
}

export async function updateFieldDefinitionAction(
  input: UpdateFieldDefinitionInput
): Promise<MutationResult<FieldDefinition>> {
  return runMutation(async () => {
    await requireFounder();
    const organizationId = await requireOrganizationId();

    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const { id, ...changes } = parsed.data;

    const current = await findFieldOrThrow(id);

    if (changes.options !== undefined) {
      assertOptionsMatchType(current.fieldType, changes.options);
      assertNoOptionDisappears(current, changes.options);
    }

    const patch: Record<string, unknown> = {};
    // La etiqueta cambia; la clave no. Es la regla 1 y es lo que hace que
    // renombrar sea gratis.
    if (changes.label !== undefined) patch.label = changes.label;
    if (changes.description !== undefined) patch.description = changes.description;
    if (changes.options !== undefined) patch.options = changes.options;
    if (changes.isRequired !== undefined) patch.is_required = changes.isRequired;
    if (changes.unit !== undefined) {
      patch.unit = current.fieldType === "number" ? changes.unit : null;
    }
    if (changes.currency !== undefined) {
      patch.currency = current.fieldType === "currency" ? changes.currency : null;
    }

    if (Object.keys(patch).length === 0) return current;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("field_definitions")
      .update(patch)
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const field = rowToFieldDefinition(data as FieldDefinitionRow);
    if (!field) throw new Error("No se pudo leer la columna actualizada");

    revalidate();
    return field;
  });
}

/** Archivar o desarchivar. Es lo que reemplaza al borrado para una columna en uso. */
export async function setFieldDefinitionArchivedAction(
  id: string,
  archived: boolean
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    await requireFounder();
    const organizationId = await requireOrganizationId();

    const supabase = await createClient();
    const { error } = await supabase
      .from("field_definitions")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidate();
  });
}

/**
 * Borrado de verdad — sólo para el error de tipeo.
 *
 * Si la columna tiene aunque sea un dato cargado, se rechaza y se ofrece
 * archivar. Borrar una columna en uso dejaría datos huérfanos en el jsonb que
 * nadie podría volver a leer.
 */
export async function deleteFieldDefinitionAction(
  id: string
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    await requireFounder();
    const organizationId = await requireOrganizationId();

    const field = await findFieldOrThrow(id);
    if (await isFieldInUse(field)) {
      throw new Error(
        `"${field.label}" ya tiene datos cargados. Archivala en vez de borrarla: los datos viejos la siguen mostrando.`
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("field_definitions")
      .delete()
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidate();
  });
}

/** Reordenar: la pantalla manda la lista completa de una entidad, en orden. */
export async function reorderFieldDefinitionsAction(
  entity: FieldEntity,
  orderedIds: string[]
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    await requireFounder();
    const organizationId = await requireOrganizationId();

    const supabase = await createClient();
    for (const [index, id] of orderedIds.entries()) {
      const { error } = await supabase
        .from("field_definitions")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("organization_id", organizationId)
        .eq("entity", entity);
      if (error) throw new Error(error.message);
    }

    revalidate();
  });
}

// ─── Ayudas ─────────────────────────────────────────────────────────────────

function nextSortOrder(existing: readonly FieldDefinition[]): number {
  return existing.reduce((max, field) => Math.max(max, field.sortOrder + 1), 0);
}

async function findFieldOrThrow(id: string): Promise<FieldDefinition> {
  const all = await listFieldDefinitionsAction();
  const field = all.find((candidate) => candidate.id === id);
  if (!field) throw new Error("La columna no existe");
  return field;
}

function assertOptionsMatchType(
  fieldType: FieldDefinition["fieldType"],
  options: readonly { value: string }[]
) {
  if (!fieldTypeUsesOptions(fieldType) && options.length > 0) {
    throw new Error("Sólo los campos de lista llevan opciones");
  }
  const values = options.map((option) => option.value);
  if (new Set(values).size !== values.length) {
    throw new Error("Hay dos opciones con el mismo valor");
  }
}

/**
 * Una opción que ya existe no puede desaparecer de la lista: se archiva.
 *
 * Sin este corte, editar la lista sería una forma silenciosa de borrar el
 * pasado — los datos que la usaban quedarían mostrando un valor que ya no
 * significa nada.
 */
function assertNoOptionDisappears(
  current: FieldDefinition,
  next: readonly { value: string }[]
) {
  const nextValues = new Set(next.map((option) => option.value));
  const missing = current.options.filter((option) => !nextValues.has(option.value));
  if (missing.length > 0) {
    throw new Error(
      `No se puede sacar "${missing[0]?.label}": archivala para que los datos viejos la sigan mostrando.`
    );
  }
}

/**
 * ¿Hay algún dato cargado con esta columna?
 *
 * La tabla de valores todavía no existe (la traen A y C2). Una tabla ausente
 * cuenta como "sin uso" — que es la verdad hoy — y el chequeo empieza a valer
 * solo cuando esas migraciones entren.
 */
async function isFieldInUse(field: FieldDefinition): Promise<boolean> {
  const target = VALUES_TABLE[field.entity];
  const supabase = await createClient();

  const { count, error } = await supabase
    .from(target.table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", field.organizationId)
    .not(`${target.column}->>${field.key}`, "is", null);

  if (error) {
    if (isMissingTableError(error.message)) return false;
    // Ante la duda, no se borra: es la opción que no pierde datos.
    console.error("[isFieldInUse]", error.message);
    return true;
  }

  return (count ?? 0) > 0;
}

// ─── Ejemplos ───────────────────────────────────────────────────────────────

/**
 * Carga la columna "Tipo de win" con las opciones que propone el plan.
 *
 * La pantalla nace vacía a propósito —no queremos datos que después haya que
 * borrar—, pero un estado vacío sin una salida es una pared. Esto es la salida:
 * un punto de partida explícito, que se pide apretando un botón.
 */
export async function seedExampleWinFieldAction(): Promise<
  MutationResult<FieldDefinition>
> {
  const labels = [
    "Facturación",
    "Hito",
    "Testimonio",
    "Métrica",
    "Lanzamiento",
    "Mentalidad",
    "Otro",
  ];

  return createFieldDefinitionAction({
    entity: "win",
    label: "Tipo de win",
    description: "Qué clase de logro es. Cambiá las opciones cuando el uso las revele.",
    fieldType: "select",
    options: labels.map((label, index) => ({
      value: deriveFieldKey(label),
      label,
      color: index === labels.length - 1 ? "neutral" : `cat-${(index % 6) + 1}`,
      archived: false,
    })),
  } as CreateFieldDefinitionInput);
}
