"use client";

import { useState } from "react";
import { cn } from "@ai-coo/ui";
import { CONVERSATION_TAG_FILTERS } from "@/constants/conversation-tags";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation, ConversationTagId } from "@/types/sales";
import { ConversationStatusBadge } from "./conversation-status-badge";
import { ConversationTagBadge } from "./conversation-tag-badge";

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [tagFilter, setTagFilter] = useState<ConversationTagId | "all">("all");

  const filtered =
    tagFilter === "all"
      ? conversations
      : conversations.filter((c) => c.tag === tagFilter);

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden border-r border-border bg-card">
      <div className="shrink-0 border-b border-border px-3 py-3 space-y-3">
        <p className="px-1 text-xs font-medium text-muted-foreground">
          {filtered.length} conversaciones
        </p>
        <div className="flex max-w-full gap-1.5 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:thin]">
          {CONVERSATION_TAG_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTagFilter(f.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-2xs font-medium transition-colors",
                tagFilter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
                selectedId === c.id &&
                  "border-l-2 border-l-primary bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="truncate text-sm font-medium">{c.leadName}</span>
                {c.unread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {c.lastMessage}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {c.tag && <ConversationTagBadge tag={c.tag} />}
                <ConversationStatusBadge status={c.status} />
                <span className="ml-auto text-2xs text-muted-foreground/80">
                  {formatRelativeTime(c.lastMessageAt)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
