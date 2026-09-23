"use client";

/**
 * Alta y edición de una columna configurable.
 *
 * Dos cosas que el formulario hace explícitas, porque son las que evitan que
 * la configuración se pudra con el uso:
 *   · al editar, el tipo y la clave no se pueden tocar;
 *   · una opción ya guardada no se saca de la lista: se archiva.
 */

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  cn,
} from "@ai-coo/ui";
import { Archive, ArchiveRestore, Plus, Trash2 } from "lucide-react";
import { useHasAddOn } from "@/providers/permissions-provider";
import {
  FIELD_OPTION_COLORS,
  FIELD_SECTION_LABEL,
  FIELD_SECTIONS,
  FIELD_TYPES,
  type FieldDefinition,
  type FieldEntity,
  type FieldOption,
  type FieldOptionColor,
  type FieldSection,
  type FieldType,
} from "@/types/custom-fields";
import {
  FIELD_TYPE_HINT,
  FIELD_TYPE_LABEL,
  deriveFieldKey,
  fieldOptionColorVar,
  fieldTypeUsesOptions,
} from "@/lib/custom-fields";

const CONTROL_CLASS =
  "h-9 w-full rounded-md border border-border bg-background px-2 text-sm";

export type FieldDefinitionDraft = {
  label: string;
  description: string;
  fieldType: FieldType;
  options: FieldOption[];
  unit: string;
  /** Sólo para fechas: días de anticipación del aviso. Vacío = sin aviso. */
  alertDaysBefore: string;
  currency: "USD" | "ARS";
  isRequired: boolean;
  /** El apartado de la ficha donde se agrupa. `null` = suelta. */
  section: FieldSection | null;
  /** Si se dibuja como columna en la tabla de clientes. */
  showInTable: boolean;
};

function draftFrom(field: FieldDefinition | null): FieldDefinitionDraft {
  return {
    label: field?.label ?? "",
    description: field?.description ?? "",
    fieldType: field?.fieldType ?? "select",
    options: field?.options ?? [],
    unit: field?.unit ?? "",
    alertDaysBefore:
      field?.alertDaysBefore != null ? String(field.alertDaysBefore) : "",
    currency: field?.currency ?? "USD",
    isRequired: field?.isRequired ?? false,
    section: field?.section ?? null,
    // Una columna nueva no entra sola a la tabla: se elige. Es lo que evita
    // que configurar un dato de la ficha ensanche la planilla sin querer.
    showInTable: field?.showInTable ?? false,
  };
}

