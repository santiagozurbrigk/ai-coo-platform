"use client";

import { NotchedCard, cn } from "@ai-coo/ui";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation, ConversationTagId } from "@/types/sales";
import { ConversationTagSelect } from "./conversation-tag-select";

export function ConversationThread({
  conversation,
  onTagChange,
}: {
  conversation: Conversation;
  onTagChange?: (tag: ConversationTagId) => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <NotchedCard
        tab={<span className="truncate">{conversation.leadName}</span>}
        className="shrink-0 rounded-none border-0 border-b border-border shadow-none"
      >
        {onTagChange ? (
          <div className="min-w-0 max-w-full">
            <p className="mb-2 text-micro text-muted-foreground">Etiqueta</p>
            <ConversationTagSelect
              value={conversation.tag}
              onChange={onTagChange}
            />
          </div>
        ) : null}
      </NotchedCard>
      <div className="min-h-0 flex-1 space-y-[var(--space-card-sm)] overflow-y-auto p-[var(--space-card-sm)]">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex max-w-[85%] flex-col gap-1",
              msg.sender === "team" ? "ml-auto items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "rounded-[var(--radius-md)] px-[var(--space-card-sm)] py-2 text-body",
                msg.sender === "team"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {msg.content}
            </div>
            <span className="text-2xs text-muted-foreground">
              {formatRelativeTime(msg.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
