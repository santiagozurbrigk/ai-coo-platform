import type { ConversationTagId } from "@/types/sales";

const pill =
  "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium";

export const CONVERSATION_TAG_CONFIG: Record<
  ConversationTagId,
  { label: string; className: string }
> = {
  "muy-calificado": {
    label: "Muy calificado",
    className: `${pill} border-emerald-500/25 bg-emerald-500/10 text-emerald-400`,
  },
  calificado: {
    label: "Calificado",
    className: `${pill} border-teal-500/25 bg-teal-500/10 text-teal-300`,
  },
  descalificado: {
    label: "Descalificado",
    className: `${pill} border-orange-500/25 bg-orange-500/10 text-orange-300`,
  },
  "muy-descalificado": {
    label: "Muy descalificado",
    className: `${pill} border-red-400/25 bg-red-500/10 text-red-400`,
  },
  agendado: {
    label: "Agendado",
    className: `${pill} border-blue-400/25 bg-blue-500/10 text-blue-300`,
  },
  closeado: {
    label: "Closeado",
    className: `${pill} border-purple-400/25 bg-purple-500/10 text-purple-300`,
  },
  "no-closeado": {
    label: "No closeado",
    className: `${pill} border-white/12 bg-white/[0.06] text-white/50`,
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
