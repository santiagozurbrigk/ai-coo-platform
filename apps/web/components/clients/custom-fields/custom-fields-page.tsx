"use client";

/**
 * C0 · Pantalla de configuración de columnas.
 *
 * Es la que convierte "hay que hacer una migración" en "hay que abrir una
 * pantalla". Dos solapas —Wins y Checkpoints—, porque una columna pertenece a
 * una entidad y nunca a las dos.
 */

import { useMemo, useState, useTransition } from "react";
import {
  Badge,
  Button,
  GlassPanel,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "@ai-coo/ui";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/providers/toast-provider";
import type { MutationResult } from "@/lib/server/action-result";
import {
  FIELD_ENTITIES,
  type FieldDefinition,
  type FieldEntity,
} from "@/types/custom-fields";
import {
  FIELD_ENTITY_HINT,
  FIELD_ENTITY_LABEL,
  FIELD_TYPE_LABEL,
  fieldOptionColorVar,
  fieldTypeUsesOptions,
} from "@/lib/custom-fields";
import {
  createFieldDefinitionAction,
  deleteFieldDefinitionAction,
  listFieldDefinitionsAction,
  reorderFieldDefinitionsAction,
  seedExampleWinFieldAction,
  setFieldDefinitionArchivedAction,
  updateFieldDefinitionAction,
} from "@/app/clients/custom-field-actions";
import {
  FieldDefinitionDialog,
  type FieldDefinitionDraft,
} from "@/components/clients/custom-fields/field-definition-dialog";

export function CustomFieldsPage({
  initialFields,
  canManage,
}: {
  initialFields: FieldDefinition[];
  canManage: boolean;
}) {
  const { push } = useToast();
  const [fields, setFields] = useState(initialFields);
  const [entity, setEntity] = useState<FieldEntity>("win");
  const [editing, setEditing] = useState<FieldDefinition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const byEntity = useMemo(
    () => fields.filter((field) => field.entity === entity),
    [fields, entity]
  );

  async function refresh() {
    setFields(await listFieldDefinitionsAction());
  }

  function run(operation: () => Promise<MutationResult<unknown>>) {
    startTransition(async () => {
      const result = await operation();
      if (!result.success) {
        push({ title: "No se pudo guardar", description: result.error });
        return;
      }
      await refresh();
    });
  }

  function openCreate() {
    setEditing(null);
    setDialogError(null);
    setDialogOpen(true);
  }

  function openEdit(field: FieldDefinition) {
    setEditing(field);
    setDialogError(null);
    setDialogOpen(true);
  }

  function submitDialog(draft: FieldDefinitionDraft) {
    setDialogError(null);
    startTransition(async () => {
      const payload = {
        label: draft.label,
        description: draft.description.trim() || null,
        options: draft.options,
        unit: draft.unit.trim() || null,
        currency: draft.currency,
        isRequired: draft.isRequired,
      };

      const result = editing
        ? await updateFieldDefinitionAction({ id: editing.id, ...payload })
        : await createFieldDefinitionAction({
            entity,
            fieldType: draft.fieldType,
            ...payload,
          });

      if (!result.success) {
        setDialogError(result.error);
        return;
      }

      setDialogOpen(false);
      await refresh();
      push({
        title: editing ? "Columna actualizada" : "Columna creada",
        variant: "success",
      });
    });
  }

  function move(field: FieldDefinition, direction: -1 | 1) {
    const ordered = byEntity.map((entry) => entry.id);
    const from = ordered.indexOf(field.id);
    const to = from + direction;
    if (to < 0 || to >= ordered.length) return;
    [ordered[from], ordered[to]] = [ordered[to] as string, ordered[from] as string];
    run(() => reorderFieldDefinitionsAction(entity, ordered));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Campos personalizados</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Las columnas del tracker de wins y las métricas que se piden al registrar un
            checkpoint. Se definen acá, sin tocar código.
          </p>
        </div>
        {canManage ? (
          <Button onClick={openCreate} disabled={pending}>
            <Plus className="mr-1 h-4 w-4" />
            Nueva columna
          </Button>
        ) : null}
      </div>

      {!canManage ? (
        <GlassPanel className="p-4 text-sm text-muted-foreground">
          Solo el founder puede cambiar esta configuración. Podés ver cómo está armada.
        </GlassPanel>
      ) : null}

      <Tabs value={entity} onValueChange={(value) => setEntity(value as FieldEntity)}>
        <TabsList>
          {FIELD_ENTITIES.map((key) => (
            <TabsTrigger key={key} value={key}>
              {FIELD_ENTITY_LABEL[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        {FIELD_ENTITIES.map((key) => (
          <TabsContent key={key} value={key} className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">{FIELD_ENTITY_HINT[key]}</p>

            {byEntity.length === 0 ? (
              <EmptyState
                icon={<SlidersHorizontal className="h-6 w-6" />}
                title="Todavía no hay columnas"
                description={
                  key === "win"
                    ? "Creá la primera, o empezá con una propuesta de ejemplo que después vas a poder cambiar."
                    : "Creá la primera columna: es lo que se va a pedir al registrar un checkpoint."
                }
                action={
                  canManage ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button onClick={openCreate} disabled={pending}>
                        <Plus className="mr-1 h-4 w-4" />
                        Nueva columna
                      </Button>
                      {key === "win" ? (
                        <Button
                          variant="outline"
                          disabled={pending}
                          onClick={() => run(seedExampleWinFieldAction)}
                        >
                          Cargar &quot;Tipo de win&quot; de ejemplo
                        </Button>
                      ) : null}
                    </div>
                  ) : undefined
                }
              />
            ) : (
              byEntity.map((field, index) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  canManage={canManage}
                  pending={pending}
                  isFirst={index === 0}
                  isLast={index === byEntity.length - 1}
                  onEdit={() => openEdit(field)}
                  onMove={(direction) => move(field, direction)}
                  onToggleArchive={() =>
                    run(() =>
                      setFieldDefinitionArchivedAction(field.id, field.archivedAt === null)
                    )
                  }
                  onDelete={() => run(() => deleteFieldDefinitionAction(field.id))}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <FieldDefinitionDialog
        open={dialogOpen}
        field={editing}
        saving={pending}
        error={dialogError}
        onClose={() => setDialogOpen(false)}
        onSubmit={submitDialog}
      />
    </div>
  );
}

function FieldRow({
  field,
  canManage,
  pending,
  isFirst,
  isLast,
  onEdit,
  onMove,
  onToggleArchive,
  onDelete,
}: {
  field: FieldDefinition;
  canManage: boolean;
  pending: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}) {
  const isArchived = field.archivedAt !== null;
  const active = field.options.filter((option) => !option.archived);

  return (
    <GlassPanel className={cn("p-4", isArchived && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{field.label}</span>
            <Badge variant="outline">{FIELD_TYPE_LABEL[field.fieldType]}</Badge>
            {field.isRequired ? <Badge variant="secondary">Obligatoria</Badge> : null}
            {isArchived ? <Badge variant="warning">Archivada</Badge> : null}
            {field.optionsSource === "journey_stages" ? (
              <Badge variant="secondary">Opciones del recorrido</Badge>
            ) : null}
          </div>

          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}

          {fieldTypeUsesOptions(field.fieldType) ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {active.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  Sin opciones cargadas
                </span>
              ) : (
                active.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2 py-0.5 text-xs"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: fieldOptionColorVar(option.color) }}
                    />
                    {option.label}
                  </span>
                ))
              )}
              {field.options.length > active.length ? (
                <span className="text-xs text-muted-foreground">
                  +{field.options.length - active.length} archivada
                  {field.options.length - active.length > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
          ) : null}

          <p className="text-[11px] text-muted-foreground">
            Clave: <code className="font-mono">{field.key}</code>
          </p>
        </div>

        {canManage ? (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Subir"
              disabled={pending || isFirst}
              onClick={() => onMove(-1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Bajar"
              disabled={pending || isLast}
              onClick={() => onMove(1)}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Editar"
              disabled={pending}
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={
                isArchived
                  ? "Volver a ofrecerla"
                  : "Archivar: deja de ofrecerse, los datos viejos la siguen mostrando"
              }
              disabled={pending}
              onClick={onToggleArchive}
            >
              {isArchived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Borrar (sólo si nadie la usó todavía)"
              disabled={pending}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </GlassPanel>
  );
}
