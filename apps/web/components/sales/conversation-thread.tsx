"use client";

import { cn } from "@ai-coo/ui";
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
      <div className="shrink-0 space-y-3 border-b border-white/[0.06] px-4 py-3">
        <p className="truncate font-medium">{conversation.leadName}</p>
        {onTagChange && (
          <div className="min-w-0 max-w-full">
            <p className="mb-2 text-2xs text-white/45">Etiqueta</p>
            <ConversationTagSelect
              value={conversation.tag}
              onChange={onTagChange}
            />
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
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
                "rounded-lg px-3 py-2 text-sm",
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
