"use client";

/**
 * El control con el que se carga el valor de un campo configurable.
 *
 * Par del `FieldValueCell`: uno muestra, este pide. Los dos los usan el tracker
 * de wins (Encargo A) y el registro de checkpoints (C2), así que un tipo nuevo
 * de campo se soporta acá una sola vez.
 */

import { Input, Label, Textarea, cn } from "@ai-coo/ui";
import type { FieldDefinition } from "@/types/custom-fields";
import {
  MAX_TEXT_LENGTH,
  resolveFieldOptions,
  type ResolveOptionsContext,
} from "@/lib/custom-fields";

const CONTROL_CLASS =
  "h-9 w-full rounded-md border border-border bg-background px-2 text-sm";

export function FieldValueInput({
  field,
  value,
  onChange,
  context,
  error,
  className,
}: {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  context?: ResolveOptionsContext;
  error?: string;
  className?: string;
}) {
  const inputId = `custom-field-${field.key}`;
  const { available } = resolveFieldOptions(field, context);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={inputId}>
        {field.label}
        {field.isRequired ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>

      {renderControl()}

      {field.description ? (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );

  function renderControl() {
    switch (field.fieldType) {
      case "select":
        return (
          <select
            id={inputId}
            className={CONTROL_CLASS}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value || null)}
          >
            <option value="">Sin definir</option>
            {available.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "multi_select": {
        const selected = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="flex flex-wrap gap-1.5" id={inputId}>
            {available.map((option) => {
              const isOn = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    onChange(
                      isOn
                        ? selected.filter((entry) => entry !== option.value)
                        : [...selected, option.value]
                    )
                  }
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    isOn
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
            {available.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Esta columna todavía no tiene opciones cargadas.
              </p>
            ) : null}
          </div>
        );
      }

      case "number":
      case "currency":
        return (
          <div className="flex items-center gap-2">
            <Input
              id={inputId}
              inputMode="decimal"
              value={value === null || value === undefined ? "" : String(value)}
              onChange={(event) => onChange(event.target.value)}
              placeholder={field.fieldType === "currency" ? "0" : ""}
            />
            {field.fieldType === "currency" ? (
              <span className="text-xs text-muted-foreground">
                {field.currency ?? "USD"}
              </span>
            ) : field.unit ? (
              <span className="text-xs text-muted-foreground">{field.unit}</span>
            ) : null}
          </div>
        );

      case "date":
        return (
          <Input
            id={inputId}
            type="date"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value || null)}
          />
        );

      case "text":
        /*
          ⭐ Textarea y no `Input`: un campo de texto guarda tanto «Ticket y
          modalidad» como un avatar de tres párrafos, y un input de una línea
          **descarta los saltos al pegarlos** — el texto entra aplastado en un
          renglón y no hay forma de recuperarlo. Tres filas alcanzan para que
          se note que se puede escribir de más, y crece tirando de la esquina.
        */
        return renderTextarea();
    }
  }

  /**
   * El área de texto, con el contador que aparece cuando el texto se acerca al
   * techo.
   *
   * ⭐ Sin esto el límite sólo se conoce **chocándolo**: se pega un texto
   * largo, se aprieta Guardar y recién ahí aparece un error — y como la tarjeta
   * guarda los campos del cliente de una sola vez, ese error tira abajo también
   * lo que se escribió en los otros. El contador se muestra desde el 80% para
   * no ensuciar el formulario cuando faltan 19.000 caracteres.
   */
  function renderTextarea() {
    const text = typeof value === "string" ? value : "";
    const usados = text.trim().length;
    const cerca = usados >= MAX_TEXT_LENGTH * 0.8;
    const pasado = usados > MAX_TEXT_LENGTH;

    return (
      <>
        <Textarea
          id={inputId}
          rows={3}
          className={cn(
            "min-h-[72px] resize-y",
            pasado ? "border-destructive focus-visible:ring-destructive" : null
          )}
          value={text}
          onChange={(event) => onChange(event.target.value)}
        />
        {cerca ? (
          <p
            className={cn(
              "text-right text-xs tabular-nums",
              pasado ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {usados.toLocaleString("es-AR")} / {MAX_TEXT_LENGTH.toLocaleString("es-AR")}
            {pasado ? " — no entra, recortá o dejá un link" : null}
          </p>
        ) : null}
      </>
    );
  }
}
