"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { groupConversationsByDate } from "@/lib/agent/group-by-date";
import { paths } from "@/routes/paths";
import type { AgentConversation } from "@/types/agent";

export function ConversationHistory({
  conversations,
  onDelete,
}: {
  conversations: AgentConversation[];
  onDelete: (id: string) => void;
}) {
  const pathname = usePathname();
  const groups = groupConversationsByDate(conversations);

  if (groups.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-muted-foreground">
        Sin conversaciones aún
      </p>
    );
  }

  return (
    <div className="mb-4 flex flex-col gap-1">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {group.label}
          </p>
          {group.conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={pathname === paths.platform.agent.conversation(conv.id)}
              onDelete={onDelete}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onDelete,
}: {
  conversation: AgentConversation;
  isActive: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Link
        href={paths.platform.agent.conversation(conversation.id)}
        className="min-w-0 flex-1 truncate text-xs"
      >
        {conversation.title || "Nueva conversación"}
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void onDelete(conversation.id);
        }}
        className="rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
        aria-label="Eliminar conversación"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