export function FieldDefinitionDialog({
  open,
  field,
  entity,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  /** `null` = alta. */
  field: FieldDefinition | null;
  /** La entidad de la columna. Al editar manda la del campo. */
  entity: FieldEntity;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (draft: FieldDefinitionDraft) => void;
}) {
  const [draft, setDraft] = useState<FieldDefinitionDraft>(() => draftFrom(field));

  useEffect(() => {
    if (open) setDraft(draftFrom(field));
  }, [open, field]);

  const isEdit = field !== null;
  /**
   * Agrupar en apartados y mostrar en la tabla son decisiones de la ficha del
   * cliente. Un win o un checkpoint no tienen ni apartados ni tabla, así que
   * ofrecer los controles ahí sería ofrecer algo que no hace nada.
   */
  const esCliente = (field?.entity ?? entity) === "client";
  /** Los apartados de la ficha son del add-on `growth_partners`. */
  const growthPartners = useHasAddOn("growth_partners");
  const usesOptions = fieldTypeUsesOptions(draft.fieldType);
  const derivedKey = isEdit ? field.key : deriveFieldKey(draft.label);
  /** Las opciones que ya están guardadas no se pueden sacar, sólo archivar. */
  const lockedValues = new Set((field?.options ?? []).map((option) => option.value));

  function patch(changes: Partial<FieldDefinitionDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function addOption() {
    patch({
      options: [
        ...draft.options,
        {
          value: "",
          label: "",
          color: FIELD_OPTION_COLORS[(draft.options.length % 6) + 1] ?? "neutral",
          archived: false,
        },
      ],
    });
  }

  function updateOption(index: number, changes: Partial<FieldOption>) {
    patch({
      options: draft.options.map((option, i) =>
        i === index ? { ...option, ...changes } : option
      ),
    });
  }

  /**
   * Al escribir la etiqueta de una opción nueva se le deriva el valor. Al
   * renombrar una ya guardada, el valor **no** se toca: es lo que hace que
   * renombrar no reescriba los datos.
   */
  function renameOption(index: number, label: string) {
    const option = draft.options[index];
    if (!option) return;
    const keepValue = lockedValues.has(option.value) && option.value !== "";
    updateOption(index, {
      label,
      value: keepValue ? option.value : deriveFieldKey(label),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar columna" : "Nueva columna"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "El nombre y las opciones se pueden cambiar. El tipo y la clave interna no: cambiarlos reescribiría los datos ya cargados."
              : "Definí una columna del tracker. Las opciones se cargan acá y se pueden cambiar después."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="field-label">Nombre</Label>
            <Input
              id="field-label"
              value={draft.label}
              onChange={(event) => patch({ label: event.target.value })}
              placeholder="Tipo de win"
              autoFocus
            />
            {derivedKey ? (
              <p className="text-xs text-muted-foreground">
                Clave interna: <code className="font-mono">{derivedKey}</code>
                {isEdit ? " — no cambia al renombrar" : ""}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="field-description">Ayuda (opcional)</Label>
            <Textarea
              id="field-description"
              value={draft.description}
              onChange={(event) => patch({ description: event.target.value })}
              rows={2}
              placeholder="Qué se espera cargar en esta columna."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="field-type">Tipo</Label>
            <select
              id="field-type"
              className={cn(CONTROL_CLASS, isEdit && "opacity-60")}
              value={draft.fieldType}
              disabled={isEdit}
              onChange={(event) => patch({ fieldType: event.target.value as FieldType })}
            >
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {FIELD_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {FIELD_TYPE_HINT[draft.fieldType]}
            </p>
          </div>

          {draft.fieldType === "number" ? (
            <div className="space-y-1.5">
              <Label htmlFor="field-unit">Unidad (opcional)</Label>
              <Input
                id="field-unit"
                value={draft.unit}
                onChange={(event) => patch({ unit: event.target.value })}
                placeholder="%, clientes, días"
              />
            </div>
          ) : null}

          {/*
            ⭐ El aviso de una fecha.
            Es lo que hace que un campo de fecha sirva para algo más que
            consultarlo: define a partir de cuándo el sistema lo marca. Con
            esto, "Próximo lanzamiento · avisar a 15 días" lo arma la
            organización que lo necesita, sin que el producto tenga que saber
            qué es un lanzamiento.
          */}
          {draft.fieldType === "date" ? (
            <div className="space-y-1.5">
              <Label htmlFor="field-alert-days">Avisarme cuando falten (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="field-alert-days"
                  inputMode="numeric"
                  className="w-24"
                  value={draft.alertDaysBefore}
                  onChange={(event) =>
                    patch({ alertDaysBefore: event.target.value.replace(/\D/g, "") })
                  }
                  placeholder="15"
                />
                <span className="text-sm text-muted-foreground">días o menos</span>
              </div>
              <p className="text-xs text-muted-foreground">
                La fecha se muestra en rojo cuando falte ese tiempo o menos.
                Dejalo vacío si no querés aviso.
              </p>
            </div>
          ) : null}

          {draft.fieldType === "currency" ? (
            <div className="space-y-1.5">
              <Label htmlFor="field-currency">Moneda</Label>
              <select
                id="field-currency"
                className={CONTROL_CLASS}
                value={draft.currency}
                onChange={(event) =>
                  patch({ currency: event.target.value as "USD" | "ARS" })
                }
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
          ) : null}

          {usesOptions ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opciones</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Agregar
                </Button>
              </div>

              {draft.options.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Todavía no hay opciones. Sin al menos una, la columna no se puede
                  completar.
                </p>
              ) : null}

              <div className="space-y-2">
                {draft.options.map((option, index) => {
                  const isLocked = lockedValues.has(option.value);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <ColorPicker
                        value={option.color}
                        onChange={(color) => updateOption(index, { color })}
                      />
                      <Input
                        value={option.label}
                        onChange={(event) => renameOption(index, event.target.value)}
                        placeholder="Nombre de la opción"
                        className={cn("flex-1", option.archived && "opacity-60")}
                      />
                      {isLocked ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title={
                            option.archived
                              ? "Volver a ofrecerla"
                              : "Archivar: deja de ofrecerse, los datos viejos la siguen mostrando"
                          }
                          onClick={() =>
                            updateOption(index, { archived: !option.archived })
                          }
                        >
                          {option.archived ? (
                            <ArchiveRestore className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Quitar"
                          onClick={() =>
                            patch({
                              options: draft.options.filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {esCliente && growthPartners ? (
            <div className="space-y-1.5">
              <Label htmlFor="field-section">Apartado de la ficha</Label>
              <select
                id="field-section"
                className={CONTROL_CLASS}
                value={draft.section ?? ""}
                onChange={(event) =>
                  patch({
                    section: event.target.value === ""
                      ? null
                      : (event.target.value as FieldSection),
                  })
                }
              >
                <option value="">Sin apartado (suelta)</option>
                {FIELD_SECTIONS.map((section) => (
                  <option key={section} value={section}>
                    {FIELD_SECTION_LABEL[section]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Las que tienen apartado se cargan por cada uno de los clientes
                del cliente, en la tarjeta «Clientes». Las sueltas son del
                cliente mismo.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.isRequired}
                onChange={(event) => patch({ isRequired: event.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              Obligatoria
            </label>

            {esCliente ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.showInTable}
                  onChange={(event) => patch({ showInTable: event.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                Mostrarla como columna en la tabla de clientes
              </label>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit(draft)}
            disabled={saving || draft.label.trim() === ""}
          >
            {saving ? "Guardando…" : isEdit ? "Guardar" : "Crear columna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: FieldOptionColor;
  onChange: (color: FieldOptionColor) => void;
}) {
  return (
    <select
      aria-label="Color de la opción"
      className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border bg-background text-transparent"
      style={{ backgroundColor: fieldOptionColorVar(value) }}
      value={value}
      onChange={(event) => onChange(event.target.value as FieldOptionColor)}
    >
      {FIELD_OPTION_COLORS.map((color) => (
        <option key={color} value={color} className="text-foreground">
          {color}
        </option>
      ))}
    </select>
  );
}
