"use client";

import { cn } from "@ai-coo/ui";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation } from "@/types/sales";
import { ConversationStatusBadge } from "./conversation-status-badge";

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          {conversations.length} conversaciones
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/30",
                selectedId === c.id && "bg-muted/50 border-l-2 border-l-primary"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium truncate">{c.leadName}</span>
                {c.unread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {c.lastMessage}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <ConversationStatusBadge status={c.status} />
                <span className="text-2xs text-muted-foreground">
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
