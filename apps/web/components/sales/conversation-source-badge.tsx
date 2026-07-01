import { cn } from "@ai-coo/ui";
import type { ConversationSource } from "@/types/sales";

const CONVERSATION_SOURCE_BADGE: Record<
  Exclude<ConversationSource, "manual">,
  {
    label: string;
    hex: string;
    borderClass: string;
    bgClass: string;
    textClass: string;
    logoSrc: string;
  }
> = {
  whatsapp: {
    label: "WhatsApp",
    hex: "#25D366",
    borderClass: "border-[#25D366]/25",
    bgClass: "bg-[#25D366]/12",
    textClass: "text-[#25D366]",
    logoSrc: "/integrations/whatsapp.svg",
  },
  instagram: {
    label: "Instagram",
    hex: "#C13584",
    borderClass: "border-[#C13584]/25",
    bgClass: "bg-[#C13584]/15",
    textClass: "text-[#C13584]",
    logoSrc: "/integrations/instagram.svg",
  },
  manychat: {
    label: "ManyChat",
    hex: "#0084FF",
    borderClass: "border-[#0084FF]/25",
    bgClass: "bg-[#0084FF]/12",
    textClass: "text-[#0084FF]",
    logoSrc: "/integrations/manychat.svg",
  },
};

function SourceIcon({
  logoSrc,
  hex,
  className,
}: {
  logoSrc: string;
  hex: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0", className)}
      style={{
        backgroundColor: hex,
        WebkitMaskImage: `url(${logoSrc})`,
        maskImage: `url(${logoSrc})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function ConversationSourceBadge({
  source,
  showLabel = true,
  className,
}: {
  source?: ConversationSource | null;
  showLabel?: boolean;
  className?: string;
}) {
  if (!source || source === "manual") return null;

  const config = CONVERSATION_SOURCE_BADGE[source];

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-[var(--radius-pill)] border px-1.5 py-0.5 text-micro font-medium",
        config.borderClass,
        config.bgClass,
        config.textClass,
        className
      )}
      title={config.label}
    >
      <SourceIcon logoSrc={config.logoSrc} hex={config.hex} className="h-3 w-3" />
      {showLabel ? (
        <span className="truncate">{config.label}</span>
      ) : null}
    </span>
  );
}

export const CONVERSATION_SOURCE_FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "manychat", label: "ManyChat" },
] as const;

export type ConversationSourceFilter =
  (typeof CONVERSATION_SOURCE_FILTER_OPTIONS)[number]["value"];

export function getAvailableConversationSourceFilters(
  conversations: Array<{ source?: ConversationSource | null }>
): ConversationSourceFilter[] {
  const sources = new Set<ConversationSource>();
  for (const conversation of conversations) {
    const source = conversation.source ?? "manychat";
    if (source !== "manual") sources.add(source);
  }

  return CONVERSATION_SOURCE_FILTER_OPTIONS.filter(
    (option) => option.value === "all" || sources.has(option.value)
  ).map((option) => option.value);
}
