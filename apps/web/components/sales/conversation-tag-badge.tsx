import { cn } from "@ai-coo/ui";
import { CONVERSATION_TAG_CONFIG } from "@/constants/conversation-tags";
import type { ConversationTagId } from "@/types/sales";

export function ConversationTagBadge({ tag }: { tag: ConversationTagId }) {
  const config = CONVERSATION_TAG_CONFIG[tag];
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-2xs font-medium",
        config.className
      )}
      style={config.style}
    >
      {config.label}
    </span>
  );
}
