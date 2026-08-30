import { cn } from "@ai-coo/ui";
import type { InstrumentationToolId } from "@/lib/funnels";

/**
 * Etiqueta de procedencia de una cifra.
 *
 * ⭐ **Existe porque el documento fuente lo declara no negociable:**
 *
 *   "label each figure with its source — [Meta] for platform-reported, [Hyros]
 *    for attributed. The two never match exactly, and a report that mixes them
 *    without labels is how bad decisions get made."
 *
 * La forma `[Meta]` con corchetes es literal del documento y por eso se conserva
 * en vez de traducirse a un badge de color: es una convención de lectura, no
 * decoración.
 */

/** Nombre corto de cada herramienta, para la etiqueta entre corchetes. */
const TAG_BY_TOOL: Record<InstrumentationToolId, string> = {
  meta_ads: "Meta",
  hyros: "Hyros",
  landing_page: "VTurb",
  webinar_platform: "WebinarJam",
  application_form: "Formulario",
  calendly: "Calendly",
  crm_pipeline: "CRM",
  checkout: "Checkout",
};

export function sourceTagLabel(tool: InstrumentationToolId): string {
  return TAG_BY_TOOL[tool] ?? tool;
}

export function SourceTag({
  tool,
  className,
}: {
  tool: InstrumentationToolId;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 font-mono text-[11px] leading-none text-muted-foreground",
        className
      )}
    >
      [{sourceTagLabel(tool)}]
    </span>
  );
}

/**
 * Etiqueta de una cifra que no viene de una sola herramienta.
 *
 * El ROAS blended, por ejemplo, cruza el revenue de la pasarela con el spend de
 * Meta. Decir sólo `[Meta]` sería mentir sobre la mitad del número.
 */
export function CompositeSourceTag({
  parts,
  className,
}: {
  parts: string[];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 font-mono text-[11px] leading-none text-muted-foreground",
        className
      )}
    >
      [{parts.join(" + ")}]
    </span>
  );
}
