import type { CSSProperties } from "react";
import { categorySurface } from "@/lib/ui/category-badge";
import type { ConversationTagId } from "@/types/sales";

const pill =
  "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium";

/**
 * La escala de calificación (muy calificado → muy descalificado) usa colores de
 * estado: verde/teal/naranja/rojo significan qué tan bien va el lead, no qué
 * lead es. Los estados de flujo (agendado, closeado) no son parte de esa escala
 * y toman color de la paleta categórica.
 */
export const CONVERSATION_TAG_CONFIG: Record<
  ConversationTagId,
  { label: string; className: string; style?: CSSProperties }
> = {
  "muy-calificado": {
    label: "Muy calificado",
    className: `${pill} border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`,
  },
  calificado: {
    label: "Calificado",
    className: `${pill} border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300`,
  },
  descalificado: {
    // Ámbar y no naranja: el naranja es el acento de marca, y una pill de
    // "descalificado" en color de marca se lee como énfasis, no como bajada.
    label: "Descalificado",
    className: `${pill} border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300`,
  },
  "muy-descalificado": {
    label: "Muy descalificado",
    className: `${pill} border-red-400/25 bg-red-500/10 text-red-700 dark:text-red-400`,
  },
  agendado: {
    label: "Agendado",
    className: `${pill} border-blue-400/25 bg-blue-500/10 text-blue-700 dark:text-blue-300`,
  },
  closeado: {
    // Era violeta de la marca anterior. Índigo (slot 4) lo separa del azul de
    // "agendado" sin pisar el verde de la escala de calificación.
    label: "Closeado",
    className: pill,
    style: categorySurface(3),
  },
  "no-closeado": {
    label: "No closeado",
    className: `${pill} border-border bg-muted text-muted-foreground`,
  },
};

export const CONVERSATION_TAG_FILTERS: { id: ConversationTagId | "all"; label: string }[] =
  [
    { id: "all", label: "Todos" },
    { id: "muy-calificado", label: "Muy calificado" },
    { id: "calificado", label: "Calificado" },
    { id: "descalificado", label: "Descalificado" },
    { id: "muy-descalificado", label: "Muy descalificado" },
    { id: "agendado", label: "Agendado" },
    { id: "closeado", label: "Closeado" },
    { id: "no-closeado", label: "No closeado" },
  ];
