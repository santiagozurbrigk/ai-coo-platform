"use client";

import { cn } from "@ai-coo/ui";
import { CONVERSATION_TAG_CONFIG } from "@/constants/conversation-tags";
import type { ConversationTagId } from "@/types/sales";

const TAG_IDS = Object.keys(CONVERSATION_TAG_CONFIG) as ConversationTagId[];

const selectClass =
  "h-9 w-full max-w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white/90 outline-none ring-primary/30 focus:ring-2";

export function ConversationTagSelect({
  value,
  onChange,
}: {
  value: ConversationTagId | null | undefined;
  onChange: (tag: ConversationTagId) => void;
}) {
  return (
    <select
      className={cn(selectClass)}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value as ConversationTagId;
        if (v) onChange(v);
      }}
    >
      <option value="" disabled>
        Seleccionar etiqueta…
      </option>
      {TAG_IDS.map((id) => (
        <option key={id} value={id}>
          {CONVERSATION_TAG_CONFIG[id].label}
        </option>
      ))}
    </select>
  );
}
