"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Paperclip, Send, X } from "lucide-react";
import { Button, NotchedCard, cn } from "@ai-coo/ui";
import { formatRelativeTime } from "@/lib/format";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { Conversation, ConversationTagId } from "@/types/sales";
import { ConversationSourceBadge } from "./conversation-source-badge";
import { ConversationTagSelect } from "./conversation-tag-select";

const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

const REPLYABLE_SOURCES: ReadonlyArray<Conversation["source"]> = [
  "instagram",
  "whatsapp",
];

function ConversationComposer({ conversationId }: { conversationId: string }) {
  const { sendConversationMessage } = usePlatformData();
  const { push } = useToast();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = !sending && (text.trim().length > 0 || file !== null);

  const handlePickFile = (picked: File | null) => {
    if (picked && picked.size > MAX_ATTACHMENT_BYTES) {
      push({
        title: "Adjunto demasiado grande",
        description: "El máximo permitido es 15MB.",
        variant: "default",
      });
      return;
    }
    setFile(picked);
  };

  const handleSend = async () => {
    if (!canSend) return;
    const messageText = text;
    const attachment = file ?? undefined;
    setSending(true);
    setText("");
    setFile(null);
    try {
      await sendConversationMessage(conversationId, messageText, attachment);
    } catch (e) {
      // La inserción optimista ya fue revertida por el provider.
      setText(messageText);
      if (attachment) setFile(attachment);
      push({
        title: "No se pudo enviar",
        description: e instanceof Error ? e.message : "Intentá de nuevo.",
        variant: "default",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-card p-[var(--space-card-sm)]">
      {file ? (
        <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5 text-xs">
          <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 truncate">{file.name}</span>
          <button
            type="button"
            className="ml-auto shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => handlePickFile(null)}
            aria-label="Quitar adjunto"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            handlePickFile(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          disabled={sending}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Escribí una respuesta… (Enter para enviar)"
          rows={1}
          disabled={sending}
          className="max-h-32 min-h-10 w-full flex-1 resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0"
          disabled={!canSend}
          onClick={() => void handleSend()}
          aria-label="Enviar mensaje"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function ConversationThread({
  conversation,
  onTagChange,
}: {
  conversation: Conversation;
  onTagChange?: (tag: ConversationTagId) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canReply = REPLYABLE_SOURCES.includes(conversation.source);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.id, conversation.messages.length]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <NotchedCard
        tab={
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate">{conversation.leadName}</span>
            <ConversationSourceBadge source={conversation.source} />
          </div>
        }
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
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-[var(--space-card-sm)] overflow-y-auto p-[var(--space-card-sm)]"
      >
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
      {canReply ? (
        <ConversationComposer conversationId={conversation.id} />
      ) : null}
    </div>
  );
}
