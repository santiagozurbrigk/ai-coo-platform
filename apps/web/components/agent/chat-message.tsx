"use client";

import { Sparkles, User } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { AgentMessageActionType } from "@/types/agent";
import { ActionCard } from "./action-card";

export function ChatMessage({
  role,
  content,
  actionType,
  actionRefId,
}: {
  role: "user" | "assistant";
  content: string;
  actionType?: AgentMessageActionType | null;
  actionRefId?: string | null;
}) {
  return (
    <div className={cn("flex gap-3", role === "user" && "flex-row-reverse")}>
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          role === "assistant"
            ? "border border-violet-500/30 bg-violet-600/20"
            : "chat-message-user-avatar border border-border bg-muted"
        )}
      >
        {role === "assistant" ? (
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        ) : (
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <div className="flex max-w-[75%] flex-col gap-1">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            role === "assistant"
              ? "chat-message-assistant border text-foreground"
              : "bg-violet-600 text-white"
          )}
        >
          {content}
        </div>
        {actionType && actionRefId ? (
          <ActionCard action={actionType} refId={actionRefId} />
        ) : null}
      </div>
    </div>
  );
}
