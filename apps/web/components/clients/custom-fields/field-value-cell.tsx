"use client";

/**
 * ⭐ La pieza compartida de C0: cómo se ve el valor de un campo configurable.
 *
 * La usan el tracker de wins (Encargo A) y el registro de checkpoints (C2). Si
 * hace falta mostrar un valor configurable en algún lado, se usa esto — no se
 * escribe una segunda forma de pintar lo mismo.
 */

import { Badge, cn } from "@ai-coo/ui";
import { AlertTriangle } from "lucide-react";
import type { FieldDefinition } from "@/types/custom-fields";
import {
  fieldOptionColorVar,
  formatFieldValue,
  type ResolveOptionsContext,
} from "@/lib/custom-fields";

export function FieldValueCell({
  field,
  value,
  context,
  className,
}: {
  field: FieldDefinition;
  value: unknown;
  context?: ResolveOptionsContext;
  className?: string;
}) {
  const formatted = formatFieldValue(field, value, context);

  // Sin dato: un guion. Nunca un cero — un número que nadie cargó no es cero.
  if (formatted.isEmpty) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const usesBadges = field.fieldType === "select" || field.fieldType === "multi_select";

  if (!usesBadges) {
    return <span className={cn("text-sm tabular-nums", className)}>{formatted.parts[0]?.text}</span>;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {formatted.parts.map((part, index) => (
        <Badge
          key={`${part.text}-${index}`}
          variant="outline"
          className={cn(
            "gap-1 border-border/60 font-normal",
            part.option?.archived && "opacity-60"
          )}
          // El color sale del token de la opción, que sigue el tema claro/oscuro.
          style={
            part.option && part.option.color !== "neutral"
              ? { borderColor: fieldOptionColorVar(part.option.color) }
              : undefined
          }
        >
          {part.unknownOption ? (
            <AlertTriangle
              className="h-3 w-3 text-warning"
              aria-label="Esta opción ya no existe en la configuración"
            />
          ) : null}
          {part.text}
          {part.option?.archived ? (
            <span className="text-[10px] text-muted-foreground">archivada</span>
          ) : null}
        </Badge>
      ))}
    </div>
  );
}
