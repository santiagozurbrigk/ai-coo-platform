import { cn } from "@ai-coo/ui";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation } from "@/types/sales";

export function ConversationThread({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <p className="font-medium">{conversation.leadName}</p>
        <p className="text-xs text-muted-foreground">
          Setter: {conversation.setterName}
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex max-w-[85%] flex-col gap-1",
              msg.sender === "setter" ? "ml-auto items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                msg.sender === "setter"
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
